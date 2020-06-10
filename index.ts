import * as express from 'express'
import * as path from 'path'
import * as bodyParser from 'body-parser'
import * as http from 'http'
import * as fs from 'fs'
import * as https from 'https'
import { setRoutes } from './routes'
import { Client } from 'discord.js'
import { startDiscordBot } from './services/discord/bot-starter'
import { BaseHttpService, getAxiosErrorSummary } from './services/base-http-service'
import { MessagesHandlerService } from './services/discord/messages-handler-service'
import { MessagesService } from './services/discord/messages-service'
import { UsersService } from './services/discord/users-service'
import { ContactsService } from './services/intercom/contacts-service'
import { WebhooksHandlerService } from './services/intercom/webhooks-handler-service'
import { SyncUsersService } from './services/sync-users-service'
import { SyncConversationsService } from './services/sync-conversations-service'
import { ConversationsService } from './services/intercom/conversations-service'
import { GuildMembersChangeHandlerService } from './services/discord/guild-members-change-handler-service'
import { Config } from './config'
import { SerializedState } from './serialized-state'
import { AppUsersService } from './services/app-users-service'
import { AppIntercomAuthService } from './services/app-intercom-auth-service'
import { AppJobsService } from './services/app-jobs-service'
import { AppSerializedStateService } from './services/app-serialized-state-service'
import { IntervalJob } from './utils/interval-job'
import { DiscordSegmentsProvider } from './services/discord/discord-segments-provider'
import { BroadcastService, SegmentsProvider } from './services/broadcast-service'
import { resendConversationRepliesJobCallback } from './services/jobs/resend-conversation-replies-job'
import { broadcastScheduleJobCallback } from './services/jobs/broadcast-schedule-job'
import { BroadcastSerializedDataService } from './services/domain/broadcast-serialized-data-service'

const config: Config = require('./config.json')
const serializedState: SerializedState = require('./serialized-state.json')

if (Array.from('{{username}} bla {{username}}bla'.matchAll(/{{(\w+)}}/g)).length !== 2) {
    throw new Error('YOU SHOULD USE NODEJS V12+!!')
}

export interface Services {
    appUsersService: AppUsersService
    appIntercomAuthService: AppIntercomAuthService
    appJobsService: AppJobsService
    appSerializedStateService: AppSerializedStateService
    discordMessagesService: MessagesService
    discordUsersService: UsersService
    discordMessagesHandlerService: MessagesHandlerService
    discordGuildMembersChangeHandlerService: GuildMembersChangeHandlerService
    intercomContactsService: ContactsService
    intercomConversationsService: ConversationsService
    intercomWebhooksService: WebhooksHandlerService
    syncUsersService: SyncUsersService
    syncConversationsService: SyncConversationsService
    broadcastService: BroadcastService
    broadcastSerializedDataService: BroadcastSerializedDataService
}

function initServices(discordClient: Client): Services {
    const appUsersService = new AppUsersService(serializedState.users)
    const appJobsService = new AppJobsService([])
    const appSerializedStateService = new AppSerializedStateService(path.resolve(__dirname, './serialized-state.json'))
    const appIntercomAuthService = new AppIntercomAuthService(
        config.intercomClientID,
        config.intercomAppID
    )
    const discordMessagesService = new MessagesService(discordClient)
    const discordUsersService = new UsersService(discordClient)
    const intercomContactsService = new ContactsService(config.intercomApiUrl, config.intercomAppToken)
    const intercomConversationsService = new ConversationsService(
        config.intercomApiUrl,
        config.intercomAppToken,
        appSerializedStateService
    )
    const syncUsersService = new SyncUsersService(discordUsersService, intercomContactsService)
    const syncConversationsService = new SyncConversationsService(
        intercomContactsService,
        intercomConversationsService,
        discordMessagesService
    )
    const intercomWebhooksService = new WebhooksHandlerService(syncConversationsService)
    const messagesHandlerService = new MessagesHandlerService(syncConversationsService)
    const discordGuildMembersChangeHandlerService = new GuildMembersChangeHandlerService(
        appSerializedStateService,
        intercomContactsService,
        discordMessagesService
    )
    const discordsSegmentsProvider: SegmentsProvider = new DiscordSegmentsProvider(discordUsersService)
    const broadcastSerializedDataService = new BroadcastSerializedDataService(path.resolve(__dirname, './serialized-broadcasts-data.json'))
    const broadcastService = new BroadcastService(discordMessagesService, [discordsSegmentsProvider], broadcastSerializedDataService)
    return {
        appUsersService,
        appIntercomAuthService,
        appJobsService,
        appSerializedStateService,
        discordMessagesService,
        discordUsersService,
        intercomContactsService,
        intercomConversationsService,
        intercomWebhooksService,
        syncUsersService: syncUsersService,
        discordMessagesHandlerService: messagesHandlerService,
        syncConversationsService: syncConversationsService,
        discordGuildMembersChangeHandlerService,
        broadcastService,
        broadcastSerializedDataService
    }
}

async function start(): Promise<void> {
    BaseHttpService.generalErrorMiddlewares.push(((error, next) => {
        console.error(new Date().toISOString(), 'error', `BaseHttpService, Axios error:\n`, getAxiosErrorSummary(error))
    }))

    const discordClient = await startDiscordBot(config.discordBotToken)

    const services: Services = initServices(discordClient)
    const {discordMessagesHandlerService, discordGuildMembersChangeHandlerService} = services

    discordClient.on('message', discordMessagesHandlerService.handleMessage)
    discordClient.on('guildMemberAdd', discordGuildMembersChangeHandlerService.handleMemberAdd)
    discordClient.on('guildMemberRemove', discordGuildMembersChangeHandlerService.handleMemberRemove)

    let resendConversationRepliesJob = new IntervalJob(60 * 1000)
    resendConversationRepliesJob.startInterval(async () => await resendConversationRepliesJobCallback(services))
    services.appJobsService.setNewJob(resendConversationRepliesJob)

    let broadcastSchedulingJob = new IntervalJob(15 * 1000)
    broadcastSchedulingJob.startInterval(async () => await broadcastScheduleJobCallback(services))
    services.appJobsService.setNewJob(broadcastSchedulingJob)

    return startControllerServer(services)
}

async function startControllerServer(services: Services): Promise<void> {
    const httpPort = process.env.DISCORD_INTERCOM_HTTP_PORT || config.httpPort || 8442
    const httpsPort = process.env.DISCORD_INTERCOM_HTTPS_PORT || config.httpsPort
    const publicCertRelativePath = process.env.DISCORD_INTERCOM_PUB_CERT_PATH || config.publicCertRelativePath
    const privateCertKeyRelativePath = process.env.DISCORD_INTERCOM_PRIV_CERT_PATH || config.privateCertKeyRelativePath

    const appServer: express.Express = express()

    appServer.use(express.static(path.join(__dirname, './static')))
    appServer.use(bodyParser.json())
    appServer.all('*', (req, res, next) => {
        console.debug(new Date().toISOString(), 'info', req.method, req.path)
        res.set({
            'Access-Control-Allow-Origin': '*',
            'Access-Control-Allow-Headers': 'Content-Type, X-Requested-With, Authorization',
            'Access-Control-Allow-Methods': 'GET, POST, DELETE, PUT, PATCH',
        })
        next()
    })

    setRoutes(appServer, services)

    appServer.use((err, req, res, next) => {
        console.error(new Date().toISOString(), 'error', err)
        res.status(500).send({error: err.message})
    })

    return new Promise(resolve => {
        http.createServer(appServer).listen(httpPort, () => {
            console.debug(new Date().toISOString(), 'info', 'Discord controller http running on port:', httpPort)

            if (!httpsPort
                || !publicCertRelativePath || !fs.existsSync(path.resolve(__dirname, publicCertRelativePath))
                || !privateCertKeyRelativePath || !fs.existsSync(path.resolve(__dirname, privateCertKeyRelativePath))) {
                return resolve()
            }

            https.createServer({
                    cert: fs.readFileSync(path.resolve(__dirname, publicCertRelativePath), 'utf8'),
                    key: fs.readFileSync(path.resolve(__dirname, privateCertKeyRelativePath), 'utf8'),
                }, appServer)
                .listen(httpsPort, () => {
                    console.debug(new Date().toISOString(), 'info', 'Discord controller https running on port:', httpsPort)
                    return resolve()
                });
        })
    })
}

start()

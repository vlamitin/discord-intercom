import * as express from 'express'
import * as path from 'path'
import * as bodyParser from 'body-parser'
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
import { processPromises } from './utils/promise-utils'
import { DiscordSegmentsProvider } from './services/discord/discord-segments-provider'
import { BroadcastService, SegmentsProvider } from './services/broadcast-service'
import { resendConversationRepliesJobCallback } from './services/jobs/resend-conversation-replies-job'

const config: Config = require('./config.json')
const serializedState: SerializedState = require('./serialized-state.json')

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
}

function initServices(discordClient: Client): Services {
    const appUsersService = new AppUsersService(serializedState.users)
    const appJobsService = new AppJobsService([])
    const appSerializedStateService = new AppSerializedStateService(serializedState, path.resolve(__dirname, './serialized-state.json'))
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
    const discordsSegmentsProvider: SegmentsProvider = new DiscordSegmentsProvider(discordUsersService);
    const broadcastService = new BroadcastService(discordMessagesService, [discordsSegmentsProvider]);

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
    }
}

async function start(): Promise<void> {
    BaseHttpService.generalErrorMiddlewares.push(((error, next) => {
        console.error(new Date().toISOString(), 'error', `BaseHttpService, Axios error:\n`, getAxiosErrorSummary(error))
    }))

    const discordClient = await startDiscordBot(config.discordBotToken)

    const services: Services = initServices(discordClient)
    const { discordMessagesHandlerService, discordGuildMembersChangeHandlerService } = services

    discordClient.on('message', discordMessagesHandlerService.handleMessage)
    discordClient.on('guildMemberAdd', discordGuildMembersChangeHandlerService.handleMemberAdd)
    discordClient.on('guildMemberRemove', discordGuildMembersChangeHandlerService.handleMemberRemove)

    let resendConversationRepliesJob = new IntervalJob(60 * 1000)
    resendConversationRepliesJob.startInterval(async () => await resendConversationRepliesJobCallback(services))

    services.appJobsService.setNewJob(resendConversationRepliesJob)

    return startControllerServer(services)
}

async function startControllerServer(services: Services): Promise<void> {
    const port = process.env.API_PORT || config.port || 3002

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
        res.status(500).send({ error: err.message })
    })

    return new Promise(resolve => {
        appServer.listen(port, () => {
            console.debug(new Date().toISOString(), 'info', 'Discord controller running on port:', port)
            resolve()
        })
    })
}

start()

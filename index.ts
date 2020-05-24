import * as express from 'express'
import * as path from 'path'
import * as bodyParser from 'body-parser'
import { setRoutes } from './routes'
import { Client } from 'discord.js'
import { startDiscordBot } from './discord/bot-starter'
import { BaseHttpService, getAxiosErrorSummary } from './base-http-service'
import { MessagesHandlerService } from './discord/messages-handler-service'
import { MessagesService } from './discord/messages-service'
import { UsersService } from './discord/users-service'
import { ContactsService } from './intercom/contacts-service'
import { WebhooksHandlerService } from './intercom/webhooks-handler-service'
import { SyncUsersService } from './sync-users-service'
import { SyncConversationsService } from './sync-conversations-service'
import { ConversationsService } from './intercom/conversations-service'
import { GuildMembersChangeHandlerService } from './discord/guild-members-change-handler-service'
import { Config } from './config'
import { SerializedState } from './serialized-state'
import { AppUsersService } from './app-users-service'
import { AppIntercomAuthService } from './app-intercom-auth-service'

const config: Config = require('./config.json')
const serializedState: SerializedState = require('./serialized-state.json')

export interface Services {
    appUsersService: AppUsersService
    appIntercomAuthService: AppIntercomAuthService
    discordMessagesService: MessagesService
    discordUsersService: UsersService
    discordMessagesHandlerService: MessagesHandlerService
    discordGuildMembersChangeHandlerService: GuildMembersChangeHandlerService
    intercomContactsService: ContactsService
    intercomConversationsService: ConversationsService
    intercomWebhooksService: WebhooksHandlerService
    syncUsersService: SyncUsersService
    syncConversationsService: SyncConversationsService
}

function initServices(discordClient: Client): Services {
    const appUsersService = new AppUsersService(serializedState.users)
    const appIntercomAuthService = new AppIntercomAuthService(
        config.intercomClientID,
        config.intercomAppID
    )
    const discordMessagesService = new MessagesService(discordClient)
    const discordUsersService = new UsersService(discordClient)
    const intercomContactsService = new ContactsService(config.intercomApiUrl, config.intercomAppToken)
    const intercomConversationsService = new ConversationsService(config.intercomApiUrl, config.intercomAppToken)
    const syncUsersService = new SyncUsersService(discordUsersService, intercomContactsService)
    const syncConversationsService = new SyncConversationsService(
        intercomContactsService,
        intercomConversationsService,
        discordMessagesService
    )
    const intercomWebhooksService = new WebhooksHandlerService(syncConversationsService)
    const messagesHandlerService = new MessagesHandlerService(syncConversationsService)
    const discordGuildMembersChangeHandlerService = new GuildMembersChangeHandlerService(
        serializedState.welcomeMessages,
        intercomContactsService,
        discordMessagesService
    )

    return {
        appUsersService,
        appIntercomAuthService,
        discordMessagesService,
        discordUsersService,
        intercomContactsService,
        intercomConversationsService,
        intercomWebhooksService,
        syncUsersService: syncUsersService,
        discordMessagesHandlerService: messagesHandlerService,
        syncConversationsService: syncConversationsService,
        discordGuildMembersChangeHandlerService,
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

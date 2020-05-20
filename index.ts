import * as express from 'express'
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
import { UsersCopyingService } from './users-copying-service'
import { DiscordIntercomConversationService } from './discord-intercom-conversation-service'
import { ConversationsService } from './intercom/conversations-service'

const config = require('./config.json')

export interface Services {
    discordMessagesService: MessagesService
    discordUsersService: UsersService
    intercomContactsService: ContactsService
    intercomConversationsService: ConversationsService
    intercomWebhooksService: WebhooksHandlerService
    usersCopyingService: UsersCopyingService
    messagesHandlerService: MessagesHandlerService
    discordIntercomConversationService: DiscordIntercomConversationService
}

function initServices(discordClient: Client): Services {
    const discordMessagesService = new MessagesService(discordClient)
    const discordUsersService = new UsersService(discordClient)
    const intercomContactsService = new ContactsService(config.intercomApiUrl, config.intercomAppToken)
    const intercomConversationsService = new ConversationsService(config.intercomApiUrl, config.intercomAppToken)
    const usersCopyingService = new UsersCopyingService(discordUsersService, intercomContactsService)
    const discordIntercomConversationService = new DiscordIntercomConversationService(
        intercomContactsService,
        intercomConversationsService,
        discordMessagesService
    )
    const intercomWebhooksService = new WebhooksHandlerService(discordIntercomConversationService)
    const messagesHandlerService = new MessagesHandlerService(discordIntercomConversationService)

    return {
        discordMessagesService,
        discordUsersService,
        intercomContactsService,
        intercomConversationsService,
        intercomWebhooksService,
        usersCopyingService,
        messagesHandlerService,
        discordIntercomConversationService,
    }
}

async function start(): Promise<void> {
    BaseHttpService.generalErrorMiddlewares.push(((error, next) => {
        console.error(new Date().toISOString(), 'error', `BaseHttpService, Axios error:\n`, getAxiosErrorSummary(error))
    }))

    const discordClient = await startDiscordBot(config.discordBotToken)

    const services: Services = initServices(discordClient)
    const { messagesHandlerService } = services

    discordClient.on("message", messagesHandlerService.handleMessage)

    return startControllerServer(services)
}

async function startControllerServer(services: Services): Promise<void> {
    const port = process.env.API_PORT || config.port || 3002

    const appServer: express.Express = express()

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

import * as express from 'express'
import { Client } from 'discord.js'
import { MessagesService } from './discord/messages-service'
import { WebhooksService } from './intercom/webhooks-service'
import { UsersService } from './discord/users-service'
import { ContactsService } from './intercom/contacts-service'
import { Config } from './config'
import { UsersCopyingService } from './users-copying-service'

export function setRoutes(
    controllerServer: express.Express,
    discordClient: Client,
    config: Config
) {
    const discordMessagesService = new MessagesService(discordClient)
    const discordUsersService = new UsersService(discordClient)
    const intercomContactsService = new ContactsService(config.intercomApiUrl, config.intercomAppToken)
    const intercomWebhooksService = new WebhooksService()
    const usersCopyingService = new UsersCopyingService(discordUsersService, intercomContactsService)

    controllerServer.get('/api/ping',  (req: express.Request, res: express.Response, next: express.NextFunction) => {
        res.status(200).send(JSON.stringify({
            pong: true
        }))
    })

    controllerServer.get('/api/discord/users', (req: express.Request, res: express.Response, next: express.NextFunction) => {
        const users = discordUsersService.getAllUsers() || []

        res.status(200).send(JSON.stringify(users))
    })

    /* req.body should be { message: string } */
    controllerServer.post('/api/discord/messages/broadcast',  async (req: express.Request, res: express.Response, next: express.NextFunction) => {
        await discordMessagesService.broadcast(req.body.message)

        res.status(200).send(JSON.stringify({ success: true }))
    })

    controllerServer.post('/api/intercom/hooks', async (req: express.Request, res: express.Response, next: express.NextFunction) => {
        await intercomWebhooksService.handleHook(req.body)

        res.status(200).send(JSON.stringify({
            handled: true
        }))
    })

    controllerServer.post('/api/integration/copy-discord-users-to-intercom', async (req: express.Request, res: express.Response, next: express.NextFunction) => {
        const result = await usersCopyingService.discordToIntercom()

        res.status(200).send(JSON.stringify(result))
    })
}

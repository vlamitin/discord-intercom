import * as express from 'express'
import { Services } from './index'

export function setRoutes(
    controllerServer: express.Express,
    services: Services
) {
    const {
        discordMessagesService,
        discordUsersService,
        intercomWebhooksService,
        usersCopyingService,
    } = services

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
        await discordMessagesService.broadcastMessage(req.body.message)

        res.status(200).send(JSON.stringify({ success: true }))
    })

    controllerServer.post('/api/intercom/hooks', (req: express.Request, res: express.Response, next: express.NextFunction) => {
        intercomWebhooksService.handleHook(req.body)

        res.status(200).send(JSON.stringify({
            handled: true
        }))
    })

    controllerServer.post('/api/integration/copy-discord-users-to-intercom', async (req: express.Request, res: express.Response, next: express.NextFunction) => {
        const result = await usersCopyingService.discordToIntercom()

        res.status(200).send(JSON.stringify(result))
    })
}

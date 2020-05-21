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
        syncUsersService,
        discordGuildMembersChangeHandlerService,
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

    controllerServer.get('/api/discord/guild/welcome-messages',  async (req: express.Request, res: express.Response, next: express.NextFunction) => {
        res.status(200).send(JSON.stringify({
            messages: discordGuildMembersChangeHandlerService.welcomeMessages
        }))
    })

    /* req.body should be
    {
        "messages": [{
            "content": "Welcome our new user {{username}}!",
            "channel": "general"
        }]
    }
    *  */
    controllerServer.post('/api/discord/guild/welcome-messages',  async (req: express.Request, res: express.Response, next: express.NextFunction) => {
        discordGuildMembersChangeHandlerService.setWelcomeMessages(req.body.messages)

        res.status(200).send(JSON.stringify({
            messages: discordGuildMembersChangeHandlerService.welcomeMessages
        }))
    })

    /* intercom sometimes pings with head request */
    controllerServer.head('/api/intercom/hooks', (req: express.Request, res: express.Response, next: express.NextFunction) => {
        res.status(200).send(JSON.stringify({
            handled: true
        }))
    })

    controllerServer.post('/api/intercom/hooks', (req: express.Request, res: express.Response, next: express.NextFunction) => {
        intercomWebhooksService.handleHook(req.body)

        res.status(200).send(JSON.stringify({
            handled: true
        }))
    })

    controllerServer.post('/api/integration/copy-discord-users-to-intercom', async (req: express.Request, res: express.Response, next: express.NextFunction) => {
        const result = await syncUsersService.addDiscordUsersAsIntercomContacts()

        res.status(200).send(JSON.stringify(result))
    })
}

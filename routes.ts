import * as express from 'express'
import { Services } from './index'

export function setRoutes(
    controllerServer: express.Express,
    services: Services
) {
    const {
        appUsersService,
        appIntercomAuthService,
        discordMessagesService,
        discordUsersService,
        intercomWebhooksService,
        syncUsersService,
        discordGuildMembersChangeHandlerService,
        broadcastService,
        appSerializedStateService
    } = services

    const authMiddleWare = (req: express.Request, res: express.Response, next: express.NextFunction) => {
        try {
            const token = req.headers.authorization
            const user = appUsersService.getUserByToken(token)

            if (user) {
                next()
            } else {
                throw new Error('bad token')
            }
        } catch (e) {
            res.status(401)
                .json({
                    error: 'Bad token'
                })
        }
    }

    const intercomWebhookAuthMiddleware = (req: express.Request, res: express.Response, next: express.NextFunction) => {
        try {
            const subscriptionId: string = req.headers['intercom-webhook-subscription-id'] as string

            if (appIntercomAuthService.checkSubscriptionId(subscriptionId)) {
                next()
            } else {
                throw new Error('Bad Subscription-Id')
            }
        } catch (e) {
            res.status(401)
                .json({
                    error: 'Bad Subscription-Id'
                })
        }
    }

    /* req.body should be
    {
        "login": "user",
        "password": "password"
    }
    *  */
    controllerServer.post('/api/login', (req: express.Request, res: express.Response, next: express.NextFunction) => {
        const {login, password} = req.body
        const token = appUsersService.getTokenByCreds(login, password)
        if (token) {
            res.status(200).send(JSON.stringify({
                token
            }))
        } else {
            res.status(401).json({
                error: 'Bad creds'
            })
        }
    })

    controllerServer.get('/api/ping', (req: express.Request, res: express.Response, next: express.NextFunction) => {
        res.status(200).send(JSON.stringify({
            pong: true
        }))
    })

    controllerServer.get('/api/discord/users', authMiddleWare, (req: express.Request, res: express.Response, next: express.NextFunction) => {
        const users = discordUsersService.getAllUsers() || []

        res.status(200).send(JSON.stringify(users))
    })

    controllerServer.get('/api/discord/roles', authMiddleWare, (req: express.Request, res: express.Response, next: express.NextFunction) => {
        const roles = discordUsersService.getAllRoles() || []

        res.status(200).send(JSON.stringify(roles))
    })

    /* req.body should be
    {
        "message": "bla",
        segments: [],
        "attachments": [{
            "name": "file.txt",
            "url": "https://cdn.com/file.txt"
        }],
        date: "2020-06-07T16:49"
    }
     */
    controllerServer.post('/api/discord/messages/broadcast', authMiddleWare, async (req: express.Request, res: express.Response, next: express.NextFunction) => {
        await broadcastService.broadcast(req.body.message.split('\n'), req.body.attachments, req.body.segments, req.body.date)

        res.status(200).send(JSON.stringify({success: true}))
    })

    controllerServer.get('/api/discord/guild/welcome-messages', authMiddleWare, async (req: express.Request, res: express.Response, next: express.NextFunction) => {
        res.json({
            messages: appSerializedStateService.state.welcomeMessages
        })
    })

    /* req.body should be
    {
        "messages": [{
            "content": "Welcome our new user {{username}}!",
            "channel": "general"
        }]
    }
    *  */
    controllerServer.post('/api/discord/guild/welcome-messages', authMiddleWare, async (req: express.Request, res: express.Response, next: express.NextFunction) => {
        let currentState = appSerializedStateService.state
        appSerializedStateService.setState({...currentState, welcomeMessages: req.body.messages})
        res.json({
            messages: appSerializedStateService.state.welcomeMessages
        })
    })

    controllerServer.post('/api/integration/copy-discord-users-to-intercom', authMiddleWare, async (req: express.Request, res: express.Response, next: express.NextFunction) => {
        const result = await syncUsersService.addDiscordUsersAsIntercomContacts()

        res.status(200).send(JSON.stringify(result))
    })

    /* intercom sometimes pings with head request */
    controllerServer.head('/api/intercom/hooks', (req: express.Request, res: express.Response, next: express.NextFunction) => {
        res.status(200).send(JSON.stringify({
            handled: true
        }))
    })

    controllerServer.post('/api/intercom/hooks', intercomWebhookAuthMiddleware, (req: express.Request, res: express.Response, next: express.NextFunction) => {
        intercomWebhooksService.handleHook(req.body)

        res.status(200).send(JSON.stringify({
            handled: true
        }))
    })
}

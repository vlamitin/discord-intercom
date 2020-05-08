import * as express from 'express'
import { Client, User } from 'discord.js'

export class UsersService {
    discordClient: Client

    constructor(discordClient: Client) {
        this.discordClient = discordClient
    }

    /* req.body should be [{ channelId: string, message: 'string' }] */
    broadcast = async (req: express.Request, res: express.Response, next: express.NextFunction) => {
        const promises = []
        this.discordClient.users.cache.forEach(((user: User, key) => {
            if (user.bot) {
                return
            }

            promises.push(async () => {
                console.log('sending message to ', user.username + ' ...')
                try {
                    await user.send(req.body[0].message)
                } catch (e) {
                    console.warn(e)
                }
            })
        }))

        await Promise.all(promises)

        res.status(200).send('hello')
    }
}

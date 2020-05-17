import * as express from 'express'
import { Client, User } from 'discord.js'

export class MessagesService {
    discordClient: Client

    constructor(discordClient: Client) {
        this.discordClient = discordClient
    }

    broadcast = async (message: string) => {
        const promises = []
        console.debug(new Date().toISOString(), 'info', 'Users found: ', this.discordClient.users.cache.size);
        this.discordClient.users.cache.forEach(((user: User, key) => {
            if (user.bot) {
                return
            }

            promises.push(async () => {
                console.debug(new Date().toISOString(), 'info', 'sending message to ', user.username + ' ...')
                try {
                    await user.send(message)
                } catch (e) {
                    console.error(new Date().toISOString(), 'error', 'error while sending message to ', user.username, e)
                }
            })
        }))

        return Promise.all(promises.map(pr => pr()))
    }
}

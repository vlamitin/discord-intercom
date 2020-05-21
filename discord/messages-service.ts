import { Client, Message, User } from 'discord.js'

export class MessagesService {
    discordClient: Client

    constructor(discordClient: Client) {
        this.discordClient = discordClient
    }

    broadcastMessage = async (message: string) => {
        const promises = []
        console.debug(new Date().toISOString(), 'info', 'Users found: ', this.discordClient.users.cache.size)
        this.discordClient.users.cache.forEach(((user: User, key) => {
            if (user.bot) {
                return
            }

            promises.push(async () => this.sendMessageToUser(user, message))
        }))

        return Promise.all(promises.map(pr => pr()))
    }

    sendMessage = (discordUserId: string, message: string): Promise<Message | void> => {
        const discordUser: User = this.discordClient.users.cache.find(user => user.id === discordUserId)
        if (!discordUser) {
            console.debug(new Date().toISOString(), 'warn', 'no user found with id: ', discordUserId)
            return
        }

        return this.sendMessageToUser(discordUser, message)
    }

    sendMessageToUser = async (user: User, message: string): Promise<Message | void> => {
        if (!message) {
            console.debug(new Date().toISOString(), 'error', 'cannot send empty message!')
            return
        }

        console.debug(new Date().toISOString(), 'info', 'sending message to ', user.username + ' ...')
        try {
            return user.send(message)
        } catch (e) {
            console.error(new Date().toISOString(), 'error', 'error while sending message to ', user.username, e)
        }
    }
}

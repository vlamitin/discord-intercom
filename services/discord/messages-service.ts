import { Client, Message, MessageAttachment, User } from 'discord.js'
import { Attachment } from './domain/attachment'
import { processPromises } from '../../utils/promise-utils'
import { fillMessageWithUserProps } from './message-utils'

export class MessagesService {
    discordClient: Client

    constructor(discordClient: Client) {
        this.discordClient = discordClient
    }

    broadcastMessage = async (messages: string[], attachments: Attachment[], userIds: Set<string>) => {
        const promises = []
        console.debug(new Date().toISOString(), 'info', 'Users found: ', this.discordClient.users.cache.size)
        this.discordClient.users.cache.forEach(((user: User, key) => {
            if (user.bot) {
                return
            }
            if (!userIds.has(user.id)) {
                return
            }
            promises.push(async () => this.sendMessageToUser(user, messages, attachments))
        }))

        return processPromises(promises, 10)
    }

    sendMessage = (
        discordUserId: string,
        textRows: string[],
        attachments: Attachment[]
    ): Promise<Message | void> => {
        const discordUser: User = this.discordClient.users.cache.find(user => user.id === discordUserId)
        if (!discordUser) {
            console.warn(new Date().toISOString(), 'warn', 'no user found with id: ', discordUserId)
            return
        }

        return this.sendMessageToUser(discordUser, textRows, attachments)
    }

    sendMessageToUser = async (
        user: User,
        textRows: string[],
        attachments: Attachment[]
    ): Promise<Message | void> => {
        if (textRows.length === 0 && attachments.length === 0) {
            console.debug(new Date().toISOString(), 'error', 'cannot send empty message!')
            return
        }

        const textRowsWithUserProps = textRows.map(row => fillMessageWithUserProps(row, user))

        console.debug(new Date().toISOString(), 'info', 'sending message to ', user.username + ' ...')
        try {
            return user.send(textRowsWithUserProps, attachments.map(attachment => new MessageAttachment(
                attachment.url,
                attachment.name,
            )))
        } catch (e) {
            console.error(new Date().toISOString(), 'error', 'error while sending message to ', user.username, e)
        }
    }
}

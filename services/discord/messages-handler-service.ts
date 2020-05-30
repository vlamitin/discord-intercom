import { Message } from 'discord.js'
import { SyncConversationsService } from '../sync-conversations-service'

export class MessagesHandlerService {
    syncConversationsService: SyncConversationsService

    constructor(syncConversationsService: SyncConversationsService) {
        this.syncConversationsService = syncConversationsService
    }

    handleMessage = async (message: Message) => {
        const attachments: string[] = message.attachments?.map(attachment => attachment.url) || []

        if (message.author.bot) {
            return
        }

        if (message.channel.type !== 'dm') {
            return
        }

        await this.syncConversationsService
            .sendMessageFromDiscordToIntercomAdmin(
                message.author.id,
                message.author.username,
                message.content,
                attachments
            )
    }
}

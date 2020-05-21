import { Message } from 'discord.js'
import { SyncConversationsService } from '../sync-conversations-service'

export class MessagesHandlerService {
    syncConversationsService: SyncConversationsService

    constructor(syncConversationsService: SyncConversationsService) {
        this.syncConversationsService = syncConversationsService
    }

    handleMessage = async (message: Message) => {
        // console.log(`new message from ${message.author.username} "${message.content}"`)
        //
        // console.log('message.author.id', message.author.id)
        // console.log('message.channel.id', message.channel.id)
        // console.log('message.channel.type', message.channel.type)
        //
        // console.log('message.type', message.type)
        //
        // console.log(JSON.stringify(message))

        if (message.author.bot) {
            return
        }

        if (message.channel.type !== 'dm') {
            return
        }

        await this.syncConversationsService
            .sendMessageFromDiscordToIntercomAdmin(
                message.author.id,
                message.content
            )
    }
}

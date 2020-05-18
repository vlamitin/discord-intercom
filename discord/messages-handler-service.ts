import { Message } from 'discord.js'
import { DiscordIntercomConversationService } from '../discord-intercom-conversation-service'

export class MessagesHandlerService {
    discordIntercomConversationService: DiscordIntercomConversationService

    constructor(discordIntercomConversationService: DiscordIntercomConversationService) {
        this.discordIntercomConversationService = discordIntercomConversationService
    }

    handleMessage = async (message: Message) => {
        console.log(`new message from ${message.author.username} "${message.content}"`)

        if (!message.author.bot) {
            await this.discordIntercomConversationService
                .sendMessageFromDiscordToIntercomAdmin(
                    message.author.id,
                    message.content
                )
        }
    }
}

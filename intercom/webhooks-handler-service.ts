import { WebhookEvent, WebhookTopic } from './domain/webhook-event'
import { DiscordIntercomConversationService } from '../discord-intercom-conversation-service'

export class WebhooksHandlerService {
    discordIntercomConversationService: DiscordIntercomConversationService

    constructor(discordIntercomConversationService: DiscordIntercomConversationService) {
        this.discordIntercomConversationService = discordIntercomConversationService
    }

    handleHook = async (intercomEvent: WebhookEvent): Promise<void> => {
        console.warn(new Date().toISOString(), 'info', 'Handling intercom event with topic, ', intercomEvent.topic, ' ...')
        // console.log('intercomEvent', JSON.stringify(intercomEvent))

        switch (intercomEvent.topic) {
            default:
                console.warn(new Date().toISOString(), 'warn', 'No handler for intercom event with topic, ', intercomEvent.topic)
                return
            case WebhookTopic.CONVERSATION_ADMIN_CREATED: {
                const externalId: string = intercomEvent.data.item.user.user_id
                const message: string = stripHtmlText(intercomEvent.data.item.conversation_message.body)
                const conversationId: string = intercomEvent.data.item.id

                return this.discordIntercomConversationService.sendMessageFromIntercomToDiscordContact(
                    externalId,
                    message,
                    conversationId
                )
            }
            case WebhookTopic.CONVERSATION_ADMIN_REPLIED: {
                const externalId: string = intercomEvent.data.item.user.user_id
                const message: string = stripHtmlText(intercomEvent.data.item
                    ?.conversation_parts
                    ?.conversation_parts?.[0]
                    ?.body || '')
                const conversationId: string = intercomEvent.data.item.id

                return this.discordIntercomConversationService.sendMessageFromIntercomToDiscordContact(
                    externalId,
                    message,
                    conversationId
                )
            }
        }
    }
}

/* yes, parse html with regex */
function stripHtmlText(htmlString: string): string {
    const TAGS_REGEX: RegExp = /<[^>]+>/g
    return htmlString.replace(TAGS_REGEX, '')
}

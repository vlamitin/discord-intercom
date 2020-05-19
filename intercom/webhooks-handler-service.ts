import { WebhookEvent, WebhookTopic } from './domain/webhook-event'
import { MessagesService } from '../discord/messages-service'

export class WebhooksHandlerService {
    discordMessagesService: MessagesService

    constructor(discordMessagesService: MessagesService) {
        this.discordMessagesService = discordMessagesService
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

                await this.discordMessagesService.sendMessage(
                    externalId,
                    message
                )
                return
            }
            case WebhookTopic.CONVERSATION_ADMIN_REPLIED: {
                const externalId: string = intercomEvent.data.item.user.user_id
                const message: string = stripHtmlText(intercomEvent.data.item
                    ?.conversation_parts
                    ?.conversation_parts?.[0]
                    ?.body || '')

                await this.discordMessagesService.sendMessage(
                    externalId,
                    message
                )
                return
            }
        }
    }
}

/* yes, parse html with regex */
function stripHtmlText(htmlString: string): string {
    const TAGS_REGEX: RegExp = /<[^>]+>/g
    return htmlString.replace(TAGS_REGEX, '')
}

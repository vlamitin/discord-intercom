import { WebhookEvent, WebhookTopic } from './domain/webhook-event'
import { SyncConversationsService } from '../sync-conversations-service'
import { extractFileNameFromUrl, ParsedMessage, parseMessageBody } from './webhooks-handler-service-utlls'
import { Attachment } from '../discord/domain/attachment'

export class WebhooksHandlerService {
    syncConversationsService: SyncConversationsService

    constructor(syncConversationsService: SyncConversationsService) {
        this.syncConversationsService = syncConversationsService
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
                const message: ParsedMessage = parseMessageBody(intercomEvent.data.item.conversation_message.body)
                const conversationId: string = intercomEvent.data.item.id

                return this.syncConversationsService.sendMessageFromIntercomToDiscordContact(
                    externalId,
                    conversationId,
                    message.textRows,
                    [
                        ...message.imageUrls.map(url => ({
                            url,
                            name: extractFileNameFromUrl(url)
                        }))
                    ],
                )
            }
            case WebhookTopic.CONVERSATION_ADMIN_REPLIED: {
                const externalId: string = intercomEvent.data.item.user.user_id
                const message: ParsedMessage = parseMessageBody(intercomEvent.data.item
                    ?.conversation_parts
                    ?.conversation_parts?.[0]
                    ?.body || '')
                const attachments: Attachment[] = (intercomEvent.data.item
                    ?.conversation_parts
                    ?.conversation_parts?.[0]
                    ?.attachments || [])
                    .map(attachment => ({
                        name: attachment.name,
                        url: attachment.url
                    }))
                const conversationId: string = intercomEvent.data.item.id

                return this.syncConversationsService.sendMessageFromIntercomToDiscordContact(
                    externalId,
                    conversationId,
                    message.textRows,
                    [
                        ...message.imageUrls.map(url => ({
                            url,
                            name: extractFileNameFromUrl(url)
                        })),
                        ...attachments
                    ],
                )
            }
        }
    }
}

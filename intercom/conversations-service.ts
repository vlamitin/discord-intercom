import { GET, POST } from '../base-http-service'
import { BaseIntercomHttpService } from './base-intercom-http-service'
import {
    ContactConversationReplyMessage,
    Conversation,
    GetConversationsResponse,
    ReplyMessageConversationId,
    validateContactConversationReplyMessage
} from './domain/conversation'

export class ConversationsService extends BaseIntercomHttpService {

    constructor(serverUrl: string, token: string) {
        super(serverUrl, token)
    }

    replyToConversation = (
        conversationId: ReplyMessageConversationId,
        contactId: string,
        content: string
    ): Promise<Conversation> => {
        const replyMessage: ContactConversationReplyMessage = {
            message_type: 'comment',
            type: 'user',
            body: content,
            user_id: contactId
        }

        const validationResult = validateContactConversationReplyMessage(replyMessage)

        if (validationResult) {
            console.error(new Date().toISOString(), 'error',
                `error while replying to conversation with id ${conversationId} from contact with id ${contactId} - ${validationResult}`
            )
            return
        }

        return super.send<Conversation>({
            method: POST,
            url: `/conversations/${conversationId}/reply`,
            data: replyMessage
        })
    }

    getAllConversations = (): Promise<Conversation[]> => {
        return super.send<GetConversationsResponse>({
            method: GET,
            url: '/conversations'
        })
            .then(response => {
                if (!response.conversations) {
                    // TODO handle no conversations found
                    return []
                }

                return response.conversations
            })
    }

    getConversationsByContactId = (contactId: string): Promise<Conversation[]> => {
        return super.send<GetConversationsResponse>({
            method: POST,
            url: '/conversations/search',
            data: {
                query: {
                    field: 'contact_ids',
                    operator: '=',
                    value: contactId
                }
            }
        })
            .then(response => {
                if (!response?.conversations) {
                    // TODO handle no conversations found
                    return []
                }

                return response.conversations
            })
    }

    createConversationInitiatedByContact = (contactId: string, content: string): Promise<void> => {
        return super.send<void>({
            method: POST,
            url: '/conversations',
            data: {
                from: {
                    type: 'contact',
                    id: contactId,
                },
                body: content
            }
        })
    }

    autoAssignConversationToAdmin = (conversationId: string): Promise<Conversation> => {
        return super.send<Conversation>({
            method: POST,
            url: `/conversations/${conversationId}/run_assignment_rules`,
        })
    }

    assignConversationToAdmin = (conversationId: string, adminId: string): Promise<Conversation> => {
        return super.send<Conversation>({
            method: POST,
            url: `/conversations/${conversationId}/parts`,
            data: {
                message_type: 'assignment',
                type: 'admin',
                admin_id: adminId,
                assignee_id: adminId,
            }
        })
    }
}

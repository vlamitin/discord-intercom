import * as uuid from 'uuid'
import { GET, getAxiosErrorSummary, POST, PUT } from '../base-http-service'
import { BaseIntercomHttpService } from './base-intercom-http-service'
import {
    ContactConversationReplyMessage,
    Conversation,
    GetConversationsResponse,
    ReplyMessageConversationId,
    validateContactConversationReplyMessage
} from './domain/conversation'
import { AppSerializedStateService } from '../app-serialized-state-service'

export class ConversationsService extends BaseIntercomHttpService {

    appSerializedStateService: AppSerializedStateService

    constructor(serverUrl: string, token: string, appSerializedStateService: AppSerializedStateService) {
        super(serverUrl, token)
        this.appSerializedStateService = appSerializedStateService
    }

    replyToConversation = (
        conversationId: ReplyMessageConversationId,
        contactId: string,
        discordUsername: string,
        content: string,
        attachmentUrls: string[]
    ): Promise<Conversation> => {
        const replyMessage: ContactConversationReplyMessage = {
            message_type: 'comment',
            type: 'user',
            body: content,
            intercom_user_id: contactId,
            /* https://developers.intercom.com/intercom-api-reference/reference#reply-to-a-conversation */
            /* 5 is max attachments */
            attachment_urls: attachmentUrls.slice(0, 5)
        }

        const validationResult = validateContactConversationReplyMessage(replyMessage)

        if (validationResult) {
            console.error(new Date().toISOString(), 'error',
                `error while replying to conversation with id ${conversationId} from contact with id ${contactId} and name ${discordUsername} - ${validationResult}`
            )
            return
        }

        return super.send<Conversation>({
            method: POST,
            url: `/conversations/${conversationId}/reply`,
            data: replyMessage
        }, {
            errorMiddlewares: [
                (error => {
                    console.error(new Date().toISOString(), 'error',
                        `error while replying to conversation with id ${conversationId} from contact with id ${contactId} and name ${discordUsername} error - `,
                        getAxiosErrorSummary(error)
                    )

                    if (error.response?.status === 404) {
                        return
                    }

                    const newFailedReplyId: string = uuid.v4()
                    console.debug(new Date().toISOString(), 'info', 'Saving failed conversation with id: ', newFailedReplyId)

                    this.appSerializedStateService.setNewFailedReply(newFailedReplyId, {
                        id: newFailedReplyId,
                        date: new Date().toISOString(),
                        conversationId,
                        contactId,
                        discordUsername,
                        content,
                        attachmentUrls
                    })
                })
            ]
        })
            .then(replied => {
                if (attachmentUrls.slice(5).length > 0) {
                    return this.replyToConversation(
                        conversationId,
                        contactId,
                        discordUsername,
                        '...',
                        attachmentUrls.slice(5)
                    )
                } else {
                    return replied
                }
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

    getConversationById = (conversationId: string): Promise<Conversation> => {
        return super.send<Conversation>({
            method: POST,
            url: `/conversations/${conversationId}`,
        })
    }

    /* TODO attachments not supported */
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

    markConversationAsRead = (conversationId: string): Promise<Conversation> => {
        return super.send<Conversation>({
            method: PUT,
            url: `/conversations/${conversationId}`,
            data: {
                read: true
            }
        }, {
            responseMiddlewares: [
                (response, next) => {
                    if (response?.data?.id === conversationId && response?.data?.read === true) {
                        console.debug(new Date().toISOString(), 'info', 'marked as read conversation ', conversationId)
                    } else {
                        console.warn(new Date().toISOString(), 'warn', 'failed to mark conversation as read ', conversationId)
                    }
                    next()
                }
            ]
        })
    }
}

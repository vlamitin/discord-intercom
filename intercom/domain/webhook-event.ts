import { Author, Conversation } from './conversation'

export interface LegacyConversationMessage {
    type: 'conversation_message'
    body?: string
    [key: string]: any
}

export interface WebhookConversationAuthor extends Author {
    name?: string
    email?: string
}

interface UserAuthor extends WebhookConversationAuthor {
    type: 'user'
    /** external id */
    user_id?: string
}

export interface AdminAuthor extends WebhookConversationAuthor {
    type: 'admin'
}

// in webhook legacy conversation model is used
export interface WebhookConversation extends Omit<Conversation, 'contacts'> {
    conversation_message?: LegacyConversationMessage
    user: UserAuthor
    assignee: AdminAuthor
}

export enum WebhookTopic {
    CONVERSATION_ADMIN_CREATED = 'conversation.admin.single.created',
    CONVERSATION_ADMIN_REPLIED = 'conversation.admin.replied',
}

export interface WebhookEvent {
    type: 'notification_event'
    id: string
    data: {
        type: 'notification_event_data',
        item: WebhookConversation
    }
    topic: WebhookTopic
    [key: string]: any
}

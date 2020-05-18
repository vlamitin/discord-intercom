import { Contact } from './contact'

export interface Author {
    id: string
    type: 'user' | 'admin' | 'bot'
}

export interface ConversationPart {
    type: 'comment' | 'assignment' | 'open' | 'close' | 'participant_added' | string
    body: string
    author: Author
}

export interface ConversationPartsObject {
    conversation_parts: ConversationPart[]
}

export interface Conversation {
    type: 'conversation'
    id: string
    contacts?: Contact[]
    created_at: number
    updated_at: number

    conversation_parts?: ConversationPartsObject
    [key: string]: any
}

export interface GetConversationsResponse {
    type: 'conversation.list'
    total_count: number
    conversations: Conversation[]
}

export type ReplyMessageConversationId = 'last' | string

export interface ContactConversationReplyMessage {
    message_type: 'comment'
    type: 'user'
    body: string

    intercom_user_id?: string
    user_id?: string
    email?: string

    attachment_urls?: string[]
}

export function validateContactConversationReplyMessage(message: ContactConversationReplyMessage): string {
    const generateResultString = (reason: string) => `Invalid contact: ${reason}, see rules of validation here https://developers.intercom.com/intercom-api-reference/reference#reply-to-a-conversation`
    if (!message.intercom_user_id && !message.user_id && !message.email) {
        return generateResultString('no email or user_id or intercom_user_id provided')
    }

    return ''
}

export function getExampleContactConversationReplyMessage(): ContactConversationReplyMessage {
    return {
        "message_type": "comment",
        "type": "user",
        "email": "wash@serenity.io",
        "body": "Thanks again :)"
    }
}

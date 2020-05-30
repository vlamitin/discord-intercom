import { ReplyMessageConversationId } from './conversation'

export interface FailedConversationReply {
    id: string // uuid
    date: string // ISOString format
    conversationId: ReplyMessageConversationId,
    contactId: string,
    discordUsername: string,
    content: string,
    attachmentUrls: string[]
}

import { POST } from '../base-http-service'
import { BaseIntercomHttpService } from './base-intercom-http-service'
import { ContactConversationReplyMessage, Conversation, ReplyMessageConversationId } from './domain/conversation'

export class ConversationsService extends BaseIntercomHttpService {

    constructor(serverUrl: string, token: string) {
        super(serverUrl, token)
    }

    replyToConversation = (
        conversationId: ReplyMessageConversationId,
        replyMessage: ContactConversationReplyMessage
    ): Promise<Conversation> => {
        return super.send<Conversation>({
            method: POST,
            url: `/conversations/${conversationId}/reply`,
            data: replyMessage
        })
    }
}

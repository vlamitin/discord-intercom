import { WelcomeMessage } from './services/discord/domain/welcome-message'
import { AppUser } from './services/domain/app-user'
import { FailedConversationReply } from './services/intercom/domain/failed-conversation-reply'
import { Attachment } from './services/discord/domain/attachment'

export interface Broadcast {
    messages: string[],
    attachments: Attachment[],
    segments: string[]
    date?: Date
}

export interface SerializedState {
    welcomeMessages: WelcomeMessage[]
    users: AppUser[]
    failedConversationRepliesMap: {
        [key: string]: FailedConversationReply
    }
    scheduledBroadcasts: Broadcast[]
}

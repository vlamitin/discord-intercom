import { WelcomeMessage } from './services/discord/domain/welcome-message'
import { AppUser } from './services/domain/app-user'
import { FailedConversationReply } from './services/intercom/domain/failed-conversation-reply'

export interface SerializedState {
    welcomeMessages: WelcomeMessage[]
    users: AppUser[]
    failedConversationRepliesMap: {
        [key: string]: FailedConversationReply
    }
}

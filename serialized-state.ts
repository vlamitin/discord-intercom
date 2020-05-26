import { WelcomeMessage } from './services/discord/domain/welcome-message'
import { AppUser } from './services/domain/app-user'

export interface SerializedState {
    welcomeMessages: WelcomeMessage[]
    users: AppUser[]
}

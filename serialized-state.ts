import { WelcomeMessage } from './discord/domain/welcome-message'
import { AppUser } from './domain/app-user'

export interface SerializedState {
    welcomeMessages: WelcomeMessage[]
    users: AppUser[]
}

import { WelcomeMessage } from './discord/domain/welcome-message'

export interface SerializedState {
    welcomeMessages: WelcomeMessage[]
}

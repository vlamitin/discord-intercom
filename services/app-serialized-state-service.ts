import { SerializedState } from '../serialized-state'
import { FailedConversationReply } from './intercom/domain/failed-conversation-reply'
import { SerializedDataStorage } from './domain/serialized-data-storage'

export class AppSerializedStateService {
    serializedDataStorage: SerializedDataStorage<SerializedState>
    state: SerializedState

    constructor(filePath: string) {
        this.serializedDataStorage = new SerializedDataStorage<SerializedState>(filePath)
        this.state = this.serializedDataStorage.reload()
    }

    setNewFailedReply = (id: string, failedReply: FailedConversationReply): void => {
        this.state.failedConversationRepliesMap[id] = failedReply
        this.serializedDataStorage.sync(this.state)
    }

    removeFailedReply = (id: string): void => {
        if (!this.state.failedConversationRepliesMap[id]) {
            return
        }

        delete this.state.failedConversationRepliesMap[id]
        this.serializedDataStorage.sync(this.state)
    }

    setState = (state: SerializedState): void => {
        this.state = state
        this.serializedDataStorage.sync(this.state)
    }

}

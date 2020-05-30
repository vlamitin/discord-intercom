import * as fs from 'fs'
import { SerializedState } from '../serialized-state'
import { FailedConversationReply } from './intercom/domain/failed-conversation-reply'

export class AppSerializedStateService {
    state: SerializedState
    filePath: string

    constructor(state: SerializedState, filePath: string) {
        this.state = state
        this.filePath = filePath
    }

    setNewFailedReply = (id: string, failedReply: FailedConversationReply): void => {
        this.state.failedConversationRepliesMap[id] = failedReply
        this.syncState()
    }

    removeFailedReply = (id: string): void => {
        if (!this.state.failedConversationRepliesMap[id]) {
            return
        }

        delete this.state.failedConversationRepliesMap[id]
        this.syncState()
    }

    setState = (state: SerializedState): void => {
        this.state = state
        this.syncState()
    }

    private syncState = (): void => {
        const serializedState = JSON.stringify(this.state, null, 2)
        fs.writeFileSync(this.filePath, serializedState, { encoding: 'utf-8' })
    }
}

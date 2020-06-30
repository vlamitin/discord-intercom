import { SerializedDataStorage } from './serialized-data-storage'

import { Attachment } from '../discord/domain/attachment'

export interface Broadcast {
    messages: string[],
    attachments: Attachment[],
    userIds: string[],
    date: string // yyyy-MM-ddTHH:mm
}

export class BroadcastSerializedDataService {
    serializedDataStorage: SerializedDataStorage<Broadcast[]>
    state: Broadcast[]

    constructor(filePath: string) {
        this.serializedDataStorage = new SerializedDataStorage<Broadcast[]>(filePath)
        this.state = this.serializedDataStorage.reload() || []
    }

    addBroadcast(broadcast: Broadcast): void {
        this.state.push(broadcast)
        this.serializedDataStorage.sync(this.state)
    }

    removeByIndex(index: number): void {
        this.state[index] = null
        this.serializedDataStorage.sync(this.state.filter(item => item != null))
    }

    reload() {
        this.state = this.serializedDataStorage.reload() || []
    }

    save() {
        this.serializedDataStorage.sync(this.state)
    }
}
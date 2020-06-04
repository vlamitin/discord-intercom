Date.prototype.toJSON = function(){ return this.toString(); }
import { Attachment } from './discord/domain/attachment'
import * as fs from 'fs'

export interface Broadcast {
    messages: string[],
    attachments: Attachment[],
    segments: string[]
    date: string
}

export class BroadcastSerializedDataService {
    state: Broadcast[] = []
    filePath: string

    constructor(filePath: string) {
        this.filePath = filePath
        this.reload()
    }

    addBroadcast(broadcast: Broadcast): void {

        this.state.push(broadcast)
        this.sync()
    }

    removeByIndex(index: number): void {
        this.state[index] = null;
        this.sync()
    }

    public reload(): void {
        if (fs.existsSync(this.filePath)) {
            this.state = JSON.parse(fs.readFileSync(this.filePath).toString())
        }
    }

    private sync(): void {
        fs.writeFileSync(this.filePath, JSON.stringify(this.state.filter(item => item != null)), {encoding: 'utf-8'})
    }

}
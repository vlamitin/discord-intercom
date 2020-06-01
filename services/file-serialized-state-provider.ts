import { SerializeStateProvider } from './serialize-state-provider'
import { SerializedState } from '../serialized-state'
import { promises as fs } from 'fs'
import  * as path from 'path'

export class FileSerializedStateProvider implements SerializeStateProvider {
    filePath: string

    constructor(filePath: string) {
        this.filePath = filePath
    }

    getState(): Promise<SerializedState> {
        return fs.readFile(this.getPath())
            .then(result => JSON.parse(result.toString()))
    }

    serialize(state: SerializedState): Promise<void> {
        return fs.writeFile(this.getPath(), JSON.stringify(state));
    }

    private getPath() {
        return path.resolve(__dirname, '..', this.filePath)
    }

}
import * as fs from 'fs'

export class SerializedDataStorage<Internal> {
    filePath: string

    constructor(filePath: string) {
        this.filePath = filePath
    }

    public reload(): Internal {
        if (fs.existsSync(this.filePath)) {
            return JSON.parse(fs.readFileSync(this.filePath).toString())
        }
    }

    public sync(state: Internal) {
        fs.writeFileSync(this.filePath, JSON.stringify(state), {encoding: 'utf-8'})
    }
}
import { BroadcastMessageCallback, MessagesService } from './discord/messages-service'
import { Attachment } from './discord/domain/attachment'
import { Broadcast, BroadcastSerializedDataService } from './domain/broadcast-serialized-data-service'

export interface SegmentsProvider {
    getUserIds(segmentIds: string[]): string[]
}

export class BroadcastService {
    discordMessageService: MessagesService
    broadcastSerializedDataService: BroadcastSerializedDataService
    providers: SegmentsProvider[]

    constructor(discordMessageService: MessagesService, providers: SegmentsProvider[], broadcastSerializedDataService: BroadcastSerializedDataService) {
        this.discordMessageService = discordMessageService
        this.providers = providers
        this.broadcastSerializedDataService = broadcastSerializedDataService
    }

    broadcast = async (messages: string[], attachments: Attachment[], segments?: string[], date?: string) => {
        const userIdsSet = new Set(this.providers.flatMap(provider => provider.getUserIds(segments)))
        let userIds: string[] = [...userIdsSet];
        if (date && new Date(date) > new Date()) {
            // need to schedule
            const bm: Broadcast = {
                messages, attachments, userIds, date
            }
            this.broadcastSerializedDataService.addBroadcast(bm)
        } else {
            return this.doBroadcastForUsers(messages, attachments, userIds)
        }
    }

    doBroadcastForUsers = async (messages: string[], attachments: Attachment[], userIds: string[], cb?: BroadcastMessageCallback) => {
        return await this.discordMessageService.broadcastMessage(messages, attachments, userIds, cb)
    }

}
import { MessagesService } from './discord/messages-service'
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
        if (date && new Date(date) > new Date()) {
            // need to schedule
            const bm: Broadcast = {
                messages, attachments, segments, date
            }
            this.broadcastSerializedDataService.addBroadcast(bm);
        } else {
            return this.doBroadcast(messages, attachments, segments)
        }
    }


    doBroadcast = async (messages: string[], attachments: Attachment[], segments?: string[]) => {
        const userIds = new Set(this.providers.flatMap(provider => provider.getUserIds(segments)))
        return await this.discordMessageService.broadcastMessage(messages, attachments, userIds)
    }

}
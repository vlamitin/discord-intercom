import { MessagesService } from './discord/messages-service'
import { Attachment } from './discord/domain/attachment'
import { AppSerializedStateService } from './app-serialized-state-service'

export interface SegmentsProvider {
    getUserIds(segmentIds: string[]): string[]
}

export class BroadcastService {
    discordMessageService: MessagesService
    appSerializedStateService: AppSerializedStateService
    providers: SegmentsProvider[]

    constructor(discordMessageService: MessagesService, providers: SegmentsProvider[], appSerializedStateService: AppSerializedStateService) {
        this.discordMessageService = discordMessageService
        this.providers = providers
        this.appSerializedStateService = appSerializedStateService
    }

    broadcast = async (messages: string[], attachments: Attachment[], segments?: string[], date?: Date) => {
        if (date && date > new Date()) {
            // need to schedule
            const bm = {
                messages, attachments, segments, date
            }
            const nextState = {
                ...this.appSerializedStateService.state,
                scheduledBroadcasts: [
                    ...this.appSerializedStateService.state.scheduledBroadcasts,
                    bm
                ]
            }
            // TODO non atomic
            this.appSerializedStateService.setState(nextState)
            return Promise.resolve()
        } else {
            return this.doBroadcast(messages, attachments, segments)
        }
    }


    doBroadcast = async (messages: string[], attachments: Attachment[], segments?: string[]) => {
        const userIds = new Set(this.providers.flatMap(provider => provider.getUserIds(segments)))
        return await this.discordMessageService.broadcastMessage(messages, attachments, userIds)
    }

}
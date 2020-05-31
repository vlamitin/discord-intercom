import { MessagesService } from './discord/messages-service';
import { Attachment } from './discord/domain/attachment';

export interface SegmentsProvider {
    getUserIds(segmentIds: string[]): string[]
}

export class BroadcastService {
    discordMessageService: MessagesService
    providers: SegmentsProvider[]

    constructor(discordMessageService: MessagesService, providers: SegmentsProvider[]) {
        this.discordMessageService = discordMessageService;
        this.providers = providers;
    }

    broadcast = async (messages: string[], attachments: Attachment[], segments: string[]) => {
        const userIds = new Set(this.providers.flatMap(provider => provider.getUserIds(segments)));
        return await this.discordMessageService.broadcastMessage(messages, attachments, userIds);
    }

}
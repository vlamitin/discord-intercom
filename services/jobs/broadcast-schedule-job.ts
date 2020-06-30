import { Services } from '../../index'
import { Broadcast } from '../domain/broadcast-serialized-data-service'
import { User } from 'discord.js'

const executing = [];

export function readyToSend(now: Date, broadcast: Broadcast) {
    if (!broadcast) {
        return false;
    }

    const broadcastDateTime = new Date(broadcast.date)
    if (broadcastDateTime >= now) {
        const diffMs = (broadcastDateTime.getTime() - now.getTime())
        const diffSeconds = Math.round(diffMs / 1000)
        return diffSeconds <= 60
    } else {
        return false
    }
}

export async function broadcastScheduleJobCallback(services: Services) {
    if (executing.length) {
        console.debug(new Date().toISOString(), 'info', 'broadcastScheduleJobCallback is busy')
        return;
    }
    services.broadcastSerializedDataService.reload()
    const broadcasts = services.broadcastSerializedDataService.state
    if (broadcasts && broadcasts.length) {
        const scheduledBroadcasts = [...broadcasts]
        const now = new Date()
        for (let i = 0; i < scheduledBroadcasts.length; i++) {
            const sb = scheduledBroadcasts[i]
            if (readyToSend(now, sb)) {
                executing.push(this);
                try {
                    console.debug(new Date().toISOString(), 'info', 'Ready to do broadcast: ', JSON.stringify(sb))
                    await services.broadcastService.doBroadcastForUsers(sb.messages, sb.attachments, sb.userIds, (user: User) => {
                        sb.userIds = sb.userIds.filter(userId => userId !== user.id)
                        services.broadcastSerializedDataService.save()
                    })
                    services.broadcastSerializedDataService.removeByIndex(i)
                } catch (e) {
                    console.debug(new Date().toISOString(), 'error', "Couldn't do broadcast: ", e)
                } finally {
                    executing.pop();
                }
            }
        }
    }
}
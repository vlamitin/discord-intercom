import { Services } from '../../index'
import { Broadcast } from '../broadcast-serialized-data-service'

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
    services.broadcastSerializedDataService.reload()
    const broadcasts = services.broadcastSerializedDataService.state
    if (broadcasts && broadcasts.length) {
        const scheduledBroadcasts = [...broadcasts]
        const now = new Date()
        for (let i = 0; i < scheduledBroadcasts.length; i++) {
            const sb = scheduledBroadcasts[i]
            if (readyToSend(now, sb)) {
                await services.broadcastService.doBroadcast(sb.messages, sb.attachments, sb.segments)
                services.broadcastSerializedDataService.removeByIndex(i)
            }
        }
    }
}
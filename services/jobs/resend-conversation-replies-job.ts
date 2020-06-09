import { Services } from '../../index'
import { processPromises } from '../../utils/promise-utils'

export async function resendConversationRepliesJobCallback(services: Services): Promise<void> {
    const failedReplyIds: string[] = Object.keys(services.appSerializedStateService.state.failedConversationRepliesMap || {})
    if (failedReplyIds.length === 0) {
        return
    }
    console.debug(new Date().toISOString(), 'info', 'Starting resend ', failedReplyIds.length, 'failed replies ...')

    let resendCounter: number = 0

    await processPromises(failedReplyIds.map(replyId => {
        return async () => {
            const { conversationId, contactId, discordUsername, content, attachmentUrls }
                = services.appSerializedStateService.state.failedConversationRepliesMap[replyId]
            console.debug(new Date().toISOString(), 'info', `Resending message for user ${discordUsername} ...`)

            const reply = await services.intercomConversationsService.replyToConversation(
                conversationId,
                contactId,
                discordUsername,
                '(!) Повторная отправка: \n' + content,
                attachmentUrls,
            )
            if (reply) {
                console.debug(new Date().toISOString(), 'info', `Resending message for user ${discordUsername} success`)
                resendCounter++
            } else {
                console.debug(new Date().toISOString(), 'warn', `Resending message for user ${discordUsername} failed`)
            }

            services.appSerializedStateService.removeFailedReply(replyId)
        }
    }), 10)

    console.debug(new Date().toISOString(), 'info', 'Resending finished, resent: ', resendCounter)
}
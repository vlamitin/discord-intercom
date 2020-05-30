import { ContactsService } from './intercom/contacts-service'
import { Contact } from './intercom/domain/contact'
import { ConversationsService } from './intercom/conversations-service'
import { Conversation } from './intercom/domain/conversation'
import { MessagesService } from './discord/messages-service'
import { Attachment } from './discord/domain/attachment'

export class SyncConversationsService {
    contactsService: ContactsService
    conversationsService: ConversationsService
    discordMessagesService: MessagesService

    constructor(
        contactsService: ContactsService,
        conversationsService: ConversationsService,
        discordMessagesService: MessagesService
    ) {
        this.contactsService = contactsService
        this.conversationsService = conversationsService
        this.discordMessagesService = discordMessagesService
    }

    sendMessageFromDiscordToIntercomAdmin = async (
        discordUserId: string,
        discordUsername: string,
        content: string,
        attachmentUrls: string[]
    ): Promise<void> => {
        const intercomContact: Contact = await this.contactsService.getContactByExternalId(discordUserId)
        if (!intercomContact) {
            console.warn(new Date().toISOString(), 'warn', `Failed to send discord message ${content} to intercom: user with discord id ${discordUserId} not found in intercom`)
            return
        }

        const contactConversations: Conversation[] = await this.conversationsService.getConversationsByContactId(
            intercomContact.id
        )

        if (contactConversations.length === 0) {
            console.warn(new Date().toISOString(), 'warn', 'No intercom conversations with contact found, creating first ...')

            return this.conversationsService.createConversationInitiatedByContact(
                intercomContact.id,
                content
            )
                .then(() => {
                    if (attachmentUrls.length > 0) {
                        console.warn(new Date().toISOString(), 'warn', 'Attachments found when first message - sending second message...')
                        return this.sendMessageFromDiscordToIntercomAdmin(
                            discordUserId,
                            discordUsername,
                            '...',
                            attachmentUrls
                        )
                    }
                })
        }

        const sortedByUpdated: Conversation[] = contactConversations
            .concat()
        sortedByUpdated.sort((conv1: Conversation, conv2: Conversation) => {
            return conv2.updated_at - conv1.updated_at
        })

        const latestConversation: Conversation = sortedByUpdated[0]

        await this.conversationsService.replyToConversation(
            latestConversation.id,
            intercomContact.id,
            discordUsername,
            content,
            attachmentUrls
        )
        return
    }

    sendMessageFromIntercomToDiscordContact = async (
        discordUserId: string,
        discordUsername: string,
        intercomContactId: string,
        intercomConversationId: string,
        textRows: string[],
        attachments: Attachment[]
    ): Promise<void> => {
        const sentMessage = await this.discordMessagesService.sendMessage(
            discordUserId,
            textRows,
            attachments
        )

        if (sentMessage) {
            await this.conversationsService.markConversationAsRead(intercomConversationId)
        } else {
            const shortMessage: string = getShortMessage(textRows, attachments)
            console.warn(new Date().toISOString(), 'warn', `failed to send message with content ${shortMessage} to person with discordUserId ${discordUserId} and intercomContactId ${intercomContactId}, sending warn reply to intercom admin ...`)
            await this.conversationsService.replyToConversation(
                intercomConversationId,
                intercomContactId,
                discordUsername,
                `(!) Ошибка при отправке пользователю в дискорд сообщения ${shortMessage}`,
                []
            )
        }
    }
}

function getShortMessage(textRows: string[], attachments: Attachment[]): string {
    let result = ''
    if (textRows.length > 0) {
        result += `"${textRows.join(' ').slice(0, 6)}..."`
    }

    if (attachments.length > 0) {
        if (result) {
            result += ' и '
        }
        result += `${attachments.length} вложений`
    }

    return result
}

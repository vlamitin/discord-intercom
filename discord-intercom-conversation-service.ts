import { ContactsService } from './intercom/contacts-service'
import { Contact } from './intercom/domain/contact'
import { ConversationsService } from './intercom/conversations-service'
import { Conversation } from './intercom/domain/conversation'
import { MessagesService } from './discord/messages-service'

export class DiscordIntercomConversationService {
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
        content: string
    ): Promise<void> => {
        const intercomContact: Contact = await this.contactsService.getContactByExternalId(discordUserId)
        if (!intercomContact) {
            console.warn(new Date().toISOString(), 'warn', 'Failed to send discord message to intercom: user not found in intercom')
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
            content
        )
        return
    }

    sendMessageFromIntercomToDiscordContact = async (
        discordUserId: string,
        content: string,
        intercomConversationId: string
    ): Promise<void> => {
        await this.discordMessagesService.sendMessage(
            discordUserId,
            content
        )
        await this.conversationsService.markConversationReaded(intercomConversationId)
    }
}

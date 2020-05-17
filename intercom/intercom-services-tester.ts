import { ContactsService } from './contacts-service'
import { getExampleContactForCreation } from './domain/contact'
import { ConversationsService } from './conversations-service'
import { getExampleContactConversationReplyMessage } from './domain/conversation'
const config = require('../config.json')

export const contactsService = new ContactsService(config.intercomApiUrl, config.intercomAppToken)
export const conversationsService = new ConversationsService(config.intercomApiUrl, config.intercomAppToken)

async function test() {
    // const contacts = await contactsService.getAllContacts()
    // console.log(contacts)

    // const created = await contactsService.copyContactFromDiscord({
    //     "role":"user",
    //     "external_id":"707987110119997490",
    //     "name":"vlamitin"
    // })
    // console.log(created)

    const replied = await conversationsService.replyToConversation(
        '27107524440',
        getExampleContactConversationReplyMessage()
    )
    console.log(replied)
}

// ts-node ./intercom/intercom-services-tester.ts
test()

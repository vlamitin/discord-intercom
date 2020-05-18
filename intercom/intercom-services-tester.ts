import { ContactsService } from './contacts-service'
import { getExampleContactForCreation } from './domain/contact'
import { ConversationsService } from './conversations-service'
import { getExampleContactConversationReplyMessage } from './domain/conversation'
import { BaseHttpService, getAxiosErrorSummary } from '../base-http-service'
const config = require('../config.json')

export const contactsService = new ContactsService(config.intercomApiUrl, config.intercomAppToken)
export const conversationsService = new ConversationsService(config.intercomApiUrl, config.intercomAppToken)

async function test() {
    BaseHttpService.generalErrorMiddlewares.push(((error, next) => {
        console.error(new Date().toISOString(), 'error', `BaseHttpService, Axios error:\n`, getAxiosErrorSummary(error))
    }))
    // const contacts = await contactsService.getAllContacts()
    // console.log(JSON.stringify(contacts))
    //
    // const created = await contactsService.copyContactFromDiscord({
    //     "role":"user",
    //     "external_id":"707987110119997490",
    //     "name":"vlamitin"
    // })
    // console.log(created)
    //
    const replied = await conversationsService.replyToConversation(
        '27122530513',
        '5ec0f1076fdffab37a4a37fa',
        'bla',
    )
    console.log(replied)

    // const assigned = await conversationsService.autoAssignConversationToAdmin(
    //     '27122530513',
    // )
    // console.log(assigned)

    // const assigned = await conversationsService.assignConversationToAdmin(
    //     '27122530513',
    //     '4123768'
    // )
    // console.log(assigned)
    //
    // const contact = await contactsService.getContactByExternalId(
    //     '708392433414570144',
    // )
    // console.log(contact)

    // const conversations = await conversationsService.getAllConversations()
    // // console.log(JSON.stringify(conversations))
    //
    // const conversations = await conversationsService.getConversationsByContactId(
    //     // '5ebef439beaeeec862d97d26' // hoban
    //     // '5ebff37f6b2686d52c2c2124', // vlamitin
    //     '5ec0f1076fdffab37a4a37fa' // jeremyvlz
    // )
    // console.log(JSON.stringify(conversations))
}

// ts-node ./intercom/intercom-services-tester.ts
test()

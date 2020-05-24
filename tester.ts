import { ContactsService } from './intercom/contacts-service'
import { ConversationsService } from './intercom/conversations-service'
import { BaseHttpService, getAxiosErrorSummary } from './base-http-service'
import { UsersService } from './discord/users-service'
import { startDiscordBot } from './discord/bot-starter'
import { AppUsersService } from './app-users-service'

const config = require('./config.json')

BaseHttpService.generalErrorMiddlewares.push(((error, next) => {
    console.error(new Date().toISOString(), 'error', `BaseHttpService, Axios error:\n`, getAxiosErrorSummary(error))
}))

async function testIntercom() {
    const contactsService = new ContactsService(config.intercomApiUrl, config.intercomAppToken)
    const conversationsService = new ConversationsService(config.intercomApiUrl, config.intercomAppToken)

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
    // const replied = await conversationsService.replyToConversation(
    //     '27122530513',
    //     '5ec0f1076fdffab37a4a37fa',
    //     'bla',
    // )
    // console.log(replied)

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
    //     '712972775236698210',
    // )
    // console.log(contact)

    // const conversations = await conversationsService.getAllConversations()
    // // console.log(JSON.stringify(conversations))
    //
    // const conversations = await conversationsService.getConversationsByContactId(
    //     // '5ebef439beaeeec862d97d26' // hoban
    //     '5ebff37f6b2686d52c2c2124', // vlamitin
    //     // '5ec0f1076fdffab37a4a37fa' // jeremyvlz
    // )
    // console.log(JSON.stringify(conversations))

    // const conversationFull = await conversationsService.getConversationById(
    //     '27122349981'
    // )
    // console.log(JSON.stringify(conversationFull))
}

async function testDiscord() {
    const discordClient = await startDiscordBot(config.discordBotToken)
    const usersService = new UsersService(discordClient)

    const users = await usersService.getAllUsers()
    console.log(JSON.stringify(users))

    process.exit(0)
}

function testAppUsers() {
    const appUsersService = new AppUsersService([
        {
            login: 'user',
            password: 'password',
            name: 'John'
        }
    ])
    const correctTokenByCreds = appUsersService.getTokenByCreds('user', 'password')
    console.warn('correctTokenByCreds', correctTokenByCreds)
    const inCorrectTokenByCreds = appUsersService.getTokenByCreds('user', 'password1')
    console.warn('inCorrectTokenByCreds', inCorrectTokenByCreds)

    const correctUserByToken = appUsersService.getUserByToken('Basic dXNlcjpwYXNzd29yZA==')
    console.warn('correctUserByToken', correctUserByToken)
    const inCorrectUserByToken = appUsersService.getTokenByCreds('user', 'Basic dXNZA=')
    console.warn('inCorrectUserByToken', inCorrectUserByToken)
}

// ts-node ./intercom/tester.ts
// testIntercom()
// testDiscord()
testAppUsers()

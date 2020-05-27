import { ContactsService } from './services/intercom/contacts-service'
import { ConversationsService } from './services/intercom/conversations-service'
import { BaseHttpService, getAxiosErrorSummary } from './services/base-http-service'
import { UsersService } from './services/discord/users-service'
import { startDiscordBot } from './services/discord/bot-starter'
import { AppUsersService } from './services/app-users-service'
import { parseMessageBody } from './services/intercom/webhooks-handler-service-utlls'
import { MessagesService } from './services/discord/messages-service'
import { processPromises } from './utils/promise-utils'
import { User } from "discord.js"

const config = require('./config.json')

BaseHttpService.generalErrorMiddlewares.push(((error, next) => {
    console.error(new Date().toISOString(), 'error', `BaseHttpService, Axios error:\n`, getAxiosErrorSummary(error))
}))

async function sleep(secs: number): Promise<void> {
    return new Promise(resolve => {
        setTimeout(resolve, secs * 1000)
    })
}

async function testIntercom() {
    const contactsService = new ContactsService(config.intercomApiUrl, config.intercomAppToken)
    const conversationsService = new ConversationsService(config.intercomApiUrl, config.intercomAppToken)

    // const contactsRes = await contactsService.getFirst150Contacts()
    // console.log(JSON.stringify(contactsRes))

    async function delete150() {
        const contactsRes = await contactsService.getFirst150Contacts()
        const deletedResults = await processPromises(contactsRes.data.map(contact => {
            return async () => {
                const res = await contactsService.deleteContact(contact.id)
                console.debug(new Date().toISOString(), 'info', 'deleted: ', JSON.stringify(res))
                return res
            }
        }), 10)
    }
    processPromises([
        delete150,
        () => sleep(10),
        delete150,
        () => sleep(10),
        delete150,
        () => sleep(10),
        delete150,
        () => sleep(10),
        delete150,
        () => sleep(10),
        delete150,
    ], 1)


    //
    // const created = await contactsService.copyContactFromDiscord({
    //     "role":"user",
    //     "external_id":"707987110119997490",
    //     "name":"vlamitin"
    // })
    // console.log(created)

    // const results = await Promise.all(
    //     Array.from(new Array(1000)).map((_, i) => {
    //         return contactsService.copyContactFromDiscord('107123' + i, '1000_user_' + i, '')
    //     })
    // )
    // console.log(JSON.stringify(results))

    // const promises = Array.from(new Array(1000)).map((_, i) => {
    //     return async () => {
    //         try {
    //             await contactsService.copyContactFromDiscord(
    //                 '12335-0964356' + i,
    //                 '1000_3_user_' + i,
    //                 ''
    //             )
    //         } catch (e) {
    //             console.error(new Date().toISOString(), 'error', 'error while copying to intercom user ', i, getAxiosErrorSummary(e))
    //         }
    //     }
    // })
    //
    // await processPromises(promises, 10)

    // // const resultt = await processPromises(Array.from(new Array(5000)).map((_, i) => {
    // const resultt = await processPromises(Array.from(new Array(20)).map((_, i) => {
    //     return async () => {
    //         return new Promise(resolve => {
    //             // setTimeout(() => {
    //                 console.log(i, '- timestamp -', Date.now())
    //                 resolve(i)
    //             // }, 10000 * Math.random())
    //             // }, 1000)
    //         })
    //     }
    // // }), 1000)
    // }), 3)
    //
    // console.log('done', JSON.stringify(resultt))

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
    const messagesService = new MessagesService(discordClient)

    // const users = await usersService.getAllUsers()
    // console.log(JSON.stringify(users))

    // const message1 = await messagesService.sendMessage(
    //     '707987110119997490', // vlamitin
    //     [
    //         'Привет',
    //         'Как дела'
    //     ],
    //     [
    //         {
    //             name: 'EARL.png',
    //             url: 'https://downloads.intercomcdn.com/i/o/211779336/e0a7b4fe06372070f426e47c/EARL.png'
    //         },
    //         {
    //             name: 'file.txt',
    //             url: 'https://hands-production.intercom-attachments-1.com/i/o/211779305/86461f16b60d8b54b5663acc/FILE.txt'
    //         }
    //     ]
    // )
    // console.log(JSON.stringify(message1))
    //
    // const message2 = await messagesService.sendMessage(
    //     '707987110119997490', // vlamitin
    //     [
    //         'Привет',
    //         'Как дела'
    //     ],
    //     []
    // )
    // console.log(JSON.stringify(message2))

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

function testHtmlParse() {
    const testMessageBody4 = '<p>sadf<br>asdf<br></p>\n<div class="intercom-container"><img src="https://downloads.intercomcdn.com/i/o/211782493/e438dfe869b779643afc641a/EARL.png"></div><p>sadf<br>sadfasdf</p>'
    console.log('parseMessageBody', parseMessageBody(testMessageBody4))
}

// ts-node ./intercom/tester.ts
testIntercom()
// testDiscord()
// testAppUsers()
// testHtmlParse()

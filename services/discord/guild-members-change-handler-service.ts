import { GuildMember, PartialGuildMember, TextChannel, User } from 'discord.js'
import { ContactsService } from '../intercom/contacts-service'
import { MessagesService } from './messages-service'
import { getAxiosErrorSummary } from '../base-http-service'
import { SerializeStateProvider } from '../serialize-state-provider'

export class GuildMembersChangeHandlerService {
    serializedStateProvider: SerializeStateProvider

    private readonly intercomContactsService: ContactsService
    private readonly discordMessagesService: MessagesService

    constructor(
        serializedStateProvider: SerializeStateProvider,
        intercomContactsService: ContactsService,
        discordMessagesService: MessagesService
    ) {
        this.serializedStateProvider = serializedStateProvider
        this.intercomContactsService = intercomContactsService
        this.discordMessagesService = discordMessagesService
    }

    handleMemberAdd = async (member: GuildMember | PartialGuildMember) => {
        const welcomeMessages = (await this.serializedStateProvider.getState()).welcomeMessages
        welcomeMessages.forEach(msg => {
            const messageContent = fillMessageWithUserProps(msg.content, member.user)
            if (msg.channel === 'dm') {
                this.discordMessagesService.sendMessageToUser(member.user, [messageContent], [])
            } else {
                const channel = member.guild.channels.cache.find(ch => ch.name === msg.channel)
                if (!channel) {
                    console.warn(new Date().toISOString(), 'warn', 'failed to send welcome message to channel: channel not found with name: ', msg.channel)
                    return
                }

                if (channel.type !== 'text') {
                    console.warn(new Date().toISOString(), 'warn', 'failed to send welcome message to channel: channel is not of type "text": ', msg.channel)
                }

                (channel as TextChannel)?.send(messageContent)
            }
        })

        try {
            await this.intercomContactsService.copyContactFromDiscord(
                member.user.id,
                member.user.username,
                member.user.avatar
            )
        } catch (e) {
            console.error(new Date().toISOString(), 'error', 'error while copying to intercom user ', member.user.username, getAxiosErrorSummary(e))
        }
    }

    handleMemberRemove = async (member: GuildMember | PartialGuildMember) => {
        console.log('TODO on guildMemberRemove remove contacts from intercom?')
        // console.log(JSON.stringify(member))
    }
}

function fillMessageWithUserProps(messageContent: string, user: User): string {
    let result = messageContent
    const matched = Array.from(messageContent.matchAll(/{{(\w+)}}/g)) || []
    matched.forEach(matchedTuple => {
        if (matchedTuple[1] in user) {
            result = result.replace(matchedTuple[0], user[matchedTuple[1]])
        }
    })

    return result
}

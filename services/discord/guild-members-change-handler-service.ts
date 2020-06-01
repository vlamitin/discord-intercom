import { GuildMember, PartialGuildMember, TextChannel, User } from 'discord.js'
import { ContactsService } from '../intercom/contacts-service'
import { WelcomeMessage } from './domain/welcome-message'
import { MessagesService } from './messages-service'
import { getAxiosErrorSummary } from '../base-http-service'
import { fillMessageWithUserProps } from './message-utils'

export class GuildMembersChangeHandlerService {
    welcomeMessages: WelcomeMessage[] = []

    private readonly intercomContactsService: ContactsService
    private readonly discordMessagesService: MessagesService

    constructor(
        welcomeMessages: WelcomeMessage[],
        intercomContactsService: ContactsService,
        discordMessagesService: MessagesService
    ) {
        this.welcomeMessages = welcomeMessages || []
        this.intercomContactsService = intercomContactsService
        this.discordMessagesService = discordMessagesService
    }

    setWelcomeMessages = (value: WelcomeMessage[]) => this.welcomeMessages = value

    handleMemberAdd = async (member: GuildMember | PartialGuildMember) => {
        this.welcomeMessages.forEach(msg => {
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

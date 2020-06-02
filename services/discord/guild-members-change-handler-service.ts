import { GuildMember, PartialGuildMember, TextChannel, User } from 'discord.js'
import { ContactsService } from '../intercom/contacts-service'
import { MessagesService } from './messages-service'
import { getAxiosErrorSummary } from '../base-http-service'
import { fillMessageWithUserProps } from './message-utils'
import { AppSerializedStateService } from '../app-serialized-state-service'

export class GuildMembersChangeHandlerService {
    appSerializedStateService: AppSerializedStateService

    private readonly intercomContactsService: ContactsService
    private readonly discordMessagesService: MessagesService

    constructor(
        appSerializedStateService: AppSerializedStateService,
        intercomContactsService: ContactsService,
        discordMessagesService: MessagesService
    ) {
        this.appSerializedStateService = appSerializedStateService
        this.intercomContactsService = intercomContactsService
        this.discordMessagesService = discordMessagesService
    }

    handleMemberAdd = async (member: GuildMember | PartialGuildMember) => {
        const welcomeMessages = this.appSerializedStateService.state.welcomeMessages
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

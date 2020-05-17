import { UsersService } from './discord/users-service'
import { ContactsService } from './intercom/contacts-service'
import { User } from 'discord.js'
import { NewDiscordContact, validateContact } from './intercom/domain/contact'
import { getAxiosErrorSummary } from './base-http-service'

export interface DiscordToIntercomResult {
    discordUsersCount: number
    discordBotsCount: number
    copiedToIntercom: number
    alreadyExistInIntercom: number
}

export class UsersCopyingService {
    discordUsersService: UsersService
    intercomContactsService: ContactsService

    constructor(discordUsersService: UsersService, intercomContactsService: ContactsService) {
        this.discordUsersService = discordUsersService
        this.intercomContactsService = intercomContactsService
    }

    discordToIntercom = async (): Promise<DiscordToIntercomResult> => {
        const users = this.discordUsersService.getAllUsers() || []

        let discordUsersCount = users.length
        let discordBotsCount = 0
        let copiedToIntercom = 0
        let alreadyExistInIntercom = 0

        const promises = []

        users.forEach((user: User) => {
            if (user.bot) {
                discordBotsCount++
                return
            }

            promises.push(async () => {
                console.debug(new Date().toISOString(), 'info', 'copying to intercom user ', user.username + ' ...')
                try {
                    const newContact: NewDiscordContact = {
                        role: 'user',
                        external_id: user.id,
                        name: user.username,
                        avatar: user.avatar || ''
                    }

                    const validationResult = validateContact(newContact)

                    if (validationResult) {
                        console.error(new Date().toISOString(), 'error', 'error while copying to intercom user - invalid', user.username, validationResult)
                        return
                    }

                    await this.intercomContactsService.copyContactFromDiscord(newContact)
                    copiedToIntercom++
                } catch (e) {
                    console.error(new Date().toISOString(), 'error', 'error while copying to intercom user ', user.username, getAxiosErrorSummary(e))
                    if (e.response?.status === 409) {
                        alreadyExistInIntercom++
                    }
                }
            })
        })

        await Promise.all(promises.map(pr => pr()))

        return {
            discordUsersCount,
            discordBotsCount,
            copiedToIntercom,
            alreadyExistInIntercom,
        }
    }
}

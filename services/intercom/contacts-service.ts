import { GET, NextMiddleware, POST, PUT, RequestError } from '../base-http-service'
import {
    Contact,
    ContactSearchResponse,
    DiscordContactFull,
    NewDiscordContact,
    validateContact
} from './domain/contact'
import { BaseIntercomHttpService } from './base-intercom-http-service'
import { toIntercomExternalId } from './external-id-normalizer-utils'
import { AxiosError } from 'axios'

export class ContactsService extends BaseIntercomHttpService {

    constructor(serverUrl: string, token: string) {
        super(serverUrl, token)
    }

    getFirst150Contacts = (): Promise<{ data: Contact[] }> => {
        return super.send<{ data: Contact[] }>({
            method: GET,
            url: '/contacts',
            params: {
                per_page: 150
            }
        })
    }

    // TODO handle contact not found
    getContactByExternalId = (externalId: string): Promise<Contact> => {
        return super.send<ContactSearchResponse>({
            method: POST,
            url: '/contacts/search',
            data: {
                query: {
                    field: 'external_id',
                    operator: '=',
                    value: toIntercomExternalId(externalId)
                }
            }
        })
            .then(response => {
                if (response.data.length !== 1) {
                    // TODO handle 0 or multiple contacts found
                    return null
                }
                return response.data[0]
            })
    }

    copyContactFromDiscord = (discordUserId: string, name: string, avatar: string): Promise<void | Contact | AxiosError> => {
        const newContact: NewDiscordContact = {
            role: 'user',
            external_id: toIntercomExternalId(discordUserId),
            name,
            avatar: avatar || ''
        }

        const validationResult = validateContact(newContact)

        if (validationResult) {
            console.error(new Date().toISOString(), 'error', 'error while copying to intercom user - invalid', name, validationResult)
            return
        }

        console.debug(new Date().toISOString(), 'info', 'copying to intercom ...', name)

        return super.send<Contact>({
            method: POST,
            url: '/contacts',
            data: newContact
        }, {
            errorMiddlewares: [(error: RequestError, next: NextMiddleware): void => {
                throw error
            }]
        })
    }

    deleteContact = (intercomId: string): Promise<void> => {
        throw new Error('DELETED CONTACT CANNOT BE CREATED AGAIN (user with same external_id)')
        // return super.send<void>({
        //     method: DELETE,
        //     url: `/contacts/${intercomId}`,
        // })
    }
}

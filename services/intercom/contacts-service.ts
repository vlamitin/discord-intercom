import { GET, NextMiddleware, POST, RequestError } from '../base-http-service'
import { Contact, ContactSearchResponse, NewContact, NewDiscordContact, validateContact } from './domain/contact'
import { BaseIntercomHttpService } from './base-intercom-http-service'
import { AxiosError } from 'axios'

export class ContactsService extends BaseIntercomHttpService {

    constructor(serverUrl: string, token: string) {
        super(serverUrl, token)
    }

    getAllContacts = (): Promise<Contact[]> => {
        return super.send<Contact[]>({
            method: GET,
            url: '/contacts',
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
                    value: externalId
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
            external_id: discordUserId,
            name,
            avatar: avatar || ''
        }

        const validationResult = validateContact(newContact)

        if (validationResult) {
            console.error(new Date().toISOString(), 'error', 'error while copying to intercom user - invalid', name, validationResult)
            return
        }

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
}

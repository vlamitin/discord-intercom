import { GET, NextMiddleware, POST, RequestError } from '../base-http-service'
import { Contact, ContactSearchResponse, NewContact, NewDiscordContact } from './domain/contact'
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

    copyContactFromDiscord = (contact: NewDiscordContact): Promise<Contact | AxiosError> => {
        return super.send<Contact>({
            method: POST,
            url: '/contacts',
            data: contact
        }, {
            errorMiddlewares: [(error: RequestError, next: NextMiddleware): void => {
                throw error
            }]
        })
    }
}

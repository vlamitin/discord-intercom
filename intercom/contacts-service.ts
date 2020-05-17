import { GET, NextMiddleware, POST, RequestError } from '../base-http-service'
import { Contact, NewContact, NewDiscordContact } from './domain/contact'
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

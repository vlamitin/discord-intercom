// https://developers.intercom.com/intercom-api-reference/reference#create-contact
export interface NewContact {
    role: 'user' | 'lead'
    external_id?: string
    email?: string

    phone?: string
    name?: string
    avatar?: string
    signed_up_at?: number // timestamp
    last_seen_at?: number // timestamp
    owner_id?: number
    unsubscribed_from_emails?: boolean
    custom_attributes?: object
}

interface DiscordSpecificCustomAttributes {
    discordUserId: string
    discordUsername: string

    [key: string]: any
}

export interface NewDiscordContact extends Omit<NewContact, 'custom_attributes'> {
    // TODO we need to create those attributes first https://developers.intercom.com/intercom-api-reference/reference#create-data-attributes
    // custom_attributes: DiscordSpecificCustomAttributes
    custom_attributes?: any
}

// full model https://developers.intercom.com/intercom-api-reference/reference#contacts-model
// here we list only fields that matter
export interface ContactFull extends NewContact {
    type: 'contact'
    id: string

    [key: string]: any
}

export interface DiscordContactFull extends Omit<ContactFull, 'custom_attributes'> {
    custom_attributes: DiscordSpecificCustomAttributes
}

export type Contact = DiscordContactFull

export interface ContactSearchResponse {
    type: 'list'
    data: Contact[]
    total_count: number

    [key: string]: any
}

export function validateContact(contact: NewDiscordContact): string {
    const generateResultString = (reason: string) => `Invalid contact: ${reason}, see rules of validation here https://developers.intercom.com/intercom-api-reference/reference#create-contact`
    if (contact.role === 'user') {
        if (!contact.external_id && !contact.email) {
            return generateResultString('no email or external_id provided')
        }
    }

    if (contact.role === 'lead') {
        if (!contact.email) {
            return generateResultString('no email provided')
        }
    }

    return ''
}

export function getExampleContactForCreation(): NewDiscordContact {
    return {
        "role": "user",
        // "external_id": "25",
        "email": "wash@serenity.io",
        "phone": "+1123456789",
        "name": "Hoban Washburn",
        "avatar": "https://example.org/128Wash.jpg",
        // "last_seen_at": 1571069751,
        // "signed_up_at": 1571069751,
        // "owner_id": 127,
        // "unsubscribed_from_emails": false
    }
}

export function getExampleContact(): Contact {
    return {
        "type": "contact",
        "id": "5ba682d23d7cf92bef87bfd4",
        "workspace_id": "ecahpwf5",
        "external_id": "25",
        "role": "user",
        "email": "wash@serenity.io",
        "phone": "+1123456789",
        "name": "Hoban Washburn",
        "avatar": "https://example.org/128Wash.jpg",
        "owner_id": 127,
        "social_profiles": {
            "type": "list",
            "data": [
                {
                    "type": "social_profile",
                    "name": "Twitter",
                    "url": "http://twitter.com/th1sland"
                }
            ]
        },
        "has_hard_bounced": false,
        "marked_email_as_spam": false,
        "unsubscribed_from_emails": false,
        "created_at": 1571672154,
        "updated_at": 1571672158,
        "signed_up_at": 1571069751,
        "last_seen_at": 1571069751,
        "last_replied_at": 1571672158,
        "last_contacted_at": 1571672158,
        "last_email_opened_at": 1571673478,
        "last_email_clicked_at": 1571676789,
        "language_override": null,
        "browser": "chrome",
        "browser_version": "77.0.3865.90",
        "browser_language": "en",
        "os": "OS X 10.14.6",
        "location": {
            "type": "location",
            "country": "Ireland",
            "region": "Dublin",
            "city": "Dublin"
        },
        "android_app_name": null,
        "android_app_version": null,
        "android_device": null,
        "android_os_version": null,
        "android_sdk_version": null,
        "android_last_seen_at": null,
        "ios_app_name": null,
        "ios_app_version": null,
        "ios_device": null,
        "ios_os_version": null,
        "ios_sdk_version": null,
        "ios_last_seen_at": null,
        "custom_attributes": {
            "discordUserId": "123523465234",
            "isDiscordBot": false,
            "discordUsername": "safdgsdf",
            "paid_subscriber": true,
            "monthly_spend": 155.5,
            "team_mates": 1
        },
        "tags": {
            "type": "list",
            "data": [
                {
                    "type": "tag",
                    "id": "2",
                    "url": "/tags/2"
                },
                {
                    "type": "tag",
                    "id": "4",
                    "url": "/tags/4"
                },
                {
                    "type": "tag",
                    "id": "5",
                    "url": "/tags/5"
                }
            ],
            "url": "/contacts/5ba682d23d7cf92bef87bfd4/tags",
            "total_count": 3,
            "has_more": false
        },
        "notes": {
            "type": "list",
            "data": [
                {
                    "type": "note",
                    "id": "20114858",
                    "url": "/notes/20114858"
                }
            ],
            "url": "/contacts/5ba682d23d7cf92bef87bfd4/notes",
            "total_count": 1,
            "has_more": false
        },
        "companies": {
            "type": "list",
            "data": [
                {
                    "type": "company",
                    "id": "5ba686093d7cf93552a3dc99",
                    "url": "/companies/5ba686093d7cf93552a3dc99"

                },
                {
                    "type": "company",
                    "id": "5cee64a03d7cf90c51b36f19",
                    "url": "/companies/5cee64a03d7cf90c51b36f19"
                },
                {
                    "type": "company",
                    "id": "5d7668883d7cf944dbc5c791",
                    "url": "/companies/5d7668883d7cf944dbc5c791"
                }
            ],
            "url": "/contacts/5ba682d23d7cf92bef87bfd4/companies",
            "total_count": 3,
            "has_more": false
        }
    }
}

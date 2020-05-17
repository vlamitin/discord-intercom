export interface Message {
    type: 'message'
    id: string

    [key: string]: any
}

export function getExampleMessage(): Message {
    return {
        "type": "message",
        "id": "489373052",
        "created_at": 1539897198,
        "subject": "This is the subject - if it's an email",
        "body": "<p>Hello</p>",
        "message_type": "email"
    }
}

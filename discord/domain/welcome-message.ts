export interface WelcomeMessage {
    content: string
    /* channels to send welcome messages to
    * - 'dm' - for direct message
    * - other string - for sending to channel with that name */
    channel: 'dm' | string
}

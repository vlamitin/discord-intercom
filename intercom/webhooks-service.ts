import * as express from 'express'
import { WebhookEvent } from './domain/webhook-event'

export class WebhooksService {
    handleHook = async (intercomEvent: WebhookEvent): Promise<void> => {
        console.log('intercomEvent', JSON.stringify(intercomEvent))
    }
}

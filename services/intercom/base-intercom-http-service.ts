import { BaseHttpService, RequestConfig, RequestOptions } from '../base-http-service'

export class BaseIntercomHttpService extends BaseHttpService {

    token: string = ''

    constructor(serverUrl: string, token: string) {
        super()
        this.setServerUrl(serverUrl)
        this.token = token
    }

    protected async send<T>(config: RequestConfig, options: RequestOptions = {}): Promise<T> {
        return super.send({
            ...config,
            headers: {
                Authorization: `Bearer ${this.token}`,
                Accept: 'application/json',
                'Content-Type': 'application/json',
                ...config.headers
            },
        }, options)
    }
}

export class AppIntercomAuthService {
    clientID: string = ''
    appID: string = ''

    constructor(clientID: string, appID: string) {
        this.clientID = clientID
        this.appID = appID
    }

    checkSubscriptionId = (subscriptionId: string): boolean => {
        return subscriptionId === `nsub_wd_${this.clientID}_${this.appID}`
    }
}

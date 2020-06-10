export interface Config {
    httpPort: number
    httpsPort: number
    publicCertRelativePath: string
    privateCertKeyRelativePath: string
    discordBotToken: string
    intercomApiUrl: string
    /* https://app.intercom.com/a/apps/<INTERCOM_APP_ID>/developer-hub/app-packages/<PACKAGE_ID>/basic-info */
    intercomClientID: string
    intercomAppID: string
    intercomAppToken: string
}

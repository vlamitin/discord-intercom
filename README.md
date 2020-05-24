# discord-intercom
Integration between discord and intercom

## Highlights
- copy discord users to intercom
- broadcast message to multiple discord users
- communicate with discord users via intercom

## Prerequisites
- node v10.*
- npm v6.*
- https domain name (needed for intercom webhooks handling)

## Setting up discord and intercom
- [get discord token](https://discordjs.guide/preparations/setting-up-a-bot-application.html#your-token)
- add discord bot to your discord server
- [get intercom token](https://developers.intercom.com/building-apps/docs/authentication-types#section-how-to-get-your-access-token)
- [set intercom webhook endpoint](https://developers.intercom.com/building-apps/docs/setting-up-webhooks)
- set `https://<your domain name>/api/intercom/hooks` as webhook endpoint in intercom account 

## Configuring
- `npm ci`
- `cp config.json.example config.json`
- fill config.json with your params (discord and intercom tokens, etc)
- `cp serialized-state.json.example serialized-state.json`
- fill serialized-state.json with default state (see format description in serialized-state.ts)

## Local run
- `npm run start`

## Development tips
- while getting new discord token is free, creating new intercom account needs you to fill credit card details to gain trial  
- use ngrok to get https endpoint
- use `ts-node ./intercom/intercom-services-tester.ts` to test your external requests

## License
- TODO

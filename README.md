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
- add discord bot to your discord server: https://discord.com/developers/applications -> new application -> open this created application -> bot tab -> add bot -> add privileges to bot (ingeger 523328) -> general info tab -> copy CLIENT ID -> open link in browser https://discordapp.com/oauth2/authorize?client_id=<CLIENT ID>&scope=bot -> add bot to your server  


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

## Docker run
- `npm run docker:build`
- copy config.json and serialized-state.json to some folder, e.g /tmp/app
- `cd /tmp/app`
- `docker run -d -p 3002:3002 -v $PWD/config.json:/app/config.json -v $PWD/serialized-state.json:/app/serialized-state.json discord-intercom:latest` 

## Development tips
- while getting new discord token is free, creating new intercom account needs you to fill credit card details to gain trial  
- use ngrok to get https endpoint
- use `ts-node ./intercom/tester.ts` to test your services

## License
- TODO

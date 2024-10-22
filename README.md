# discord-intercom
Integration between discord and intercom

## Highlights
- copy discord users to intercom
- broadcast message to multiple discord users
- communicate with discord users via intercom

## Prerequisites
- node v12.*
- npm v6.*
- https domain name (needed for intercom webhooks handling)

## Setting up discord and intercom
- [get discord token](https://discordjs.guide/preparations/setting-up-a-bot-application.html#your-token)
- add discord bot to your discord server: https://discord.com/developers/applications -> new application -> open this created application -> bot tab -> add bot -> add privileges to bot (ingeger 523328) -> general info tab -> copy CLIENT ID -> open link in browser https://discordapp.com/oauth2/authorize?client_id=<CLIENT ID>&scope=bot -> add bot to your server  

- [get intercom token](https://developers.intercom.com/building-apps/docs/authentication-types#section-how-to-get-your-access-token)
- [get intercom app id and intercom client id](https://app.intercom.com/a/apps/<INTERCOM_APP_ID>/developer-hub/app-packages/<PACKAGE_ID>/basic-info)
- [set intercom webhook endpoint](https://developers.intercom.com/building-apps/docs/setting-up-webhooks)
- set `https://<your domain name>/api/intercom/hooks` as webhook endpoint in intercom account 

## Configuring
- `npm ci`
- `cp config.json.example config.json`
- fill config.json with your params (discord and intercom tokens, etc)
- `cp serialized-state.json.example serialized-state.json`
- fill serialized-state.json with default state (see format description in serialized-state.ts)
- `cp serialized-broadcasts-data.json.example serialized-broadcasts-data.json`

## Local run
- `npm run start`

## Docker run
- `npm run docker:build`
- copy `config.json`, `serialized-state.json`, `serialized-broadcasts-data.json` and `run.bot.sh` to some folder, e.g `/tmp/app`
- `cd /tmp/app`
- `chmod +x run.bot.sh`
- `./run.bot.sh`

## Docker run with https (certbot)
- generate certificate with certbot certonly command
- fill certs location inside docker (/app/certs/fullchain.pem and /app/certs/privkey.pem)
- copy `run.bot.https.sh` to your /tmp/app folder (change path of volume with certs in your host machine according to your domain name)
- `chmod +x run.bot.https.sh`
- `./run.bot.https.sh`

## Development tips
- while getting new discord token is free, creating new intercom account needs you to fill credit card details to gain trial  
- use ngrok to get https endpoint
- use `ts-node ./intercom/tester.ts` to test your services

## License
- TODO

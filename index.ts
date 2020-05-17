import * as express from 'express';
import * as bodyParser from 'body-parser'
import { setRoutes } from './routes'
import { Client } from 'discord.js'
import { startDiscordBot } from './discord/bot-starter'
import { BaseHttpService, getAxiosErrorSummary } from './base-http-service'

const config = require('./config.json')

async function start(): Promise<void> {
    BaseHttpService.generalErrorMiddlewares.push(((error, next) => {
        console.error(new Date().toISOString(), 'error', `BaseHttpService, Axios error:\n`, getAxiosErrorSummary(error))
    }))

    const discordClient = await startDiscordBot(config.discordBotToken)
    return startControllerServer(discordClient)
}

async function startControllerServer(discordClient: Client): Promise<void> {
    const port = process.env.API_PORT || config.port || 3002

    const appServer: express.Express = express()

    appServer.use(bodyParser.json())
    appServer.all('*', (req, res, next) => {
        console.debug(new Date().toISOString(), 'info', req.method, req.path)
        res.set({
            'Access-Control-Allow-Origin': '*',
            'Access-Control-Allow-Headers': 'Content-Type, X-Requested-With, Authorization',
            'Access-Control-Allow-Methods': 'GET, POST, DELETE, PUT, PATCH',
        })
        next()
    })

    setRoutes(appServer, discordClient, config)

    appServer.use((err, req, res, next) => {
        console.error(new Date().toISOString(), 'error', err)
        res.status(500).send({ error: err.message })
    })

    return new Promise(resolve => {
        appServer.listen(port, () => {
            console.debug(new Date().toISOString(), 'info', 'Discord controller running on port:', port);
            resolve()
        })
    })
}

start()

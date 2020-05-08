import * as express from 'express'
import { Client } from 'discord.js'
import { UsersService } from './users-service'

export function setRoutes(discordBotControllerServer: express.Express, discordClient: Client) {
    const usersService = new UsersService(discordClient)

    discordBotControllerServer.post('/api/users/broadcast',  usersService.broadcast)
}

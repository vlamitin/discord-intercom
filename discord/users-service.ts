import { Client, User } from 'discord.js'

export class UsersService {
    discordClient: Client

    constructor(discordClient: Client) {
        this.discordClient = discordClient
    }

    getAllUsers = (): User[] => {
        return this.discordClient.users.cache.map(user => user)
    }
}

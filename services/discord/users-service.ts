import { Client, Role, User } from 'discord.js'

export class UsersService {
    discordClient: Client

    constructor(discordClient: Client) {
        this.discordClient = discordClient
    }

    getAllUsers = (): User[] => {
        return this.discordClient.users.cache.map(user => user)
    }

    getAllRoles = (): Role[] => {
        return this.discordClient.guilds.cache.flatMap(g => g.roles.cache).map(v => v);
    }
}

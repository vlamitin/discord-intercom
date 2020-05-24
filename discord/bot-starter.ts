import { Client } from 'discord.js'

export async function startDiscordBot(discordBotToken: string): Promise<Client> {
    return new Promise(resolve => {
        const discordClient = new Client()

        discordClient.on("ready", () => {
            console.debug(new Date().toISOString(), 'info', 'Discord bot has started')
            // Example of changing the bot's playing game to something useful. `client.user` is what the
            // docs refer to as the "ClientUser".
            discordClient.user.setActivity(`Listening for you questions ...`)

            resolve(discordClient)
        })

        discordClient.login(discordBotToken)
    })
}

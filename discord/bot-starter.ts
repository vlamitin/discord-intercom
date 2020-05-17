import { Client, Message } from 'discord.js'

export async function startDiscordBot(discordBotToken: string): Promise<Client> {
    return new Promise(resolve => {
        const discordClient = new Client();

        discordClient.on("ready", () => {
            console.debug(new Date().toISOString(), 'info', 'Discord bot has started');
            resolve(discordClient)
            // Example of changing the bot's playing game to something useful. `client.user` is what the
            // docs refer to as the "ClientUser".
            discordClient.user.setActivity(`Serving servers`);
        });

        discordClient.on("message", async (message: Message) => {
            console.log(`new message from ${message.author.username} "${message.content}"`)
        });

        discordClient.login(discordBotToken);
    })
}

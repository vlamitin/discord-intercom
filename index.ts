import { Client, Message } from 'discord.js'
import { startDiscordControllerServer } from './discord-http-controller/main'

async function start() {
    const discordClient = new Client();
    const config = require("./config.json");

    discordClient.on("ready", () => {
        console.log(`Discord bot has started`);

        // Example of changing the bot's playing game to something useful. `client.user` is what the
        // docs refer to as the "ClientUser".
        discordClient.user.setActivity(`Serving servers`);
    });

    discordClient.on("message", async (message: Message) => {
        console.log(`new message from ${message.author.username} "${message.content}"`)
    });

    await discordClient.login(config.discordBotToken);
    startDiscordControllerServer(discordClient)
}

start()

import { Client, Events, GatewayIntentBits, TextChannel } from "discord.js";
import chalk from "chalk";
import { StatusSystemStart } from "./functions/statusSystem";

require("dotenv").config();
const client = new Client({ intents: [ GatewayIntentBits.Guilds, GatewayIntentBits.GuildPresences ] });
export { client }

client.once(Events.ClientReady, async () => {
    if (client.guilds.cache.size > 1) {
        console.log(chalk.blue(
            "A bot jelenleg több discord szerveren is jelen van. Erre nincs felkészítve, így csak az egyiken fog megfelelően működni.\nMegfelelő működés helye: " +
            client.guilds.cache.first()!.name
        ));
        client.guilds.cache.forEach(guild => {
            console.log(chalk.red(`Szerver neve: ${guild.name}, ID: ${guild.id}`));
        });
    } else {
        try {
            await StatusSystemStart();
            console.log(chalk.green(`${client.user?.username} sikeresen elindult!`));
        } catch (e) {
            console.log(e);
            console.log(chalk.red("Hibát találtam! Konzolban találod a hibakódot"));
        }
    }
});

export function GetChannel(id: string) {
    const guild = client.guilds.cache.first();
    const channel = guild?.channels.cache.get(`${id}`);
    return channel as TextChannel;
}

client.login(process.env.TOKEN).then(() => {
    console.log(chalk.green("Sikeresen bejelentkeztem!"));
}).catch(e => {
    console.log(chalk.red("Hiba történt a bejelentkezés során!"));
    console.log(e);
});

import { Client, Events, GatewayIntentBits, TextChannel } from "discord.js";
import chalk from "chalk";
import { StatusSystem } from "./functions/statusSystem";

require("dotenv").config();
const client = new Client({ intents: [ GatewayIntentBits.Guilds, GatewayIntentBits.GuildPresences ] });
const guild = client.guilds.cache.first();
export { client, guild }

client.once(Events.ClientReady, async (c: { user: { tag: any; }; }) => {
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
            await StatusSystem();
            console.log(chalk.green(`${client.user?.username} sikeresen elindult!`));
        } catch (e) {
            console.log(e);
            console.log(chalk.red("Hibát találtam! Konzolban találod a hibakódot"));
        }
    }
});

export function GetMember(id: string) {
    const guild = client.guilds.cache.first();
    const member = guild!.members.cache.get(`${id}`);
    return member;
}

export function GetChannel(id: string) {
    const guild = client.guilds.cache.first();
    const channel = guild?.channels.cache.get(`${id}`);
    return channel as TextChannel;
}

client.login(process.env.TOKEN);

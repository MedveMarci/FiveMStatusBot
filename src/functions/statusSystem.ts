import { client, GetChannel } from "../index";
import { ActivityType, EmbedBuilder, Message, TextChannel } from "discord.js";
import axios from "axios";
import chalk from "chalk";
require("dotenv").config();


let firstRun = true;
let message: Message<boolean>;
let players: string[] = [];
let joinedPlayers

export async function StatusSystem() {
    const channel = GetChannel(`${process.env.StatusChannel}`);
    const messages = await channel.messages.fetch();
    if (messages.size !== 0) {
        await channel.messages.fetch().then(message => {
            channel.bulkDelete(message);
        })
        await sendServerStatus(channel);
    } else {
        await sendServerStatus(channel);
    }
}

async function sendServerStatus(channel: TextChannel) {
    try {
        players = []
        const info = await axios.get(`http://${process.env.serverIP}:${process.env.serverPort}/info.json`);
        const player = await axios.get(`http://${process.env.serverIP}:${process.env.serverPort}/players.json`);
        if (player.data.length === 0) {
            players = ["Jelenleg nincs játékos a szerveren"]
        } else {
            player.data.forEach((name: any) => {
                players.push(name.name)
            });
        }
        joinedPlayers = players.join(", ")
        const status = new EmbedBuilder()
        .setTitle(`${process.env.ServerName}`)
        .setTimestamp()
        .setFooter({ text: "Frissítve:" })
        .setDescription(`**Játékosok**: \n${joinedPlayers}`)
        .addFields(
            {
                name: "Játékosok száma", value: `${player.data.length}/${info.data.vars.sv_maxClients}`, inline: true
            },
            {
                name: "Szerver állapot", value: `ELÉRHETŐ :green_circle:`, inline: true
            },
            {
                name: "IP:", value: `${process.env.serverIP}`, inline: true
            }
        )
        if (firstRun) {
            message = await channel.send({ embeds: [ status ] });
            console.log(chalk.green("A bot sikeresen elindult!"));
            client.user?.setStatus("online");
            client.user?.setActivity(`${player.data.length} játékos elérhető a ${process.env.ServerName} szerveren!`, { type: ActivityType.Watching });
            console.log(chalk.blue("A státusz sikeresen frissült!"));
            firstRun = false;
        } else {
            await message.edit({ embeds: [ status ] });
            client.user?.setStatus("online");
            client.user?.setActivity(`${player.data.length} játékos elérhető a ${process.env.ServerName} szerveren!`, { type: ActivityType.Watching });
            console.log(chalk.blue("A státusz sikeresen frissült!"));
        }
    } catch (e) {
        const status = new EmbedBuilder()
        .setTitle(`${process.env.ServerName}`)
        .setTimestamp()
        .setFooter({ text: "Frissítve:" })
        .setDescription(`**Játékosok**: \nIsmeretlen`)
        .addFields(
            {
                name: "Játékosok száma", value: `Ismeretlen`, inline: false
            },
            {
                name: "Szerver állapota", value: `OFFLINE :x:`, inline: true
            },
            {
                name: "IP:", value: `${process.env.serverIP}`, inline: true
            }
        )
        if (firstRun) {
            message = await channel.send({ embeds: [ status ] });
            console.log(chalk.red("A státusz sikeresen frissült! OFFLINE"));
            client.user?.setStatus("dnd");
            client.user?.setActivity(`A szerver OFFLINE`, { type: ActivityType.Watching });
            firstRun = false;
        } else {
            await message.edit({ embeds: [ status ] });
            console.log(chalk.red("A státusz sikeresen frissült! OFFLINE"));
            client.user?.setStatus("dnd")
            client.user?.setActivity(`A szerver OFFLINE`, { type: ActivityType.Watching });
        }
    } finally {
        setTimeout(sendServerStatus, 10000);
    }
}
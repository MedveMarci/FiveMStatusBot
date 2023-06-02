import { client, GetChannel } from "../index";
import { ActivityType, EmbedBuilder } from "discord.js";
import { request } from "undici";

require("dotenv").config();
const fs = require("fs");

let players: string[] = [];
let joinedPlayers;
let serverstatus: string;
let ip: string;


export async function StatusSystemStart() {
    const channel = CheckChannel();
    const embed = new EmbedBuilder()
    .setTitle(`${process.env.SERVER_NAME} 0/0 játékos`)
    .setDescription("Éppen indul a bot")
    .addFields(
        { name: `Állapot :construction_worker:`, value: "Éppen indul a bot", inline: true }
    )
    .setColor("Grey")
    .setThumbnail(client.guilds.cache.first()!.iconURL()!)
    .setTimestamp();
    const lmessage = JSON.parse(fs.readFileSync("./message.json", "utf-8"));
    channel?.messages.fetch({ limit: 1 }).then(async messages => {
        let lastMessage = messages.first();
        if (lmessage.messageID === lastMessage?.id) {
            const statusmessage = await channel?.messages.fetch(lmessage.messageID);
            await statusmessage?.edit({ embeds: [ embed ] });
            fs.writeFileSync("./message.json", JSON.stringify({ messageID: channel?.messages.cache.last()?.id }));
            await StatusSystem();
        } else {
            const message = await channel?.send({ embeds: [ embed ] });
            fs.writeFileSync("./message.json", JSON.stringify({ messageID: message?.id }));
            await StatusSystem();
        }
    });
}


async function StatusSystem() {
    const lmessage = JSON.parse(fs.readFileSync("./message.json", "utf-8"));
    const channel = CheckChannel();
    const url = `http://${process.env.SERVER_IP}:${process.env.SERVER_PORT}`;
    try {
        players = [];
        const json = await (await request(`${url}/info.json`, { method: "GET" })).body.json();
        const player = await (await request(`${url}/players.json`, { method: "GET" })).body.json();
        if (player.length === 0) {
            players = [ "Jelenleg nincs játékos a szerveren" ];
        } else {
            player.forEach((name: any) => {
                players.push("`" + `${name.name}` + "`");
            });
        }
        joinedPlayers = players.join(":diamond_shape_with_a_dot_inside:");
        if (process.env.WHITELIST === "true") {
            serverstatus = "Whitelist bekapcsolva :lock:";
            ip = "Nem elérhető";
        } else {
            serverstatus = "ELÉRHETŐ :white_check_mark:";
            ip = `${process.env.serverIP} :electric_plug:`;
        }
        const embed = new EmbedBuilder()
        .setTitle(`${process.env.SERVER_NAME} ${player.length}/${json.vars.sv_maxClients} játékos`)
        .setDescription(`${joinedPlayers}`)
        .addFields(
            { name: `Állapot :white_check_mark:`, value: `${serverstatus}`, inline: true },
            { name: `IP :telescope:`, value: `${ip}`, inline: true }
        )
        .setColor("Green")
        .setThumbnail(client.guilds.cache.first()!.iconURL()!)
        .setTimestamp();
        const lastmessage = await channel?.messages.fetch(lmessage.messageID);
        await lastmessage?.edit({ embeds: [ embed ] });
    } catch (e) {
        if (process.env.WHITELIST === "true") {
            serverstatus = "Whitelist bekapcsolva :lock:";
            ip = "Nem elérhető";
        } else {
            serverstatus = "NEM ELÉRHETŐ :x:";
            ip = `${process.env.serverIP} :electric_plug:`;
        }
        const embed = new EmbedBuilder()
        .setTitle(`${process.env.SERVER_NAME} 0/0 játékos`)
        .addFields(
            { name: `Állapot :x:`, value: `${serverstatus}`, inline: true },
            { name: `IP :telescope:`, value: `${ip}`, inline: true }
        )
        .setColor("Red")
        .setThumbnail(client.guilds.cache.first()!.iconURL()!)
        .setTimestamp();
        const lastmessage = await channel?.messages.fetch(lmessage.messageID);
        await lastmessage?.edit({ embeds: [ embed ] });
    } finally {
        setTimeout(StatusSystem, 5000);
    }
}

function CheckChannel() {
    const channel = GetChannel(process.env.STATUS_CHANNEL_ID!);
    if (channel == null) {
        console.log("A csatorna nem található!");
        return;
    }
    return channel;
}

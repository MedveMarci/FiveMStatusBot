import { client, GetChannel } from "../index";
import { ActionRowBuilder, ActivityType, ButtonBuilder, ButtonStyle, EmbedBuilder } from "discord.js";
import { request } from "undici";
import config from "../config.json";

require("dotenv").config();
const fs = require("fs");
const QuickChart = require("quickchart-js");

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
        const lastMessage = messages.first();
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
    const row = new ActionRowBuilder<ButtonBuilder>();
    if (config.Buttons.Button.enabled) {
        const button = new ButtonBuilder()
        .setStyle(ButtonStyle.Link)
        .setLabel(config.Buttons.Button.Label)
        .setURL(config.Buttons.Button.URL);
        row.addComponents(button);
    }
    if (config.Buttons.Button1.enabled) {
        const button1 = new ButtonBuilder()
        .setStyle(ButtonStyle.Link)
        .setLabel(config.Buttons.Button1.Label)
        .setURL(config.Buttons.Button1.URL);
        row.addComponents(button1);
    }
    if (config.Buttons.Button2.enabled) {
        const button2 = new ButtonBuilder()
        .setStyle(ButtonStyle.Link)
        .setLabel(config.Buttons.Button2.Label)
        .setURL(config.Buttons.Button2.URL);
        row.addComponents(button2);
    }
    if (config.Buttons.Button3.enabled) {
        const button3 = new ButtonBuilder()
        .setStyle(ButtonStyle.Link)
        .setLabel(config.Buttons.Button3.Label)
        .setURL(config.Buttons.Button3.URL);
        row.addComponents(button3);
    }
    if (config.Buttons.Button4.enabled) {
        const button4 = new ButtonBuilder()
        .setStyle(ButtonStyle.Link)
        .setLabel(config.Buttons.Button4.Label)
        .setURL(config.Buttons.Button4.URL);
        row.addComponents(button4);
    }
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
        const date = [];
        const playerData = [];
        const currentHour = new Date().getHours();
        const chartData = JSON.parse(fs.readFileSync("./chart.json", "utf-8"));
        for (let i = 0 - 24; i <= 0; i++) {
            if (i < 0) {
                date.push(`${24 + i}:00`);
            } else if (i > 23) {
                date.push(`${i - 24}:00`);
            }
        }
        if (new Date().getHours() === 0 && chartData.cleared === 0) {
            for (let i = 0; i < 24; i++) {
                chartData[i] = 0;
                chartData.cleared = 1;
                fs.writeFileSync("./chart.json", JSON.stringify(chartData));
            }
            console.log("Chart cleared " + process.env.SERVER_NAME);
        }
        if (new Date().getHours() === 1 && chartData.cleared === 1) {
            chartData.cleared = 0;
            fs.writeFileSync("./chart.json", JSON.stringify(chartData));
            console.log("Clear reset " + process.env.SERVER_NAME);
        }
        if (new Date().getMinutes() === 0 || chartData[currentHour] === 0) {
            chartData[currentHour] = player.length;
            fs.writeFileSync("./chart.json", JSON.stringify(chartData));
            console.log("Chart updated " + process.env.SERVER_NAME);
        }
        for (let i = 0 - 24; i <= currentHour; i++) {
            if (i < 0) {
                playerData.push(chartData[24 + i]);
            } else if (i > 23) {
                playerData.push(chartData[i - 24]);
            } else {
                playerData.push(chartData[i]);
            }
        }
        const maxNum = parseInt(json.vars.sv_maxClients);
        const chart = new QuickChart();
        chart.setConfig({
            type: "line",
            data: {
                labels: date,
                datasets: [
                    {
                        backgroundColor: "rgba(255, 99, 132, 0.5)",
                        borderColor: "rgb(255, 99, 132)",
                        data: playerData,
                        label: "Játékosok",
                        fill: "start"
                    }
                ]
            },
            options: {
                title: {
                    text: process.env.SERVER_NAME,
                    display: true
                },
                scales: {
                    yAxes: [
                        {
                            ticks: {
                                min: 0,
                                max: maxNum,
                                stepSize: 1,
                            },
                        },
                    ],
                }
            }
        });
        if (process.env.WHITELIST === "true") {
            serverstatus = "Whitelist bekapcsolva :lock:";
            ip = "Nem elérhető";
        } else {
            serverstatus = "ELÉRHETŐ :white_check_mark:";
            ip = `${process.env.SERVER_IP} :electric_plug:`;
        }
        const embed = new EmbedBuilder()
        .setTitle(`${process.env.SERVER_NAME} ${player.length}/${json.vars.sv_maxClients} játékos`)
        .setDescription(`${joinedPlayers}`)
        .addFields(
            { name: `Állapot :white_check_mark:`, value: `${serverstatus}`, inline: true },
            { name: `IP :telescope:`, value: `${ip}`, inline: true }
        )
        .setColor("Green")
        .setImage(`${chart.getUrl()}`)
        .setThumbnail(client.guilds.cache.first()!.iconURL()!)
        .setTimestamp()
        .setImage(`${chart.getUrl()}`);
        const lastmessage = await channel?.messages.fetch(lmessage.messageID);
        if (config.Buttons.Button.enabled || config.Buttons.Button1.enabled || config.Buttons.Button2.enabled || config.Buttons.Button3.enabled || config.Buttons.Button4.enabled) {
            await lastmessage?.edit({ embeds: [ embed ], components: [ row ] });
        }
        else {
            await lastmessage?.edit({ embeds: [ embed ], components: [] });
        }
    } catch (e) {
        console.log(e);
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
        if (config.Buttons.Button.enabled || config.Buttons.Button1.enabled || config.Buttons.Button2.enabled || config.Buttons.Button3.enabled || config.Buttons.Button4.enabled) {
            await lastmessage?.edit({ embeds: [ embed ], components: [ row ] });
        }
        else {
            await lastmessage?.edit({ embeds: [ embed ], components: [] });
        }
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

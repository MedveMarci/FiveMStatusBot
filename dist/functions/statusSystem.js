"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.StatusSystemStart = void 0;
const index_1 = require("../index");
const discord_js_1 = require("discord.js");
const undici_1 = require("undici");
const config_json_1 = __importDefault(require("../config.json"));
require("dotenv").config();
const fs = require("fs");
const QuickChart = require("quickchart-js");
let players = [];
let joinedPlayers;
let serverstatus;
let ip;
function StatusSystemStart() {
    return __awaiter(this, void 0, void 0, function* () {
        const channel = CheckChannel();
        const embed = new discord_js_1.EmbedBuilder()
            .setTitle(`${process.env.SERVER_NAME} 0/0 játékos`)
            .setDescription("Éppen indul a bot")
            .addFields({ name: `Állapot :construction_worker:`, value: "Éppen indul a bot", inline: true })
            .setColor("Grey")
            .setThumbnail(index_1.client.guilds.cache.first().iconURL())
            .setTimestamp();
        const lmessage = JSON.parse(fs.readFileSync("./message.json", "utf-8"));
        channel === null || channel === void 0 ? void 0 : channel.messages.fetch({ limit: 1 }).then((messages) => __awaiter(this, void 0, void 0, function* () {
            var _a;
            const lastMessage = messages.first();
            if (lmessage.messageID === (lastMessage === null || lastMessage === void 0 ? void 0 : lastMessage.id)) {
                const statusmessage = yield (channel === null || channel === void 0 ? void 0 : channel.messages.fetch(lmessage.messageID));
                yield (statusmessage === null || statusmessage === void 0 ? void 0 : statusmessage.edit({ embeds: [embed] }));
                fs.writeFileSync("./message.json", JSON.stringify({ messageID: (_a = channel === null || channel === void 0 ? void 0 : channel.messages.cache.last()) === null || _a === void 0 ? void 0 : _a.id }));
                yield StatusSystem();
            }
            else {
                const message = yield (channel === null || channel === void 0 ? void 0 : channel.send({ embeds: [embed] }));
                fs.writeFileSync("./message.json", JSON.stringify({ messageID: message === null || message === void 0 ? void 0 : message.id }));
                yield StatusSystem();
            }
        }));
    });
}
exports.StatusSystemStart = StatusSystemStart;
function StatusSystem() {
    return __awaiter(this, void 0, void 0, function* () {
        const lmessage = JSON.parse(fs.readFileSync("./message.json", "utf-8"));
        const channel = CheckChannel();
        const url = `http://${process.env.SERVER_IP}:${process.env.SERVER_PORT}`;
        const row = new discord_js_1.ActionRowBuilder();
        if (config_json_1.default.Buttons.Button.enabled) {
            const button = new discord_js_1.ButtonBuilder()
                .setStyle(discord_js_1.ButtonStyle.Link)
                .setLabel(config_json_1.default.Buttons.Button.Label)
                .setURL(config_json_1.default.Buttons.Button.URL);
            row.addComponents(button);
        }
        if (config_json_1.default.Buttons.Button1.enabled) {
            const button1 = new discord_js_1.ButtonBuilder()
                .setStyle(discord_js_1.ButtonStyle.Link)
                .setLabel(config_json_1.default.Buttons.Button1.Label)
                .setURL(config_json_1.default.Buttons.Button1.URL);
            row.addComponents(button1);
        }
        if (config_json_1.default.Buttons.Button2.enabled) {
            const button2 = new discord_js_1.ButtonBuilder()
                .setStyle(discord_js_1.ButtonStyle.Link)
                .setLabel(config_json_1.default.Buttons.Button2.Label)
                .setURL(config_json_1.default.Buttons.Button2.URL);
            row.addComponents(button2);
        }
        if (config_json_1.default.Buttons.Button3.enabled) {
            const button3 = new discord_js_1.ButtonBuilder()
                .setStyle(discord_js_1.ButtonStyle.Link)
                .setLabel(config_json_1.default.Buttons.Button3.Label)
                .setURL(config_json_1.default.Buttons.Button3.URL);
            row.addComponents(button3);
        }
        if (config_json_1.default.Buttons.Button4.enabled) {
            const button4 = new discord_js_1.ButtonBuilder()
                .setStyle(discord_js_1.ButtonStyle.Link)
                .setLabel(config_json_1.default.Buttons.Button4.Label)
                .setURL(config_json_1.default.Buttons.Button4.URL);
            row.addComponents(button4);
        }
        try {
            players = [];
            const json = yield (yield (0, undici_1.request)(`${url}/info.json`, { method: "GET" })).body.json();
            const player = yield (yield (0, undici_1.request)(`${url}/players.json`, { method: "GET" })).body.json();
            if (player.length === 0) {
                players = ["Jelenleg nincs játékos a szerveren"];
            }
            else {
                player.forEach((name) => {
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
                }
                else if (i > 23) {
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
                }
                else if (i > 23) {
                    playerData.push(chartData[i - 24]);
                }
                else {
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
            }
            else {
                serverstatus = "ELÉRHETŐ :white_check_mark:";
                ip = `${process.env.SERVER_IP} :electric_plug:`;
            }
            const embed = new discord_js_1.EmbedBuilder()
                .setTitle(`${process.env.SERVER_NAME} ${player.length}/${json.vars.sv_maxClients} játékos`)
                .setDescription(`${joinedPlayers}`)
                .addFields({ name: `Állapot :white_check_mark:`, value: `${serverstatus}`, inline: true }, { name: `IP :telescope:`, value: `${ip}`, inline: true })
                .setColor("Green")
                .setImage(`${chart.getUrl()}`)
                .setThumbnail(index_1.client.guilds.cache.first().iconURL())
                .setTimestamp()
                .setImage(`${chart.getUrl()}`);
            const lastmessage = yield (channel === null || channel === void 0 ? void 0 : channel.messages.fetch(lmessage.messageID));
            if (config_json_1.default.Buttons.Button.enabled || config_json_1.default.Buttons.Button1.enabled || config_json_1.default.Buttons.Button2.enabled || config_json_1.default.Buttons.Button3.enabled || config_json_1.default.Buttons.Button4.enabled) {
                yield (lastmessage === null || lastmessage === void 0 ? void 0 : lastmessage.edit({ embeds: [embed], components: [row] }));
            }
            else {
                yield (lastmessage === null || lastmessage === void 0 ? void 0 : lastmessage.edit({ embeds: [embed], components: [] }));
            }
        }
        catch (e) {
            console.log(e);
            if (process.env.WHITELIST === "true") {
                serverstatus = "Whitelist bekapcsolva :lock:";
                ip = "Nem elérhető";
            }
            else {
                serverstatus = "NEM ELÉRHETŐ :x:";
                ip = `${process.env.serverIP} :electric_plug:`;
            }
            const embed = new discord_js_1.EmbedBuilder()
                .setTitle(`${process.env.SERVER_NAME} 0/0 játékos`)
                .addFields({ name: `Állapot :x:`, value: `${serverstatus}`, inline: true }, { name: `IP :telescope:`, value: `${ip}`, inline: true })
                .setColor("Red")
                .setThumbnail(index_1.client.guilds.cache.first().iconURL())
                .setTimestamp();
            const lastmessage = yield (channel === null || channel === void 0 ? void 0 : channel.messages.fetch(lmessage.messageID));
            if (config_json_1.default.Buttons.Button.enabled || config_json_1.default.Buttons.Button1.enabled || config_json_1.default.Buttons.Button2.enabled || config_json_1.default.Buttons.Button3.enabled || config_json_1.default.Buttons.Button4.enabled) {
                yield (lastmessage === null || lastmessage === void 0 ? void 0 : lastmessage.edit({ embeds: [embed], components: [row] }));
            }
            else {
                yield (lastmessage === null || lastmessage === void 0 ? void 0 : lastmessage.edit({ embeds: [embed], components: [] }));
            }
        }
        finally {
            setTimeout(StatusSystem, 5000);
        }
    });
}
function CheckChannel() {
    const channel = (0, index_1.GetChannel)(process.env.STATUS_CHANNEL_ID);
    if (channel == null) {
        console.log("A csatorna nem található!");
        return;
    }
    return channel;
}

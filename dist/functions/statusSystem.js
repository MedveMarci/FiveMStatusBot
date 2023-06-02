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
Object.defineProperty(exports, "__esModule", { value: true });
exports.StatusSystemStart = void 0;
const index_1 = require("../index");
const discord_js_1 = require("discord.js");
const undici_1 = require("undici");
require("dotenv").config();
const fs = require("fs");
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
            let lastMessage = messages.first();
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
            if (process.env.WHITELIST === "true") {
                serverstatus = "Whitelist bekapcsolva :lock:";
                ip = "Nem elérhető";
            }
            else {
                serverstatus = "ELÉRHETŐ :white_check_mark:";
                ip = `${process.env.serverIP} :electric_plug:`;
            }
            const embed = new discord_js_1.EmbedBuilder()
                .setTitle(`${process.env.SERVER_NAME} ${player.length}/${json.vars.sv_maxClients} játékos`)
                .setDescription(`${joinedPlayers}`)
                .addFields({ name: `Állapot :white_check_mark:`, value: `${serverstatus}`, inline: true }, { name: `IP :telescope:`, value: `${ip}`, inline: true })
                .setColor("Green")
                .setThumbnail(index_1.client.guilds.cache.first().iconURL())
                .setTimestamp();
            const lastmessage = yield (channel === null || channel === void 0 ? void 0 : channel.messages.fetch(lmessage.messageID));
            yield (lastmessage === null || lastmessage === void 0 ? void 0 : lastmessage.edit({ embeds: [embed] }));
        }
        catch (e) {
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
            yield (lastmessage === null || lastmessage === void 0 ? void 0 : lastmessage.edit({ embeds: [embed] }));
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

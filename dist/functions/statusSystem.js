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
exports.StatusSystem = void 0;
const index_1 = require("../index");
const discord_js_1 = require("discord.js");
const axios_1 = __importDefault(require("axios"));
const chalk_1 = __importDefault(require("chalk"));
require("dotenv").config();
let firstRun = true;
let message;
let players = [];
let joinedPlayers;
function StatusSystem() {
    return __awaiter(this, void 0, void 0, function* () {
        const channel = (0, index_1.GetChannel)(`${process.env.StatusChannel}`);
        const messages = yield channel.messages.fetch();
        if (messages.size !== 0) {
            yield channel.messages.fetch().then(message => {
                channel.bulkDelete(message);
            });
            yield sendServerStatus(channel);
        }
        else {
            yield sendServerStatus(channel);
        }
    });
}
exports.StatusSystem = StatusSystem;
function sendServerStatus(channel) {
    var _a, _b, _c, _d, _e, _f, _g, _h;
    return __awaiter(this, void 0, void 0, function* () {
        try {
            players = [];
            const info = yield axios_1.default.get(`http://${process.env.serverIP}:${process.env.serverPort}/info.json`);
            const player = yield axios_1.default.get(`http://${process.env.serverIP}:${process.env.serverPort}/players.json`);
            if (player.data.length === 0) {
                players = ["Jelenleg nincs játékos a szerveren"];
            }
            else {
                player.data.forEach((name) => {
                    players.push(name.name);
                });
            }
            joinedPlayers = players.join(", ");
            const status = new discord_js_1.EmbedBuilder()
                .setTitle(`${process.env.ServerName}`)
                .setTimestamp()
                .setFooter({ text: "Frissítve:" })
                .setDescription(`**Játékosok**: \n${joinedPlayers}`)
                .addFields({
                name: "Játékosok száma", value: `${player.data.length}/${info.data.vars.sv_maxClients}`, inline: true
            }, {
                name: "Szerver állapot", value: `ELÉRHETŐ :green_circle:`, inline: true
            }, {
                name: "IP:", value: `${process.env.serverIP}`, inline: true
            });
            if (firstRun) {
                message = yield channel.send({ embeds: [status] });
                console.log(chalk_1.default.green("A bot sikeresen elindult!"));
                (_a = index_1.client.user) === null || _a === void 0 ? void 0 : _a.setStatus("online");
                (_b = index_1.client.user) === null || _b === void 0 ? void 0 : _b.setActivity(`${player.data.length} játékos elérhető a ${process.env.ServerName} szerveren!`, { type: discord_js_1.ActivityType.Watching });
                console.log(chalk_1.default.blue("A státusz sikeresen frissült!"));
                firstRun = false;
            }
            else {
                yield message.edit({ embeds: [status] });
                (_c = index_1.client.user) === null || _c === void 0 ? void 0 : _c.setStatus("online");
                (_d = index_1.client.user) === null || _d === void 0 ? void 0 : _d.setActivity(`${player.data.length} játékos elérhető a ${process.env.ServerName} szerveren!`, { type: discord_js_1.ActivityType.Watching });
                console.log(chalk_1.default.blue("A státusz sikeresen frissült!"));
            }
        }
        catch (e) {
            const status = new discord_js_1.EmbedBuilder()
                .setTitle(`${process.env.ServerName}`)
                .setTimestamp()
                .setFooter({ text: "Frissítve:" })
                .setDescription(`**Játékosok**: \nIsmeretlen`)
                .addFields({
                name: "Játékosok száma", value: `Ismeretlen`, inline: false
            }, {
                name: "Szerver állapota", value: `OFFLINE :x:`, inline: true
            }, {
                name: "IP:", value: `${process.env.serverIP}`, inline: true
            });
            if (firstRun) {
                message = yield channel.send({ embeds: [status] });
                console.log(chalk_1.default.red("A státusz sikeresen frissült! OFFLINE"));
                (_e = index_1.client.user) === null || _e === void 0 ? void 0 : _e.setStatus("dnd");
                (_f = index_1.client.user) === null || _f === void 0 ? void 0 : _f.setActivity(`A szerver OFFLINE`, { type: discord_js_1.ActivityType.Watching });
                firstRun = false;
            }
            else {
                yield message.edit({ embeds: [status] });
                console.log(chalk_1.default.red("A státusz sikeresen frissült! OFFLINE"));
                (_g = index_1.client.user) === null || _g === void 0 ? void 0 : _g.setStatus("dnd");
                (_h = index_1.client.user) === null || _h === void 0 ? void 0 : _h.setActivity(`A szerver OFFLINE`, { type: discord_js_1.ActivityType.Watching });
            }
        }
        finally {
            setTimeout(sendServerStatus, 10000);
        }
    });
}

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
exports.GetChannel = exports.client = void 0;
const discord_js_1 = require("discord.js");
const chalk_1 = __importDefault(require("chalk"));
const statusSystem_1 = require("./functions/statusSystem");
require("dotenv").config();
const client = new discord_js_1.Client({ intents: [discord_js_1.GatewayIntentBits.Guilds, discord_js_1.GatewayIntentBits.GuildPresences] });
exports.client = client;
client.once(discord_js_1.Events.ClientReady, () => __awaiter(void 0, void 0, void 0, function* () {
    var _a;
    if (client.guilds.cache.size > 1) {
        console.log(chalk_1.default.blue("A bot jelenleg több discord szerveren is jelen van. Erre nincs felkészítve, így csak az egyiken fog megfelelően működni.\nMegfelelő működés helye: " +
            client.guilds.cache.first().name));
        client.guilds.cache.forEach(guild => {
            console.log(chalk_1.default.red(`Szerver neve: ${guild.name}, ID: ${guild.id}`));
        });
    }
    else {
        try {
            yield (0, statusSystem_1.StatusSystemStart)();
            console.log(chalk_1.default.green(`${(_a = client.user) === null || _a === void 0 ? void 0 : _a.username} sikeresen elindult!`));
        }
        catch (e) {
            console.log(e);
            console.log(chalk_1.default.red("Hibát találtam! Konzolban találod a hibakódot"));
        }
    }
}));
function GetChannel(id) {
    const guild = client.guilds.cache.first();
    const channel = guild === null || guild === void 0 ? void 0 : guild.channels.cache.get(`${id}`);
    return channel;
}
exports.GetChannel = GetChannel;
client.login(process.env.TOKEN).then(() => {
    console.log(chalk_1.default.green("Sikeresen bejelentkeztem!"));
}).catch(e => {
    console.log(chalk_1.default.red("Hiba történt a bejelentkezés során!"));
    console.log(e);
});

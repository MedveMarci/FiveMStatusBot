import { ApplicationCommandOptionType, Client, Events, GatewayIntentBits, PermissionFlagsBits, REST, Routes, SlashCommandBuilder } from "discord.js";
import chalk from "chalk";

const client = new Client({ intents: [ GatewayIntentBits.Guilds, GatewayIntentBits.GuildPresences ] });
const config = require("../config.json")[0];


const commands = [
    new SlashCommandBuilder()
        .setName("setchannel")
        .setDescription("Beállítja a státusz csatornát.")
        .setDefaultMemberPermissions(PermissionFlagsBits.Administrator)
        .addChannelOption(option =>
            option.setName("channel")
                .setDescription("A csatorna, amire beállítod a státusz csatornát.")
                .setRequired(true)
        ).toJSON(),
    new SlashCommandBuilder()
        .setName("setrestarts")
        .setDescription("Beállítja a szerver újraindításokat.")
        .setDefaultMemberPermissions(PermissionFlagsBits.Administrator)
        .addStringOption(option =>
            option.setName("restarts")
                .setDescription("A szerver újraindításainak időpontja.")
                .setRequired(true)
        ).toJSON(),
        new SlashCommandBuilder()
        .setName("setstatus")
        .setDescription("A szerver státusz be vagy ki kapcsolása.")
        .setDefaultMemberPermissions(PermissionFlagsBits.Administrator)
        .addBooleanOption(option =>
            option.setName("action")
                .setDescription("A szerver státusz be vagy ki kapcsolása.")
                .setRequired(true)
        ).toJSON(),
        new SlashCommandBuilder()
        .setName("setstatuschannel")
        .setDescription("Beállítja a státusz csatornát.")
        .setDefaultMemberPermissions(PermissionFlagsBits.Administrator)
        .addChannelOption(option =>
            option.setName("channel")
                .setDescription("A csatorna, amire beállítod a státusz csatornát.")
                .setRequired(true)
        ).toJSON(),
    new SlashCommandBuilder()
        .setName("whitelist")
        .setDescription("Whitelist be vagy ki kapcsolása.")
        .setDefaultMemberPermissions(PermissionFlagsBits.Administrator)
        .addBooleanOption(option =>
            option.setName("action")
                .setDescription("Whitelist be vagy ki kapcsolása.")
                .setRequired(true)
        ).toJSON()
];

const rest = new REST({ version: "10" }).setToken(config.Token);

client.on(Events.ClientReady, async () => {
    try {
        console.log(chalk.yellow("Elkezdem a parancsok regisztrálását!"));
        try {
            const clientId = client.user?.id || "";
            await rest.put(Routes.applicationCommands(clientId), { body: commands });
        } catch (error) {
            console.error(error);
        }
        console.log(chalk.greenBright("Sikeresen regisztráltam a parancsokat!"));
        process.exit(1);
    } catch (e) {
        console.log(e);
        console.log(chalk.red("Hibát találtam! Konzolban találod a hibakódot"));
    }
});

client.login(config.Token).then().catch(e => {
    console.log(chalk.red("Hiba történt a bejelentkezés során!"));
    console.log(e);
});
const Discord = require('discord.js');
const fs = require('fs');
const config = require('./config.json');
const guildSettings = require('./guild-settings.json');
const CommandManager = require('./commands/utils/CommandManager');

const commandManager = new CommandManager();
const client = new Discord.Client();
client.on("ready", () => {
    // Update guild-settings.json to reflect any servers that the bot joined or left while it was offline
    let change = false;
    // If the bot is in any servers that aren't in guild-settings.json, add them
    (client.guilds).forEach((value, key) => {
        if (key !== undefined && !guildSettings[key]) {
            guildSettings[key] = {
                prefix: config.prefix,
                disabled: []
            }
            change = true;
        }
    });
    // If guild-settings.json contains any servers that the bot isn't a member of, remove them
    for (var id in guildSettings) {
        if (!client.guilds.has(id)) {
            delete guildSettings[id];
            change = true;
        }
    }
    if (change) {
        fs.writeFile('./guild-settings.json', JSON.stringify(guildSettings, null, 2), (err) => {
            if (err) {
                console.log('Error adding server to guildSettings.json: ' + err);
            }
        });
    }
    commandManager.reloadSettings();
});

client.on("guildCreate", (guild) => {
    // If the bot joins a server, add it to guild-settings.json and initialize its settings to the default
    if(!guildSettings[guild.id]) {
        guildSettings[guild.id] = {
            prefix: config.prefix,
            disabled: []
        }
    }  

    fs.writeFile('./guild-settings.json', JSON.stringify(guildSettings, null, 2), (err) => {
        if (err) {
            console.log('Error adding server to guildSettings.json: ' + err);
        }
    });
});

client.on("guildDelete", (guild) => {
    // If the bot leaves a server, remove it from guild-settings.json
    if (guildSettings[guild.id]) {
        delete guildSettings[guild.id];
    }

    fs.writeFile('./guild-settings.json', JSON.stringify(guildSettings, null, 2), (err) => {
        if (err) {
            console.log('Error removing server from guildSettings.json: ' + err);
        }
    });
})

client.on('error', (error) => {
    // Handle client error event
    console.log('Error in main:', error);
})

client.on('message', (message) => {
    commandManager.processMessage(message);
});

client.login(config.token);
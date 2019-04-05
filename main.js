const Discord = require('discord.js');
const client = new Discord.Client();
const fs = require('fs');
const config = require('./config.json');
const guildSettings = require('./guild-settings.json');

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
    console.log('Error in main:\n' + error);
})

client.on('message', (message) => {
    // Ignore messages sent by the bot
    if (message.author.bot) {
        return;
    }
    
    // Ignore messages that don't start with prefix
    if (!message.content.startsWith(guildSettings[message.guild.id].prefix)) {
        return;
    }
    
    // Listen for commands
    let params = message.content.substring(guildSettings[message.guild.id].prefix.length).trim().split(' ');
    let command = params.shift();

    if (guildSettings[message.guild.id].disabled.includes(command) && 
        !message.member.permissions.has('ADMINISTRATOR')) {
        return;
    }

    try {
        let commandFile = require(`./commands/${command}.js`);
        commandFile.run(params, message);
    } catch (e) {
        if (e.code === 'MODULE_NOT_FOUND') {
            // Don't report commands that don't exist as this can clash with other bots if prefix is shared
        } else {
            message.channel.send('Error: please check the console for more details');
            console.log(e);
        }
    }
});

client.login(config.token);
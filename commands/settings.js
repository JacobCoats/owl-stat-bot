const guildSettings = require('../guild-settings.json');
const fs = require('fs');

exports.run = (params, message) => {
    if (params[0].toLowerCase() === 'prefix') {
        if (params[1]) {
            changePrefix(message, params[1]);
        } else {
            message.channel.send("Error: Please specify a new prefix");
        }
    } else if (params[0].toLowerCase() === 'enable') {
        if (params[1]) {
            enableCommand(message, params[1].toLowerCase());
        } else {
            message.channel.send("Error: Please specify a command to enable");
        }
    } else if (params[0].toLowerCase() === 'disable') {
        if (params[1]) {
            disableCommand(message, params[1].toLowerCase());
        } else {
            message.channel.send("Error: Please specify a command to disable");
        }
    }
}

function changePrefix(message, newPrefix) {
    if (!message.member.permissions.has('ADMINISTRATOR')) {
        message.channel.send("Error: only server administrators can change the server prefix");
        return;
    }

    guildSettings[message.guild.id].prefix = newPrefix;
    fs.writeFile('./guild-settings.json', JSON.stringify(guildSettings, null, 2), (err) => {
        if (err) {
            console.log('Error changing server prefix in guildSettings.json: ' + err);
        } else {
            message.channel.send('Server prefix changed to: ' + newPrefix);
        }
    });
}

function enableCommand(message, commandToEnable) {
    if (!message.member.permissions.has('ADMINISTRATOR')) {
        message.channel.send('Error: only server administrators can enable commands');
        return;
    }

    if (!commands.includes(commandToEnable)) {
        message.channel.send('Error: that command doesn\'t exist');
        return;
    }

    if (guildSettings[message.guild.id].disabled.includes(commandToEnable)) {
        guildSettings[message.guild.id].disabled.splice(
            guildSettings[message.guild.id].disabled.indexOf(commandToEnable), 1
        )
    } else {
        message.channel.send('Error: that command is already enabled');
        return;
    }

    fs.writeFile('./guild-settings.json', JSON.stringify(guildSettings, null, 2), (err) => {
        if (err) {
            console.log('Error enabling command in guildSettings.json: ' + err);
        } else {
            message.channel.send('Command enabled: ' + commandToEnable);
        }
    });
}

function disableCommand(message, commandToDisable) {
    if (!message.member.permissions.has('ADMINISTRATOR')) {
        message.channel.send('Error: only server administrators can disable commands');
        return;
    }

    if (!commands.includes(commandToDisable)) {
        message.channel.send('Error: that command doesn\'t exist');
        return;
    }

    if (guildSettings[message.guild.id].disabled.includes(commandToDisable)) {
        message.channel.send('Error: that command is already disabled');
        return;
    } else {
        guildSettings[message.guild.id].disabled.push(commandToDisable);
    }

    fs.writeFile('./guild-settings.json', JSON.stringify(guildSettings, null, 2), (err) => {
        if (err) {
            console.log('Error disabling command in guildSettings.json: ' + err);
        } else {
            message.channel.send('Command disabled: ' + commandToDisable);
        }
    });
}

let commands = [
    "help",
    "info",
    "results",
    "schedule",
    "settings",
    "standings",
    "stats"
]
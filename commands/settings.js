const guildSettings = require('../guild-settings.json');
const fs = require('fs');

exports.run = (params, message) => {
    // Decide which method to call based on the parameter that the user specified
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
    } else if (params[0].toLowerCase() === 'spoilers') {
        toggleSpoilers(message);
    }
}

function changePrefix(message, newPrefix) {
    // If the user is not an administrator, they can't change the prefix
    if (!message.member.permissions.has('ADMINISTRATOR')) {
        message.channel.send("Error: only server administrators can change the server prefix");
        return;
    }

    // Change the server's prefix in guild-settings.json and write it to the file
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
    // If the user is not an administrator, they can't enable the command
    if (!message.member.permissions.has('ADMINISTRATOR')) {
        message.channel.send('Error: only server administrators can enable commands');
        return;
    }

    // Check to make sure that the specified command exists
    if (!commands.includes(commandToEnable)) {
        message.channel.send('Error: that command doesn\'t exist');
        return;
    }

    // If the command is disabled, enable it
    if (guildSettings[message.guild.id].disabled.includes(commandToEnable)) {
        guildSettings[message.guild.id].disabled.splice(
            guildSettings[message.guild.id].disabled.indexOf(commandToEnable), 1
        )
    } else {
        message.channel.send('Error: that command is already enabled');
        return;
    }

    // Write changes to guild-settings.json
    fs.writeFile('./guild-settings.json', JSON.stringify(guildSettings, null, 2), (err) => {
        if (err) {
            console.log('Error enabling command in guildSettings.json: ' + err);
        } else {
            message.channel.send('Command enabled: ' + commandToEnable);
        }
    });
}

function disableCommand(message, commandToDisable) {
    // If the user is not an administrator, they can't disable the command
    if (!message.member.permissions.has('ADMINISTRATOR')) {
        message.channel.send('Error: only server administrators can disable commands');
        return;
    }

    // Check to make sure that the specified command exists
    if (!commands.includes(commandToDisable)) {
        message.channel.send('Error: that command doesn\'t exist');
        return;
    }

    // If the command is enabled, disable it
    if (guildSettings[message.guild.id].disabled.includes(commandToDisable)) {
        message.channel.send('Error: that command is already disabled');
        return;
    } else {
        guildSettings[message.guild.id].disabled.push(commandToDisable);
    }

    // Write changes to guild-settings.json
    fs.writeFile('./guild-settings.json', JSON.stringify(guildSettings, null, 2), (err) => {
        if (err) {
            console.log('Error disabling command in guildSettings.json: ' + err);
        } else {
            message.channel.send('Command disabled: ' + commandToDisable);
        }
    });
}

function toggleSpoilers(message) {
    // If the user is not an administrator, they can't toggle spoilers
    if (!message.member.permissions.has('ADMINISTRATOR')) {
        message.channel.send('Error: only server administrators can disable commands');
        return;
    }

    // Set spoilers to true if it's currently false, or false if it's currently true
    if (guildSettings[message.guild.id].spoilers) {
        guildSettings[message.guild.id].spoilers = false;
    } else {
        guildSettings[message.guild.id].spoilers = true;
    }
    let current = guildSettings[message.guild.id].spoilers ? 'true' : 'false';

    // Write changes to guild-settings.json
    fs.writeFile('./guild-settings.json', JSON.stringify(guildSettings, null, 2), (err) => {
        if (err) {
            console.log('Error toggling spoilers in guildSettings.json: ' + err);
        } else {
            message.channel.send('Spoilers set to: ' + current);
        }
    });
}

// A list of all of the available commands
let commands = [
    "help",
    "info",
    "results",
    "schedule",
    "settings",
    "standings",
    "stats"
]
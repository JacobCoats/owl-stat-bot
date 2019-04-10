const fs = require('fs');

class Settings {
    
    constructor(commandManager) {
        this.commandManager = commandManager;
    }
    // public
    description() {
        return 'allows admins to change bot settings';
    }

    execute(message, params) {
        if (!message.member.permissions.has('ADMINISTRATOR')) {
            // console.log('No permission to use that command.');
            return;
        }

        const channel = message.channel;
        const guildId = message.guild.id;
        if (params.length < 1) {
            channel.send('Error: Specify the action you wanna perform.');
            return;
        }

        // load current settings
        const guildSettings = require('../guild-settings.json');

        // modify settings according to the commands
        const command = params[0].toLowerCase();

        if (command === 'prefix') {
            const newPrefix = params[1];
            if (!newPrefix) {
                channel.send('Error: Please specify a new prefix.');
                return;
            }
            guildSettings[guildId].prefix = newPrefix;
        } else if (command === 'enable' || command === 'disable') {
            const commandName = params[1];
            if (!commandName) {
                channel.send('Error: Please specify a command to enable.');
                return;
            }
            if (!this.commandManager.commandsList().includes(commandName)) {
                channel.send(`Error: That command doesn't exist`);
                return;
            }
            const index = guildSettings[guildId].disabled.indexOf(commandName);
            if (command === 'enable') { // enable
                if (index !== -1) {
                    guildSettings[guildId].disabled.splice(index, 1);
                }
            } else { // disable
                if (index === -1) {
                    guildSettings[guildId].disabled.push(commandName);
                }
            }
        } else {
            channel.send('Error: Unknown command.');
            return;
        }

        // write settings back to the file
        fs.writeFile('./guild-settings.json', JSON.stringify(guildSettings, null, 2),
            (error) => {
                if (error) {
                    channel.send('An error occured while saving the settings to the file.');
                    console.log('Error:', error);
                } else {
                    this.commandManager.reloadSettings();
                    channel.send('Successfully changed settings.');
                }
            }
        );
    }
}

module.exports = Settings;
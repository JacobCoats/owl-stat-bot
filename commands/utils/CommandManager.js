const HelpCmd = require('../help');
const InfoCmd = require('../info');
const ResultsCmd = require('../results');
const ScheduleCmd = require('../schedule');
const SettingsCmd = require('../settings');
const StandingsCmd = require('../standings');
const StatsCmd = require('../stats');

class CommandManager {
    
    constructor() {
        this.commands = {
            'help': new HelpCmd(),
            'info': new InfoCmd(),
            'results': new ResultsCmd(),
            'schedule': new ScheduleCmd(),
            'settings': new SettingsCmd(this),
            'standings': new StandingsCmd(),
            'stats': new StatsCmd()
        };
        this.reloadSettings();
    }

    // public
    processMessage(message) {
        const guildId = message.guild.id;
        const prefix = this.guildSettings[guildId].prefix;
        
        const content = message.content;
        if (!content.startsWith(prefix)) {
            return;
        }

        const params = content.split(' ');
        const commandName = params.shift().slice(prefix.length);
        const channel = message.channel;
        if (commandName === 'commands') {
            this.shoutAvailableCommands(guildId, prefix, channel);
            return;
        }

        if (!message.member.permissions.has('ADMINISTRATOR')) {
            // skip if command is disabled and user is not an administrator
            if (this.guildSettings[guildId].disabled.includes(commandName)) {
                return;
            }
        }

        const command = this.commands[commandName];
        if (!command) {
            channel.send(`Unknown command name: ${commandName} Type ${prefix}commands for all available commands!`);
        } else {
            // remove empty params
            const filteredParams = params.filter(x => {
                return !(x.length === 0 || !x.trim());
            });
            command.execute(message, filteredParams);
        }
    }

    commandsList() {
        return Object.keys(this.commands);
    }

    reloadSettings() {
        this.guildSettings = require('../../guild-settings.json');
    }
    
    // private
    shoutAvailableCommands(guildId, prefix, channel) {
        let commandList = ['CommandList:'];
        for (const name in this.commands) {
            if (this.guildSettings[guildId].disabled.includes(name)) {
                continue; // skip disabled command
            }
            const description = this.commands[name].description();
            commandList.push(`${prefix}${name} - ${description}`); 
        }
        channel.send(commandList.join('\n'));
    }

}

module.exports = CommandManager;
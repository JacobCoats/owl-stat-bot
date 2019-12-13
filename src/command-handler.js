const guildSettings = require('../guild-settings.json');
const Help = require('./commands/help');
const Info = require('./commands/info');
const Results = require('./commands/results');
const Schedule = require('./commands/schedule');
const Settings = require('./commands/settings');
const Standings = require('./commands/standings');
const Stats = require('./commands/stats');

class CommandHandler {
    constructor() {
        this.commands = {
            "help" : new Help(),
            "info" : new Info(),
            "results" : new Results(),
            "schedule" : new Schedule(),
            "settings" : new Settings(),
            "standings" : new Standings(),
            "stats" : new Stats()
        }
    }

    processMessage(message) {
        // Ignore messages sent by the bot
        if (message.author.bot) {
            return;
        }
        
        // Ignore messages that don't start with prefix
        if (!message.content.startsWith(guildSettings[message.guild.id].prefix)) {
            return;
        }
        
        // Process command
        let params = message.content.substring(guildSettings[message.guild.id].prefix.length).trim().split(' ');
        let command = params.shift();

        if (guildSettings[message.guild.id].disabled.includes(command) && 
            !message.member.permissions.has('ADMINISTRATOR')) {
            return;
        }

        // Don't report unknown commands as this can clash with other bots if prefix is shared
        if (this.commands[command]) {
            this.commands[command].execute(params, message);
        }
    }
}

module.exports = CommandHandler
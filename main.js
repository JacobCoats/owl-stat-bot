const Discord = require('discord.js');
const client = new Discord.Client();
const config = require('./config.json');

client.on('message', (message) => {
    // Ignore messages sent by the bot
    if (message.author == client.user) {
        return;
    }
    
    // Listen for commands
    if (message.content.startsWith(config.prefix)) {
        let params = message.content.substring(config.prefix.length).trim().split(' ');
        let command = params.shift();
        
        try {
            let commandFile = require(`./commands/${command}.js`);
            commandFile.run(params, message);
        } catch (e) {
            if (command) {
                // Don't report commands that don't exist as this can clash with other bots if prefix is shared
            } else {
                message.channel.send('Error: please enter a command');
            }
            console.log('Error: ' + e);
        }
    }
});

client.login(config.token);
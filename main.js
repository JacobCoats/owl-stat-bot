const Discord = require('discord.js');
const client = new Discord.Client();
const config = require('./config.json');

client.on('message', (message) => {
    // Ignore messages sent by the bot
    if (message.author.bot) {
        return;
    }
    
    // Ignore messages that don't start with prefix
    if (!message.content.startsWith(config.prefix)) {
        return;
    }
    
    // Listen for commands
    let params = message.content.substring(config.prefix.length).trim().split(' ');
    let command = params.shift();

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
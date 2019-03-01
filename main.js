const Discord = require('discord.js');
const client = new Discord.Client();
const config = require('./config.json');

client.on('message', (message) => {
    // Ignore messages sent by the bot
    if (message.author == client.user) {
        return
    }
    
    // Listen for commands
    if (message.content.startsWith(config.prefix)) {
        let params = message.content.substring(config.prefix.length).trim().split(' ');
        let command = params.shift();
        
        try {
            let commandFile = require(`./commands/${command}.js`);
            commandFile.run(params, message, client);
        } catch (e) {
            if (command) {
                message.channel.send('Error: something went wrong. Check the console for more detail');
            } else {
                message.channel.send('Error: please enter a command');
            }
            console.log(e);
        }
    }
});

client.login(config.token);
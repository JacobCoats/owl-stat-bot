const Discord = require('discord.js');
const client = new Discord.Client();
const config = require('./config.json');

client.on('message', (message) => {
    if (message.author == client.user) {
        return
    }
    
    if (message.content.startsWith(config.prefix)) {
        let params = message.content.substring(config.prefix.length).trim().split(' ');
        let command = params.shift();
        
        try {
            let commandFile = require(`./commands/${command}.js`);
            commandFile.run();
        } catch (e) {
            if (command) {
                message.channel.send(`Error: command '${command}' not found`);
            } else {
                message.channel.send('Error: please enter a command');
            }
        }
    }
});

client.login(config.token);
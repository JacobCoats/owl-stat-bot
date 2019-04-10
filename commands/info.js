class Info {
    
    // public
    description() {
        return 'provides some basic information about the bot';
    }

    execute(message, params) {
        message.channel.send(
              'This bot was created by **Jacob Coats** using the discord.js module for Node.js.\n\n'
            + 'Type !help for information on available commands.\n\n'
            + 'You can find a link to the source code here:\n'
            + 'https://github.com/JacobCoats/owl-stat-bot/'
        );
    }

}

module.exports = Info;
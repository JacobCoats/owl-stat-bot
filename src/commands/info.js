 class Info {
    execute(params, message) {
        message.channel.send('This bot was created by **Jacob Coats** using the discord.js module for Node.js. ' +
                            '\n\nType !help for information on available commands.' +
                            '\n\nYou can find a link to the source code here: \nhttps://github.com/JacobCoats/owl-stat-bot/');
    }
}

module.exports = Info;
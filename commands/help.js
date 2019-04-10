class Help {

    // public
    description() { 
        return 'provides a link to the documentation';
    }

    execute(message, params) {
        message.channel.send(
              'You can find help in the bot\'s documentation at the following link: \n\n'
            + 'https://github.com/JacobCoats/owl-stat-bot/blob/master/README.md'
        );
    }

}

module.exports = Help;
const guildSettings = require('../guild-settings.json');
const fs = require('fs');

exports.run = (params, message) => {
    if (params[0].toLowerCase() === 'prefix') {
        changePrefix(message, params[1]);
    }
}

function changePrefix(message, newPrefix) {
    if (!message.member.permissions.has('ADMINISTRATOR')) {
        message.channel.send("Only server administrators can change the server prefix.");
        return;
    }

    guildSettings[message.guild.id].prefix = newPrefix;
    fs.writeFile('./guild-settings.json', JSON.stringify(guildSettings, null, 2), function(err) {
        if (err) {
            console.log('Error changing server prefix in guildSettings.json: ' + err);
        } else {
            message.channel.send('Server prefix changed to: ' + newPrefix);
        }
    });
}
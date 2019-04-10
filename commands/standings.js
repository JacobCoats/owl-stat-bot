const OWLApi = require('../owl-api/OverwatchLeagueApi');

exports.run = (params, message) => {
    // Send the overall season standings
    sendLeagueStandings(message);
}

function sendLeagueStandings(message) {
    OWLApi.standings().getStandings()
        .then(body => {
            let msg = '**League Standings:**\n\n';
            // Iterate through each team, print their rank and record
            for (i = 0; i < Object.keys(body['ranks']['content']).length; i++) {
                msg = msg.concat((i + 1) + ': ' + 
                                body['ranks']['content'][`${i}`]['competitor']['name'] + ' **' +
                                body['ranks']['content'][`${i}`]['records']['0']['matchWin'] + 
                                '-' + body['ranks']['content'][`${i}`]['records']['0']['matchLoss'] + 
                                '**\n');
            }

            message.channel.send(msg);
        }) // success
        .catch(error => {
            message.channel.send('Error: something went wrong while retrieving the schedule.');
            console.log('Error:', error);
        } // error
    );
}
exports.run = (params, message) => {
    sendGeneralStats(params[0], message);
}

function sendGeneralStats(playerName, message) {
    const request = require('request');
    
    request.get({
        url: 'https://api.overwatchleague.com/stats/players', 
        json: true 
    }, function(err, res, body) {
        if (err) {
            message.channel.send('Error: something went wrong while retrieving the schedule.')
            console.log('error: ' + err);
            console.log('response: ' + res.statusCode);           
        }
        
        let playerIndex = findPlayerIndex(body, playerName);
        // If index < 0, the specified player doesn't exist in the database
        if (playerIndex < 0) {
            message.channel.send('Error: player not found');
            return;
        }
        
        // Convert the playtime in seconds that the API provides to hours, minutes, seconds
        let timePlayed = convertSeconds(body['data'][`${playerIndex}`]['time_played_total']);
        let msg;
        
        // Format output differently depending if player's role is dps, tank, or support
        if (body['data'][`${playerIndex}`]['role'] === 'offense' || body['data'][`${playerIndex}`]['role'] === 'tank') {
            msg = 'Player: **' + body['data'][`${playerIndex}`]['name'] + '**' +
                '\n\nEliminations/10 min: **' + (Math.round(body['data'][`${playerIndex}`]['eliminations_avg_per_10m'] * 100) / 100) + '**' +
                '\nHero damage/10 min: **' + (Math.round(body['data'][`${playerIndex}`]['hero_damage_avg_per_10m'] * 100) / 100) + '**' +
                '\nFinal blows/10 min: **' + (Math.round(body['data'][`${playerIndex}`]['final_blows_avg_per_10m'] * 100) / 100) + '**' +
                '\nDeaths/10 min: **' + (Math.round(body['data'][`${playerIndex}`]['deaths_avg_per_10m'] * 100) / 100) + '**' +
                '\nUltimates earned/10 min: **' + (Math.round(body['data'][`${playerIndex}`]['ultimates_earned_avg_per_10m'] * 100) / 100) + '**' +
                '\nTotal playtime: **' + timePlayed + '**';
        } else {
            msg = 'Player: **' + body['data'][`${playerIndex}`]['name'] + '**' +
                '\n\nHealing/10 min: **' + (Math.round(body['data'][`${playerIndex}`]['healing_avg_per_10m'] * 100) / 100) + '**' +
                '\nHero damage/10 min: **' + (Math.round(body['data'][`${playerIndex}`]['hero_damage_avg_per_10m'] * 100) / 100) + '**' +
                '\nEliminations/10 min: **' + (Math.round(body['data'][`${playerIndex}`]['eliminations_avg_per_10m'] * 100) / 100) + '**' +
                '\nFinal blows/10 min: **' + (Math.round(body['data'][`${playerIndex}`]['final_blows_avg_per_10m'] * 100) / 100) + '**' +
                '\nDeaths/10 min: **' + (Math.round(body['data'][`${playerIndex}`]['deaths_avg_per_10m'] * 100) / 100) + '**' +
                '\nUltimates earned/10 min: **' + (Math.round(body['data'][`${playerIndex}`]['ultimates_earned_avg_per_10m'] * 100) / 100) + '**' +
                '\nTotal playtime: **' + timePlayed + '**';
        }
        
        message.channel.send(msg);
    });
}

function findPlayerIndex(body, playerName) {
    // Since players are sorted alphabetically by name but name can't be used to access them, we use binary search to find the appropriate index
    let left = 0;
    let right = Object.keys(body['data']).length - 1;
    
    while (left <= right) {
        let middle = Math.floor(left + (right - left) / 2);

        if (body['data'][`${middle}`]['name'].toLowerCase() === playerName) {
            return middle;
        }
        if (body['data'][`${middle}`]['name'].toLowerCase() < playerName) {
            left = middle + 1;
        } else {
            right = middle - 1;
        }
    }
    
    return -1;
}

function convertSeconds(seconds) {
    // Convert seconds to hours, minutes, seconds
    let time = '';
    if (seconds > 3600) {
        time += Math.floor(seconds / 3600) + ' hours, ';
        seconds %= 3600;
    }
    time += Math.floor(seconds / 60) + ' minutes, ';
    seconds %= 60;
    time += Math.floor(seconds) + ' seconds';
    return time;
}

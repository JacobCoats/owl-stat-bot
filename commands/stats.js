const teams = require('../teams.json');
const request = require('request');
const async = require('async');
    
exports.run = (params, message) => {
    // Parse parameters
    if (params.length > 0) {
        let playerName = params[0].toLowerCase();
        
        if (params.length === 1) {
            sendGeneralStats(playerName, message);
        } else {
            // Check validity of each parameter
            if (!isNaN(params[1])) {
                if (!isNaN(params[2])) {
                    if (teams[`${params[3].toLowerCase()}`] !== undefined) {
                        sendMatchStats(playerName, params[1], params[2], params[3], message);
                    } else {
                        message.channel.send('Error: the opponent you specified doesn\'t exist');
                    }
                } else {
                    message.channel.send('Error: invalid week parameter');
                }
            } else {
                message.channel.send('Error: invalid stage parameter');
            }
        }
    } else {
        message.channel.send('Error: player name not provided');
    }
}

function sendGeneralStats(playerName, message) {
    request.get({
        url: 'https://api.overwatchleague.com/stats/players', 
        json: true 
    }, function(err, res, body) {
        if (err) {
            message.channel.send('Error: something went wrong while retrieving the player\'s stats.')
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

function sendMatchStats(playerName, stage, week, opponent, message) {
    // Measure execution time
    let start = new Date();
    
    let playerId;
    let playerTeam;
    let name;
    let competitorOne;
    let competitorTwo;
    let matchId = -1;
    let stats = [0, 0, 0, 0, 0];
    let handled = false;
    
    // Use promises because each api call depends on the results of the previous
    // Use /stats/players instead of /players because the latter isn't sorted alphabetically by name so binary search doesn't work
    getRequest('https://api.overwatchleague.com/stats/players').then(function (playerBody) {
        // Get the player's id and their team's id
        let playerIndex = findPlayerIndex(playerBody, playerName);
        if (playerIndex >= 0) {
            playerId = playerBody['data'][`${playerIndex}`]['playerId'];
            playerTeam = playerBody['data'][`${playerIndex}`]['teamId'];
            name = playerBody['data'][`${playerIndex}`]['name'];
        } else {
            // Send an error message and mark the error as handled
            playerId = -1;
            message.channel.send('Error: that player doesn\'t exist');
            handled = true;
            return;
        }
        
        return getRequest('https://api.overwatchleague.com/schedule')
    }).then(function (scheduleBody) {
        // Get the id for the match that the user specified
        let specifiedWeek = scheduleBody['data']['stages'][`${stage - 1}`]['weeks'][`${week - 1}`]['matches'];
        for (var m in specifiedWeek) {
            if (specifiedWeek[`${m}`]['competitors']['0']['id'] === playerTeam || 
                specifiedWeek[`${m}`]['competitors']['1']['id'] === playerTeam) {
                if (specifiedWeek[`${m}`]['competitors']['0']['id'] === teams[`${opponent}`] || 
                    specifiedWeek[`${m}`]['competitors']['1']['id'] === teams[`${opponent}`]) {
                    matchId = specifiedWeek[`${m}`]['id'];
                    competitorOne = specifiedWeek[`${m}`]['competitors']['0']['name'];
                    competitorTwo = specifiedWeek[`${m}`]['competitors']['1']['name'];
                    break;
                }
            }
        }
        // If the match wasn't found, send an error message and mark the error as handled
        if (matchId === -1) {
            message.channel.send('Error: the specified match wasn\'t found');
            handled = true;
            return;
        }
    }).then(function() {
        let urls = ['https://api.overwatchleague.com/stats/matches/' + matchId + '/maps/1',
            'https://api.overwatchleague.com/stats/matches/' + matchId + '/maps/2',
            'https://api.overwatchleague.com/stats/matches/' + matchId + '/maps/3',
            'https://api.overwatchleague.com/stats/matches/' + matchId + '/maps/4',
            'https://api.overwatchleague.com/stats/matches/' + matchId + '/maps/5'];
    
        async.map(urls, function(url, callback) {
            request.get({
                url: url, 
                json: true 
            }, function ha(err, res, body) {
                if (err) {
                    return callback(err, []);
                }

                let tempStats = [0, 0, 0, 0, 0];
                if (body['teams'] === undefined) {
                    return callback(null, tempStats);
                }
                for (var t in body['teams']) {
                    for (var p in body['teams'][`${t}`]['players']) {
                        if (body['teams'][`${t}`]['players'][`${p}`]['esports_player_id'] === playerId) {
                            tempStats[0] += 
                                (Math.round(body['teams'][`${t}`]['players'][`${p}`]['stats']['0']['value'] * 100) / 100);
                            tempStats[1] += body['teams'][`${t}`]['players'][`${p}`]['stats']['1']['value'];
                            tempStats[2] += body['teams'][`${t}`]['players'][`${p}`]['stats']['2']['value'];
                            if (body['teams'][`${t}`]['players'][`${p}`]['stats']['3'] !== undefined) {
                                tempStats[3] += 
                                    (Math.round(body['teams'][`${t}`]['players'][`${p}`]['stats']['3']['value'] * 100) / 100);
                            }
                            tempStats[4] += body['stats']['0']['value'];

                            return callback(null, tempStats);
                        }
                    }
                }
                callback(null, tempStats);
            });
        }, function(err, results) {
            if (err) {
                message.channel.send('Error: something went wrong while retrieving the map stats.')
                console.log(err);      
            }
            
            for (var s in results) {
                stats[0] += results[s][0];
                stats[1] += results[s][1];
                stats[2] += results[s][2];
                stats[3] += results[s][3];
                stats[4] += results[s][4];
            }

            // Construct and send the stats message
            // Map time is given in milliseconds, so divide by 1000 before passing it to conversion
            let timePlayed = convertSeconds(stats[4] / 1000);
            let msg = 'Player: **' + name +
                '\n' + competitorOne + '** vs. **' + competitorTwo + '**' +
                '\nStage ' + stage + ', Week ' + week +
                '\n\nDamage: **' + (Math.round(stats[0] * 100) / 100) + '**' +
                '\nDeaths: **' + stats[1] + '**' +
                '\nEliminations: **' + stats[2] + '**';
            if (stats[3] > 0) { 
                msg += '\nHealing: **' + (Math.round(stats[3] * 100) / 100) + '**';
            }
            msg += '\nTime played: **' + timePlayed + '**';
            
            message.channel.send(msg);
            let end = new Date() - start;
            console.info('Execution time: %dms', end);
        });
    }).catch(function (err) {
        // Only send an error message if it wasn't already handled
        if (!handled) {
            message.channel.send('Error: something went wrong while retrieving the player\'s stats')
            console.log(err);  
        }
    });
}
    
function getRequest(url) {
    // Make an http get request returning a promise
    return new Promise(function (success, failure) {
        request({
            url: url, 
            json: true
        }, function (err, res, body) {
            if (err) {
                failure(err);
            } else {
                success(body);
            }
        });
    });
}

function findPlayerIndex(body, playerName) {
    // Since players are sorted alphabetically by name but name can't be used to access them, I use binary search to find the appropriate index
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
    if (seconds >= 3600) {
        if (seconds >= 7200) {
            time += Math.floor(seconds / 3600) + ' hours, ';
        } else {
            time += Math.floor(seconds / 3600) + ' hour, ';
        }
        seconds %= 3600;
    }
    if (seconds >= 120) {
        time += Math.floor(seconds / 60) + ' minutes, ';
    } else {
        time += Math.floor(seconds / 60) + ' minute, ';
    }
    seconds %= 60;
    if (seconds >= 2) {
        time += Math.floor(seconds) + ' seconds';
    } else {
        time += Math.floor(seconds) + ' second';
    }
    return time;
}
const OWLApi = require('../owl-api/OverwatchLeagueApi');
const teams = require('../teams.json');

class Stats {
    
    // public
    description() {
        return 'returns the stats of a player';
    }

    execute(message, params) {
        const channel = message.channel;
        if (params.length <= 0) {
            channel.send('Error: player name not provided.');
            return;
        } 

        const playerName = params[0].toLowerCase();
        let stageNo = -1;
        let weekNo = -1;
        let opponentId = -1;

        if (params.length !== 1 && params.length !== 4) {
            channel.send(`Error: invalid amount of parameters`);
            return;
        }

        if (params.length === 4) {
            stageNo = params[1] - 1;
            weekNo = params[2] - 1;
            opponentId = teams[params[3].toLowerCase()];
            if (opponentId === undefined) {
                channel.send(`Error: the opponent you specified does't exist`);
                return;
            }
        }

        let playerData = undefined;
        let matchData = undefined;
        const playerDataPromise = OWLApi.stats().getPlayersStats()
            .then(data => { // player stats
                playerData = this.extractPlayerData(playerName, data.data);
                if (!playerData) {
                    channel.send(`Error: player (${playerName}) not found`);
                } else {
                    if (params.length === 1) {
                        channel.send(this.buildPlayerStatsResponse(playerData));
                    } else {
                        return OWLApi.schedule().getSchedule();
                    }
                }
        });
        if (params.length === 4) {
            playerDataPromise.then(schedule => { // schedule data
                const matches = schedule.data.stages[stageNo].weeks[weekNo].matches;
                for (const match of matches) {
                    if (match.competitors[0].id === playerData.teamId ||
                        match.competitors[1].id === playerData.teamId) {
                        if (match.competitors[0].id === opponentId ||
                            match.competitors[1].id === opponentId) {
                            matchData = match;
                            break;
                        }
                    }
                }
                if (matchData) {
                    matchData = {...matchData, ...{
                        stageNo: stageNo,
                        weekNo: weekNo
                    }};
                    return OWLApi.stats().getMatchStats(matchData.id);
                }
                channel.send(`Error: the specified match doesn't exist in the database.`);
            })
            .then(matchStats => { // matchstats data
                const playerStats = this.extractPlayerStats(playerData.playerId, matchStats);
                channel.send(this.buildPlayerStatsMatch(playerData, playerStats, matchData));
            })
            .catch(error => {
                channel.send(`Error: something went wrong while retrieving the stats.`);
                console.log('Error:', error);
            });
        } // if
    }

    // private
    buildPlayerStatsResponse(playerData) {
        let response = [`Player: **${playerData.name}**\n`];
        // you can readd the different outputs for different roles
        response.push(`Eliminations/10min: **${this.roundToTwoDecimals(playerData.eliminations_avg_per_10m)}**`);
        response.push(`Hero damage/10min: **${this.roundToTwoDecimals(playerData.hero_damage_avg_per_10m)}**`);
        response.push(`Final blows/10min: **${this.roundToTwoDecimals(playerData.final_blows_avg_per_10m)}**`);
        response.push(`Deaths/10min: **${this.roundToTwoDecimals(playerData.deaths_avg_per_10m)}**`);
        response.push(`Ultimates earned/10min: **${this.roundToTwoDecimals(playerData.ultimates_earned_avg_per_10m)}**`);
        const timePlayed = this.convertSeconds(playerData.time_played_total);
        response.push(`Total playtime: **${timePlayed}**`);
        return response.join('\n');
    }

    buildPlayerStatsMatch(playerData, playerStats, matchData) {
        let response = [`Player: **${playerData.name}**`];
        response.push(`**${matchData.competitors[0].name} ** vs.** ${matchData.competitors[1].name}**`)
        response.push(`Stage ${matchData.stageNo+1}, Week ${matchData.weekNo+1}\n`);
        response.push(`Damage: **${this.roundToTwoDecimals(playerStats.damage)}**`);
        response.push(`Deaths: **${playerStats.deaths}**`);
        response.push(`Eliminations: **${this.roundToTwoDecimals(playerStats.eliminations)}**`);
        if (playerStats.healing > 0) {
            response.push(`Healing: **${this.roundToTwoDecimals(playerStats.healing)}**`);
        }
        response.push(`Time played: **${this.convertSeconds(playerStats.timePlayed / 1000)}**`);
        return response.join('\n');
    }

    extractPlayerData(playerName, data) {
        // find player index
        // Since players are sorted alphabetically by name but name can't be used to access them, I use binary search to find the appropriate index
        let playerIndex = -1;
        let left = 0, right = data.length - 1;
        while (left <= right) {
            const middle = Math.floor(left + (right - left) / 2);
            const currentPlayerName = data[middle].name.toLowerCase();
            if (currentPlayerName === playerName) {
                playerIndex = middle;
                break;
            }
            if (currentPlayerName < playerName) {
                left = middle + 1;
            } else {
                right = middle - 1;
            }
        }
        
        if (playerIndex === -1) {
            return undefined;
        }
        return data[playerIndex];
    }

    extractPlayerStats(playerId, matchStats) {
        let playerStats = {
            damage: 0,
            deaths: 0,
            eliminations: 0,
            healing: 0,
            timePlayed: 0
        };
        for (const stats of matchStats) {
            // skip non played maps
            if (!stats.game_id) continue;
            for (const team of stats.teams) {
                for (const player of team.players) {
                    if (player.esports_player_id === playerId) {
                        playerStats.damage += player.stats[0].value;
                        playerStats.deaths += player.stats[1].value;
                        playerStats.eliminations += player.stats[2].value;
                        playerStats.healing += player.stats[3].value;
                        playerStats.timePlayed += stats.stats[0].value;
                        break;
                    }
                }
            }
        }
        return playerStats;
    }

    convertSeconds(seconds) {
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

    roundToTwoDecimals(value) {
        return Math.round(value * 100) / 100;
    }

}

module.exports = Stats;
const OWLApi = require('../owl-api/OverwatchLeagueApi');

class Standings {
    
    // public
    description() {
        return 'return the current league standings';
    }

    execute(message, params) {
        const channel = message.channel;
        OWLApi.standings().getStandings()
            .then(data => {
                channel.send(this.buildResponse(data))
            }) // success
            .catch(error => {
                channel.send('Error: something went wrong while retrieving the schedule.');
                console.log('Error:', error);
            } // error
        ); // getStandings
    }

    // private
    buildResponse(data) {
        let response = ['**League Standings:**\n'];
        // iterate through each team, print their placment and record
        for (const standingNo in data.ranks.content) {
            const standing = data.ranks.content[standingNo];
            const record = standing.records[0];
            response.push(`${standing.placement}: ${standing.competitor.name} ` + 
                          `** ${record.matchWin}-${record.matchLoss}**`);
        }
        return response.join('\n');
    }
}

module.exports = Standings;
const AbstractBaseApi = require('./AbstractBaseApi');

class StatsApi extends AbstractBaseApi {
    
    getPlayersStats() {
        return this.get('/stats/players');
    }

    getMatchStats(matchId) {
        // request match stats data in parallel and merge them into a promise
        const mapCount = 5;
        const promises = Array.apply(null, {length: mapCount}).map(
            (x, n) => this.get(`/stats/matches/${matchId}/maps/${n + 1}`)
        );
        return Promise.all(promises.map(p => p.catch(e => e)));
    }
    
}

module.exports = StatsApi;
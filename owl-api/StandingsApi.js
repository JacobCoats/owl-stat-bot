const AbstractBaseApi = require('./AbstractBaseApi');

class StandingsApi extends AbstractBaseApi {
    
    getStandings() {
        return this.get('/standings');
    }

}

module.exports = StandingsApi;
const ScheduleApi = require('./ScheduleApi');
const StandingsApi = require('./StandingsApi');
const StatsApi = require('./StatsApi');

class OverwatchLeagueApi {

    constructor() {
        const defaultCacheOptions = {
            cache: true,
            time: 60 * 60 * 1000 // 1 hour (in milliseconds)
        };
        // initialize endpoints with cache settings
        this.scheduleApi = new ScheduleApi(defaultCacheOptions);
        this.standingsApi = new StandingsApi(defaultCacheOptions);
        this.statsApi = new StatsApi(defaultCacheOptions);
    }

    schedule() { return this.scheduleApi; }
    standings() { return this.standingsApi; }
    stats() { return this.statsApi; }

}

module.exports = new OverwatchLeagueApi();
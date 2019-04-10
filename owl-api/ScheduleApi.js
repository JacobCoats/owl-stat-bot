const AbstractBaseApi = require('./AbstractBaseApi');

class ScheduleApi extends AbstractBaseApi {
    
    getSchedule() {
        return this.get('/schedule');
    }
    
}

module.exports = ScheduleApi;
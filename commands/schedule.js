const ScheduleStageWeekCmd = require('./utils/ScheduleStageWeekCmd');

class Schedule extends ScheduleStageWeekCmd {
    
    constructor() {
        super();
        this.dateOptions = { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' };
    }

    // public
    description() {
        return 'returns schedule for current week';
    }

    // private
    buildResponse(stage, data) {
        // schedule is from last week, lets jump forward one week
        if (stage.lastWeek) {
            stage = this.offsetStageByWeek(stage, 1);
        }

        let response = ['**Schedule for Stage ' + (stage.stageNo + 1) + ', Week ' + (stage.weekNo + 1) + '**'];
        const matches = data.stages[stage.stageNo].weeks[stage.weekNo].matches;
        let currentDay = -1;
        for (let match of matches) {
            const team1 = {...match.competitors[0], ...{score: match.wins[0]}};
            const team2 = {...match.competitors[1], ...{score: match.wins[1]}};
    
            // If a team id was provided and the specified team wasn't a competitor in the current match, skip it
            if (stage.teamId !== -1 && (team1.id !== stage.teamId && team2.id !== stage.teamId)) {
                continue;
            }
            
            // Every time the day of the week that the current match occurs on differs from the one before it, print the new one
            let matchDate = new Date(match.startDate);
            let matchDay = matchDate.getDay();
            if (currentDay != matchDay) {
                currentDay = matchDay;
                response.push(`\n__${matchDate.toLocaleDateString('en-EN', this.dateOptions)}:__`);
            }
            
            response.push(`${team1.name} vs. ${team2.name}`);
        }
    
        if (response.length === 1) {
            response.push(`\n\nThat team doesn\'t play during that week.`);
        }
        return response.join('\n');
    }
}

module.exports = Schedule;
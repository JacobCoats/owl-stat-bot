const OWLApi = require('../../owl-api/OverwatchLeagueApi');
const teams = require('../../teams.json');

class ScheduleStageWeekCmd {

    constructor() {
        this.noOfStages = 3; // starting with zero as 1
        this.noOfWeeks = 4; // starting with zero as 1 
    }

    // public
    description() { 
        return 'override me please';
    }

    execute(message, params) {
        const channel = message.channel;
        let stage = this.parseParams(params);

        // verify team param (if there is one)
        if (stage.teamId === undefined) {
            channel.send('Error: unknown team.');
            return;
        }

        // params seem to be fine, lets crunch some numbers
        OWLApi.schedule().getSchedule()
            .then(body => {
                const stages = body.data.stages;
                // if not a specific week was requested
                // transform (current, prev, next into stage/week data)
                if (stage.stageNo === -1 && stage.weekNo === -1) {
                    let requestedStage = this.determineCurrentStageWeek(stages);
                    if (stage.week === 'previous') {
                        requestedStage = this.offsetStageByWeek(requestedStage, -1);
                    } else if (stage.week === 'next') {
                        requestedStage = this.offsetStageByWeek(requestedStage, 1);
                    }
                    // write new values into stage data
                    stage = {...stage, ...requestedStage};
                }
                
                // make sure that the requested stage and week exist (compare with api data)
                if (stage.stageNo < 0 || stage.stageNo >= stages.length) {
                    message.channel.send('Error: that stage does not exist');
                    return;
                }
                if (stage.weekNo < 0 || stage.weekNo >= stages[stage.stageNo].weeks.length) {
                    message.channel.send('Error: that week does not exist');
                    return;
                }
                // respond with the results
                message.channel.send(this.buildResponse(stage, body.data));
            }) // success
            .catch(error => {
                message.channel.send('Error: something went wrong while retrieving the schedule.');
                console.log('Error:', error);
            } // error
        ); // getSchedule
    }

    // private
    parseParams(params) {
        let stage = {
            week: 'current', // default case (params.length === 0)
            stageNo: -1,
            weekNo: -1,
            teamId: -1,
            lastWeek: false
        };
        
        if (params.length > 0) {
            const lastParam = params.pop(); // removes last param from list
            if (lastParam === 'previous' || lastParam === 'next') {
                stage.week = lastParam;
            } else if (isNaN(lastParam)) {
                // is part of the teamname, push it back to the array
                params.push(lastParam);
            } else {
                // lastParam was a number (weekNo) retreive stageNo
                const weekNo = lastParam;
                const stageNo = params.pop();
                if (!isNaN(stageNo) && !isNaN(weekNo)) {
                    // convert input to 0 index value
                    stage.stageNo = stageNo - 1;
                    stage.weekNo = weekNo - 1;
                }
            }
            // params contains the teamname, retrieve it
            if (params.length > 0) {
                const teamRequest = params.join(' ').toLowerCase();
                stage.teamId = teams[teamRequest];
            }
        }
        return stage;
    }

    determineCurrentStageWeek(stages) {
        const currentDate = new Date().getTime();
        let currentStageNo = -1, currentWeekNo = -1;
        
        // Iterate through each stage and figure out which one is current
        for (let stageNo = 0; stageNo < stages.length; ++stageNo) {
            const weeks = stages[stageNo].weeks;
            for (let weekNo = 0; weekNo < weeks.length; ++weekNo) {
                const week = weeks[weekNo];
                if (currentDate > week.startDate && currentDate < week.endDate) {
                    currentStageNo = stageNo;
                    currentWeekNo = weekNo;
                    break;
                }
                
                // If the current week is between stages, set the last week played to current
                if (weekNo === this.noOfWeeks) {
                    if (currentDate > stages[stageNo].weeks[weekNo].endDate &&
                        currentDate < stages[stageNo + 1].weeks[0].endDate) {
                        currentStageNo = stageNo;
                        currentWeekNo = weekNo;
                    }
                }
            }
        }
    
        let currentStage = {
            stageNo: currentStageNo,
            weekNo: currentWeekNo,
            lastWeek: false
        };
    
        // If no matches have taken place in the current week, send the previous week's results
        const wins = stages[currentStageNo].weeks[currentWeekNo].matches[0].wins;
        if (wins[0] === 0 && wins[1] === 0) {
            currentStage =  this.offsetStageByWeek(currentStage, -1);
            currentStage.lastWeek = true;
        }
    
        return currentStage;
    }
    
    offsetStageByWeek(stage, offsetWeek) {
        stage.weekNo += offsetWeek;
        if (stage.weekNo < 0) {
            // stage.weekNo is a negative number, hence +
            stage.weekNo = this.noOfWeeks + stage.weekNo; 
            stage.stageNo -= 1;
        } else if (stage.weekNo > this.noOfWeeks) {
            stage.weekNo = stage.weekNo - this.noOfWeeks;
            stage.stageNo += 1;
        }
        return stage;
    }

    buildResponse(stage, data) { /* implement me in specialization */ }
}

module.exports = ScheduleStageWeekCmd;
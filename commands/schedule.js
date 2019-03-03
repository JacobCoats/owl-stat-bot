const teams = require('../teams.json');

exports.run = (params, message) => {   
    let teamRequest = '';

    // Check to see if the message specifies a team
    for (i = 0; i < params.length; i++) {
        if (!isNaN(params[i]) || params[i] === 'next' || params[i] === 'previous') {
            break;
        } else if (i == 0) {
            teamRequest += params[i];
        } else {
            teamRequest += ' ' + params[i];
        }
    }

    // If there wasn't a team request OR the team name that was provided exists
    if (!teamRequest || teams[teamRequest]) {
        if (i === params.length) {
            // If there are no other parameters, send current week's schedule
            sendCurrentWeek(message, 0, teams[teamRequest]);
        } else if (!isNaN(params[i])) {
            // If this parameter is a number, make sure that the next one is also a number, then return the schedule for that stage and week
            if (i + 1 <= params.length) {
                if (!isNaN(params[i + 1])) {
                    let stage = params[i] - 1;
                    let week = params[i + 1] - 1;
                    sendSpecifiedWeek(stage, week, message, teams[teamRequest]);
                } else {
                    message.channel.send('Error: improper weeks parameter');
                }
            } else {
                message.channel.send('Error: please provide a weeks parameter');
            }
        } else if (params[i] === 'next') {
            // Pass 1 as offset if we're looking for next week's schedule since offset will be added to whichever week the method finds to be current
            sendCurrentWeek(message, 1, teams[teamRequest]);
        } else if (params[i] === 'previous') {
            // Pass -1 as offset if we're looking for previous week's schedule
            sendCurrentWeek(message, -1, teams[teamRequest]);
        }
    } else {
        message.channel.send('Error: that team doesn\'t exist');
    }
}

function sendSpecifiedWeek(stage, week, message, teamId) {
    const request = require('request');
    
    request.get({
        url: 'https://api.overwatchleague.com/schedule', 
        json: true 
    }, function(err, res, body) {
        if (err) {
            message.channel.send('Error: something went wrong while retrieving the schedule.')
            console.log('error: ' + err);
            console.log('response: ' + res.statusCode);           
        }
        
        // Make sure that the requested stage and week exist
        if (stage > body['data']['stages'].length || stage < 0) {
            message.channel.send("Error: that stage doesn't exist");
            return;
        }
        if (week > body['data']['stages'][`${stage}`]['weeks'].length || week < 0) {
            message.channel.send("Error: that week doesn't exist");
            return;
        }

        let msg = constructMessage(stage, week, body, teamId);
        message.channel.send(msg);
    });
}

// Offset will be added to the current week in order to return next or previous week's schedule
function sendCurrentWeek(message, offset, teamId) {
    const request = require('request');
    let stage;
    let week;
    let currentDate = new Date().getTime();
    
    request.get({
        url: 'https://api.overwatchleague.com/schedule',
        json: true
    }, function (err, res, body) {
        if (err) {
            message.channel.send('Error: something went wrong while retrieving the schedule.')
            console.log('error: ' + err);
            console.log('response: ' + res.statusCode);           
        }
        
        // Iterate through each stage and figure out which one is current
        for(i = 0; i < Object.keys(body['data']['stages']).length; i++) {
            for (j = 0; j < Object.keys(body['data']['stages'][`${i}`]['weeks']).length; j++) {
                if (currentDate > body['data']['stages'][`${i}`]['weeks'][`${j}`]['startDate'] &&
                    currentDate < body['data']['stages'][`${i}`]['weeks'][`${j}`]['endDate']) {
                    stage = i;
                    week = j;
                    break;
                }
            }
        }
        
        // Add/subtract the offset if we're looking for next or previous week
        week += offset;
        
        if (week === undefined || stage === undefined) {
            message.channel.send(
                'There are no games during this week. If you want the schedule for a specific week, ' +
                'please include a stage and week number.');
            return;
        }
        
        let msg = constructMessage(stage, week, body, teamId);
        message.channel.send(msg);
    });
}

function constructMessage(stage, week, body, teamId) {
    let msg = '**Stage ' + (stage + 1) + ', Week ' + (week + 1) + '**';

    let currentDay = -1;
    for (var m in body['data']['stages'][`${stage}`]['weeks'][`${week}`]['matches']) {
        // maybe can remove != null
        if (teamId) {
            if (body['data']['stages'][`${stage}`]['weeks'][`${week}`]['matches'][`${m}`]['competitors']['0']['id'] !== teamId &&
                body['data']['stages'][`${stage}`]['weeks'][`${week}`]['matches'][`${m}`]['competitors']['1']['id'] !== teamId) {
                continue;
            }
        }
        
        // Every time the day of the week that the current match occurs on differs from the one before it, print the new one
        let matchDate = new Date(body['data']['stages'][`${stage}`]['weeks'][`${week}`]['matches'][`${m}`]['startDate']);
        let matchDay = matchDate.getDay();
        if (currentDay != matchDay) {
            currentDay = matchDay;
            msg = msg.concat('\n\n__' + days[currentDay] + ', ' + months[matchDate.getMonth()] + ' ' + matchDate.getDate() + ':__');
        }

        let matchData = '\n' + 
            body['data']['stages'][`${stage}`]['weeks'][`${week}`]['matches'][`${m}`]['competitors']['0']['name'] +
            ' vs. ' + 
            body['data']['stages'][`${stage}`]['weeks'][`${week}`]['matches'][`${m}`]['competitors']['1']['name'];

        msg = msg.concat(matchData);
    }
    if (msg === '**Stage ' + (stage + 1) + ', Week ' + (week + 1) + '**') {
        msg = msg.concat('\n\nThat team doesn\'t play during that week.');
    }
    
    return msg;
}

let days = {
    0: 'Sunday',
    1: 'Monday',
    2: 'Tuesday',
    3: 'Wednesday',
    4: 'Thursday',
    5: 'Friday',
    6: 'Saturday'
}

let months = {
    0: 'January',
    1: 'February',
    2: 'March',
    3: 'April',
    4: 'May',
    5: 'June',
    6: 'July',
    7: 'August',
    8: 'September',
    9: 'October',
    10: 'November',
    11: 'December'
}
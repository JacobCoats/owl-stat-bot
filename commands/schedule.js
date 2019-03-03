exports.run = (params, message) => {
    // Decide which method to call based on the parameters provided
    if (params !== undefined && params.length > 0) {
        // Check if user is requesting schedule for a specific week
        if (!isNaN(params[0])) {
            // Make sure there's a week parameter
            if (params.length > 1) {
                if (!isNaN(params[1])) {
                    let stage = params[0] - 1;
                    let week = params[1] - 1;
                    // Perform an http request and send the appropriate data
                    sendSpecifiedWeek(stage, week, message);
                } else {
                    message.channel.send('Error: improper week parameter');
                }
            } else {
                message.channel.send('Error: please provide a week');
            }
        } else if (params[0] === 'next') {
            // Send next week's schedule
            sendCurrentWeek(message, 1);
        } else if (params[0] === 'previous') {
            // Send previous week's schedule
            sendCurrentWeek(message, -1);
        } else {
            message.channel.send('Error: improper parameters provided');
        }
    }
    else {
        // If no parameters were included, send current week's schedule
        sendCurrentWeek(message, 0);
    }
}

function sendSpecifiedWeek(stage, week, message) {
    const request = require('request');
    
    request.get({
        url: 'https://api.overwatchleague.com/schedule', 
        json: true 
    }, function(err, res, body) {
        if (err) {
            message.channel.send('Error: something went wrong while retrieving the schedule.')
            console.log('error: ' + error);
            console.log('response: ' + response.statusCode);           
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

        let msg = constructMessage(stage, week, body);
        message.channel.send(msg);
    });
}

// Offset will be added to the current week in order to return next or previous week's schedule
function sendCurrentWeek(message, offset) {
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
            console.log('error: ' + error);
            console.log('response: ' + response.statusCode);           
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
        
        week += offset;
        
        if (week === undefined || stage === undefined) {
            message.channel.send(
                'There are no games during this week. If you want the schedule for a specific week, ' +
                'please include a stage and week number.');
            return;
        }
        
        let msg = constructMessage(stage, week, body);
        message.channel.send(msg);
    });
}

function constructMessage(stage, week, body) {
    let msg = '**Stage ' + (stage + 1) + ', Week ' + (week + 1) + '**';

    let currentDay = -1;
    for (var m in body['data']['stages'][`${stage}`]['weeks'][`${week}`]['matches']) {
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
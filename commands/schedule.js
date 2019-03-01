exports.run = (params, message, client) => {
    if (params !== undefined && params.length > 0) {
        // Check if user is requesting schedule for a specific week
        if (!params[0].isNaN) {
            // Make sure there's a week parameter
            if (params.length > 1) {
                if (!params[1].isNaN) {
                    let stage = params[0] - 1;
                    let week = params[1] - 1;
                    // Perform an http request and send the appropriate data
                    sendSpecifiedWeek(stage, week, message);
                } else {
                    message.channel.send('Error: please provide a week');
                }
            } else {
                message.channel.send('Error: please provide a week');
            }
        }
    }
    else {
        message.channel.send('Error: no parameters provided');
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

        let msg = 'Stage ' + (stage + 1) + ', Week ' + (week + 1);
        
        let currentDay = -1;
        for (var m in body['data']['stages'][`${stage}`]['weeks'][`${week}`]['matches']) {
            // Every time the day of the week that the current match occurs on differs from the one before it, print the new one
            let matchDate = new Date(body['data']['stages'][`${stage}`]['weeks'][`${week}`]['matches'][`${m}`]['startDate']);
            let matchDay = matchDate.getDay();
            if (currentDay != matchDay) {
                currentDay = matchDay;
                console.log(days[currentDay]);
                msg = msg.concat('\n\n' + days[currentDay] + ':');
            }
            
            let matchData = '\n' + 
                body['data']['stages'][`${stage}`]['weeks'][`${week}`]['matches'][`${m}`]['competitors']['0']['name'] +
                ' vs. ' + 
                body['data']['stages'][`${stage}`]['weeks'][`${week}`]['matches'][`${m}`]['competitors']['1']['name'];
            
            msg = msg.concat(matchData);
        }
        message.channel.send(msg);
    });
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
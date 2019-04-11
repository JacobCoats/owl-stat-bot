# owl-stat-bot  
A Discord bot that provides Overwatch League stats and information  
  
# Commands:
### Schedule:

Command | Result 
--------- | :-------
!schedule | returns schedule for current week
!schedule {s} {w} | returns schedule for a specific week where {s} is stage number and {w} is week number 
!schedule next | returns schedule for next week
!schedule previous | returns schedule for previous week
!schedule {teamname} | returns a specific team's schedule for the current week
!schedule {teamname} {s} {w} | returns a specific team's schedule for a specific week where {s} is stage number and {w} is week number
!schedule {teamname} next | returns a specific team's schedule for next week
!schedule {teamname} previous | returns a specific team's schedule for previous week


### Results:

Command | Result
--------- | :-------
!results | returns results for current week
!results {s} {w} | returns results for a specific week where {s} is stage number and {w} is week number
!results previous | returns results for previous week
!results {teamname} | returns a specific team's results for the current week
!results {teamname} {s} {w} | returns a specific team's results for a specific week where {s} is stage number and {w} is week number
!results {teamname} previous | returns a specific team's results for previous week


### Stats:

Command | Result
--------- | :-------
!stats {playername} | returns season stats for the specified player
!stats {playername} {stage} {week} {opponent} | returns stats for the specified player from the specified match


### Standings:

Command | Result
--------- | :-------
!standings | returns the current league standings


### Settings, Help, & Info:

Command | Result
--------- | :-------
!settings prefix {prefix} | _(ADMIN ONLY)_ changes the prefix that the bot uses to denote commands on the current server
!settings enable {commandname} | _(ADMIN ONLY)_ enables a currently disabled command
!settings disable {commandname} | _(ADMIN ONLY)_ disables a currently enabled command for all users except administrators
!settings spoilers | _(ADMIN ONLY)_ toggle whether or not match results are wrapped in spoiler tags
!help | provides a link to this documentation
!info | provides some basic information about the bot

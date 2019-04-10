# owl-stat-bot  
A Discord bot that provides Overwatch League stats and information  
  
Available commands include:  
  
schedule  
  - !schedule - returns schedule for current week  
  - !schedule {s} {w} - returns schedule for a specific week where {s} is stage number and {w} is week number  
  - !schedule next - returns schedule for next week  
  - !schedule previous - returns schedule for previous eek  
  - !schedule {teamname} - returns a specific team's schedule for the current week  
  - !schedule {teamname} {s} {w} - returns a specific team's schedule for a specific week where {s} is stage number and {w} is week number  
  - !schedule {teamname} next - returns a specific team's schedule for next week  
  - !schedule {teamname} previous - returns a specific team's schedule for previous week  
  
results  
  - !results - returns results for current week  
  - !results {s} {w} - returns results for a specific week where {s} is stage number and {w} is week number  
  - !results previous - returns results for previous week  
  - !results {teamname} - returns a specific team's results for the current week  
  - !results {teamname} {s} {w} - returns a specific team's results for a specific week where {s} is stage number and {w} is week number  
  - !results {teamname} previous - returns a specific team's results for previous week  
  
stats
  - !stats {playername} - returns season stats for the specified player
  - !stats {playername} {stage} {week} {opponent} - returns stats for the specified player from the specified match
  
standings  
  - !standings - return the current league standings  
  
settings
  - !settings prefix {prefix} - (ADMIN ONLY) changes the prefix that the bot uses to denote commands on the current server
  - !settings enable {commandname} - (ADMIN ONLY) enables a currently disabled command
  - !settings disable {commandname} - (ADMIN ONLY) disables a currently enabled command for all users except administrators
  - !settings spoilers - (ADMIN ONLY) toggle whether or not match results are wrapped in spoiler tags
  
help
  - !help - provides a link to this documentation
  
info
  - !info - provides some basic information about the bot

const request = require('request-promise-native');
const baseUrl = 'https://api.overwatchleague.com/';

module.exports.apiRequest = (url) => {
    return request({
        method: "get",
        uri: baseUrl + url,
        json: true
    })
}
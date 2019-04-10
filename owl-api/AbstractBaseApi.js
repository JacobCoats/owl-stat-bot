const rp = require('request-promise');
const URL = require('url').URL;

const OWLApiUrl = 'https://api.overwatchleague.com/';

class AbstractBaseApi {

    constructor(cacheOptions) {
        this.BaseEndpoint = new URL(OWLApiUrl);
        this.cache = {};
        this.cacheOptions = cacheOptions || {
            cache: false,
            time: 3600
        };
    }

    get(endpoint) {
        const url = new URL(endpoint, this.BaseEndpoint);
        const cachedRequest = this.cache[endpoint];
        if (this.cacheOptions.cache === false || 
            (!cachedRequest || (Date.now() - cachedRequest.time) >= this.cacheOptions.time)) {
            this.cache[endpoint] = {
                data: rp({url: url.href, json: true}),
                time: Date.now()
            }
        }
        return this.cache[endpoint].data;
    }

}

module.exports = AbstractBaseApi;
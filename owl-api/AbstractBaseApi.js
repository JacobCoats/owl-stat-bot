const rp = require('request-promise');
const URL = require('url').URL;

const OWLApiUrl = 'https://api.overwatchleague.com/';

class AbstractBaseApi {

    constructor(cacheOptions) {
        this.BaseEndpoint = new URL(OWLApiUrl);
    }

    get(endpoint) {
        const url = new URL(endpoint, this.BaseEndpoint);
        return rp({url: url.href, json: true});
    }

}

module.exports = AbstractBaseApi;
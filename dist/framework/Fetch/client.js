"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const has_1 = require("@dojo/framework/core/has");
const EventEmitter = require("events");
const seen = new Map();
class F extends EventEmitter {
    constructor(options, _browser, _options = {}, _cache = {}, _queue = {}, _exporter = {}, _preRequest = null, _requestedCount = 0, _onSuccess = null, _onError = null, _customCrawl = null) {
        super();
        this.options = options;
        this._browser = _browser;
        this._options = _options;
        this._cache = _cache;
        this._queue = _queue;
        this._exporter = _exporter;
        this._preRequest = _preRequest;
        this._requestedCount = _requestedCount;
        this._onSuccess = _onSuccess;
        this._onError = _onError;
        this._customCrawl = _customCrawl;
        this.fetchFn = null;
        this.isHeadless = false;
    }
    async fetch(options) {
        if (!this.fetchFn) {
            if (has_1.default('host-browser')) {
                await require('whatwg-fetch');
                this.fetchFn = window.fetch;
            }
            else if (has_1.default('host-node')) {
                const [result1, result2] = await Promise.all([
                    Promise.resolve().then(() => require('node-fetch')),
                    Promise.resolve().then(() => require('puppeteer'))
                ]);
                this.fetchFn = await Promise.resolve().then(() => require('node-fetch'));
            }
            else {
                throw new Error('This environment is not supported!');
            }
        }
    }
}
exports.default = F;
F.Events = {
    RequestStarted: 'requeststarted',
    RequestSkipped: 'requestskipped',
    RequestDisallowed: 'requestdisallowed',
    RequestFinished: 'requestfinished',
    RequestRetried: 'requestretried',
    RequestFailed: 'requestfailed',
    RobotsTxtRequestFailed: 'robotstxtrequestfailed',
    SitemapXmlRequestFailed: 'sitemapxmlrequestfailed',
    MaxDepthReached: 'maxdepthreached',
    MaxRequestReached: 'maxrequestreached',
    Disconnected: 'disconnected',
};
//# sourceMappingURL=client.js.map
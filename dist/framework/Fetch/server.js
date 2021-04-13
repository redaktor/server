"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const EventEmitter = require("events");
const seen = new Map();
class Fetch extends EventEmitter {
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
    static async fetch(options) {
    }
}
exports.default = Fetch;
Fetch.Events = {
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
//# sourceMappingURL=server.js.map
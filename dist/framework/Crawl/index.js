"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const tslib_1 = require("tslib");
const Puppeteer = require("puppeteer");
const EventEmitter = require("events");
const url_1 = require("url");
const devices = require('puppeteer/DeviceDescriptors');
const rp = require('request-promise');
const robotsParser = require('robots-parser');
const { delay, generateKey, checkDomainMatch, getRobotsUrl, getSitemapUrls, tracePublicAPI } = require('./helper');
const PriorityQueue = require('./priority-queue');
const Crawler = require('./crawler');
const SessionCache = require('../cache/session');
class HeadlessCrawler extends EventEmitter {
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
        this._defaultOptions = {
            maxDepth: 1,
            maxConcurrency: 10,
            maxRequest: 0,
            priority: 0,
            delay: 0,
            retryCount: 3,
            retryDelay: 10000,
            timeout: 30000,
            jQuery: true,
            browserCache: true,
            persistCache: false,
            skipDuplicates: true,
            depthPriority: true,
            obeyRobotsTxt: true,
            followSitemapXml: false,
            skipRequestedRedirect: false,
            cookies: [],
            screenshot: null,
            viewport: null,
            url: ''
        };
        this._options = Object.assign(this._options, options);
        this._cache = options.cache || new SessionCache();
        this._queue = new PriorityQueue({
            maxConcurrency: this._options.maxConcurrency,
            cache: this._cache,
        });
        this._exporter = options.exporter || null;
        this._requestedCount = 0;
        this._preRequest = options.preRequest || null;
        this._onSuccess = options.onSuccess || null;
        this._onError = options.onError || null;
        this._customCrawl = options.customCrawl || null;
        this._exportHeader();
        this._queue.on('pull', (_options, depth, previousUrl) => this._startRequest(_options, depth, previousUrl));
        this._browser.on('disconnected', () => void this.emit(HeadlessCrawler.Events.Disconnected));
    }
    static async launch(options) {
        const { ignoreHTTPSErrors, headless, executablePath, slowMo, args, ignoreDefaultArgs, handleSIGINT, handleSIGTERM, handleSIGHUP, dumpio, userDataDir, env, devtools } = options, CRAWL = tslib_1.__rest(options, ["ignoreHTTPSErrors", "headless", "executablePath", "slowMo", "args", "ignoreDefaultArgs", "handleSIGINT", "handleSIGTERM", "handleSIGHUP", "dumpio", "userDataDir", "env", "devtools"]);
        const LAUNCH = {
            ignoreHTTPSErrors, headless, executablePath, slowMo, args, ignoreDefaultArgs,
            handleSIGINT, handleSIGTERM, handleSIGHUP, dumpio, userDataDir, env, devtools
        };
        const browser = await Puppeteer.launch(LAUNCH);
        const crawler = new HeadlessCrawler(CRAWL, browser);
        await crawler.init();
        return crawler;
    }
    static async connect(options) {
        const { browserWSEndpoint, ignoreHTTPSErrors } = options, CRAWL = tslib_1.__rest(options, ["browserWSEndpoint", "ignoreHTTPSErrors"]);
        const CONNECT = { browserWSEndpoint, ignoreHTTPSErrors };
        const browser = await Puppeteer.connect(CONNECT);
        const crawler = new HeadlessCrawler(CRAWL, browser);
        await crawler.init();
        return crawler;
    }
    static executablePath() {
        return Puppeteer.executablePath();
    }
    static defaultArgs() {
        return Puppeteer.defaultArgs();
    }
    async init() {
        await this._cache.init();
        this._queue.init();
    }
    async queue(optionsOrURIs) {
        const options = Array.isArray(optionsOrURIs) ? optionsOrURIs : [optionsOrURIs];
        const queued = (options).map(async (_option) => {
            const queueOption = typeof _option === 'string' ? { url: _option } : _option;
            const CONSTRUCTOR_OPTIONS = [
                'browserWSEndpoint', 'ignoreHTTPSErrors', 'slowMo', 'ignoreHTTPSErrors',
                'headless', 'executablePath', 'slowMo', 'args', 'ignoreDefaultArgs',
                'handleSIGINT', 'handleSIGTERM', 'handleSIGHUP', 'dumpio', 'userDataDir',
                'env', 'devtools',
                'maxConcurrency', 'maxRequest', 'cache', 'exporter', 'persistCache',
                'preRequest', 'onSuccess', 'onError', 'customizeCrawl',
            ];
            CONSTRUCTOR_OPTIONS.forEach(option => {
                if (queueOption && queueOption[option]) {
                    throw new Error(`Overriding ${option} is not allowed!`);
                }
            });
            const mergedOptions = Object.assign({}, this._options, queueOption);
            if (mergedOptions.evaluatePage) {
                mergedOptions.evaluatePage = `(${mergedOptions.evaluatePage})()`;
            }
            if (!mergedOptions.url) {
                throw new Error('Url must be defined!');
            }
            if (mergedOptions.device && mergedOptions.device !== 'default' &&
                !devices[mergedOptions.device]) {
                throw new Error('Specified device is not supported!');
            }
            if (mergedOptions.delay > 0 && mergedOptions.maxConcurrency !== 1) {
                throw new Error('Max concurrency must be 1 when delay is set!');
            }
            mergedOptions.url = url_1.parse(mergedOptions.url).href;
            await this._push(omit(mergedOptions, CONSTRUCTOR_OPTIONS), 1, null);
        });
        await Promise.all(queued);
    }
    async close() {
        this._queue.end();
        await this._browser.close();
        await this._endExporter();
        await this._clearCacheOnEnd();
        await this._closeCache();
    }
    async disconnect() {
        this._queue.end();
        await this._browser.disconnect();
        await this._endExporter();
        await this._clearCacheOnEnd();
        await this._closeCache();
    }
    version() {
        return this._browser.version();
    }
    userAgent() {
        return this._browser.userAgent();
    }
    wsEndpoint() {
        return this._browser.wsEndpoint();
    }
    async onIdle() {
        await this._queue.onIdle();
    }
    setMaxRequest(maxRequest) {
        this._options.maxRequest = maxRequest;
    }
    pause() {
        this._queue.pause();
    }
    resume() {
        this._queue.resume();
    }
    async clearCache() {
        await this._cache.clear();
    }
    isPaused() {
        return this._queue.isPaused();
    }
    queueSize() {
        return this._queue.size();
    }
    pendingQueueSize() {
        return this._queue.pending();
    }
    requestedCount() {
        return this._requestedCount;
    }
    async _newCrawler(options, depth, previousUrl) {
        const page = await this._browser.newPage();
        return new Crawler(page, options, depth, previousUrl);
    }
    async _push(options, depth, previousUrl) {
        let { priority } = options;
        if (!priority && options.depthPriority)
            priority = depth;
        await this._queue.push(options, depth, previousUrl, priority);
    }
    async _startRequest(options, depth, previousUrl) {
        const skip = await this._skipRequest(options);
        if (skip) {
            this.emit(HeadlessCrawler.Events.RequestSkipped, options);
            await this._markRequested(options);
            return;
        }
        const allowed = await this._checkAllowedRobots(options, depth, previousUrl);
        if (!allowed) {
            this.emit(HeadlessCrawler.Events.RequestDisallowed, options);
            await this._markRequested(options);
            return;
        }
        await this._followSitemap(options, depth, previousUrl);
        const links = await this._request(options, depth, previousUrl);
        this._checkRequestCount();
        await this._followLinks(links, options, depth);
        await delay(options.delay);
    }
    async _skipRequest(options) {
        const allowedDomain = this._checkAllowedDomains(options);
        if (!allowedDomain)
            return true;
        const requested = await this._checkRequested(options);
        if (requested)
            return true;
        const shouldRequest = await this._shouldRequest(options);
        if (!shouldRequest)
            return true;
        return false;
    }
    async _request(options, depth, previousUrl, retryCount = 0) {
        this.emit(HeadlessCrawler.Events.RequestStarted, options);
        const crawler = await this._newCrawler(options, depth, previousUrl);
        try {
            const res = await this._crawl(crawler);
            await crawler.close();
            this.emit(HeadlessCrawler.Events.RequestFinished, options);
            const requested = await this._checkRequestedRedirect(options, res.response);
            await this._markRequested(options);
            await this._markRequestedRedirects(options, res.redirectChain, res.response);
            if (requested)
                return [];
            this._exportLine(res);
            await this._success(res);
            return res.links;
        }
        catch (error) {
            await crawler.close();
            Object.assign(error, { options, depth, previousUrl });
            if (retryCount >= options.retryCount) {
                this.emit(HeadlessCrawler.Events.RequestFailed, error);
                await this._error(error);
                return [];
            }
            this.emit(HeadlessCrawler.Events.RequestRetried, options);
            await delay(options.retryDelay);
            return this._request(options, depth, previousUrl, retryCount + 1);
        }
    }
    async _checkAllowedRobots(options, depth, previousUrl) {
        if (!options.obeyRobotsTxt)
            return true;
        const robot = await this._getRobot(options, depth, previousUrl);
        const userAgent = await this._getUserAgent(options);
        return robot.isAllowed(options.url, userAgent);
    }
    async _followSitemap(options, depth, previousUrl) {
        if (!options.followSitemapXml)
            return;
        const robot = await this._getRobot(options, depth, previousUrl);
        const sitemapUrls = robot.getSitemaps();
        await Promise.resolve(sitemapUrls.map(async (sitemapUrl) => {
            const sitemapXml = await this._getSitemapXml(sitemapUrl, options, depth, previousUrl);
            const urls = getSitemapUrls(sitemapXml);
            await Promise.all(urls.map(async (url) => {
                await this._push(Object.assign({}, options, { url }), depth, options.url);
            }));
        }));
    }
    async _getSitemapXml(sitemapUrl, options, depth, previousUrl) {
        let sitemapXml = await this._cache.get(sitemapUrl);
        if (!sitemapXml) {
            try {
                sitemapXml = await rp(sitemapUrl);
            }
            catch (error) {
                Object.assign(error, { options, depth, previousUrl });
                this.emit(HeadlessCrawler.Events.SitemapXmlRequestFailed, error);
                sitemapXml = '';
            }
            finally {
                await this._cache.set(sitemapUrl, '1');
            }
        }
        return sitemapXml;
    }
    async _getRobot(options, depth, previousUrl) {
        const robotsUrl = getRobotsUrl(options.url);
        let robotsTxt = await this._cache.get(robotsUrl);
        if (!robotsTxt) {
            try {
                robotsTxt = await rp(robotsUrl);
            }
            catch (error) {
                Object.assign(error, { options, depth, previousUrl });
                this.emit(HeadlessCrawler.Events.RobotsTxtRequestFailed, error);
                robotsTxt = '';
            }
            finally {
                await this._cache.set(robotsUrl, robotsTxt);
            }
        }
        return robotsParser(robotsUrl, robotsTxt);
    }
    async _getUserAgent(options) {
        if (options.userAgent)
            return options.userAgent;
        if (devices[options.device])
            return devices[options.device].userAgent;
        return this.userAgent();
    }
    _checkAllowedDomains(options) {
        const { hostname } = url_1.parse(options.url);
        if (options.deniedDomains && checkDomainMatch(options.deniedDomains, hostname))
            return false;
        if (options.allowedDomains && !checkDomainMatch(options.allowedDomains, hostname))
            return false;
        return true;
    }
    async _checkRequested(options) {
        if (!options.skipDuplicates)
            return false;
        const key = generateKey(options);
        const value = await this._cache.get(key);
        return !!value;
    }
    async _checkRequestedRedirect(options, response) {
        if (!options.skipRequestedRedirect)
            return false;
        const requested = await this._checkRequested(Object.assign({}, options, { url: response.url }));
        return requested;
    }
    async _markRequested(options) {
        if (!options.skipDuplicates)
            return;
        const key = generateKey(options);
        await this._cache.set(key, '1');
    }
    async _markRequestedRedirects(options, redirectChain, response) {
        if (!options.skipRequestedRedirect)
            return;
        await Promise.all(redirectChain.map(async (request) => {
            await this._markRequested(Object.assign({}, options, { url: request.url }));
        }));
        await this._markRequested(Object.assign({}, options, { url: response.url }));
    }
    async _shouldRequest(options) {
        if (!this._preRequest)
            return true;
        return this._preRequest(options);
    }
    async _success(result) {
        if (!this._onSuccess)
            return;
        await this._onSuccess(result);
    }
    async _error(error) {
        if (!this._onError)
            return;
        await this._onError(error);
    }
    async _crawl(crawler) {
        if (!this._customCrawl)
            return crawler.crawl();
        const crawl = () => crawler.crawl.call(crawler);
        return this._customCrawl(crawler.page(), crawl);
    }
    async _followLinks(urls, options, depth) {
        if (depth >= options.maxDepth) {
            this.emit(HeadlessCrawler.Events.MaxDepthReached);
            return;
        }
        await Promise.all(urls.map(async (url) => {
            const _options = Object.assign({}, options, { url });
            const skip = await this._skipRequest(_options);
            if (skip)
                return;
            await this._push(_options, depth + 1, options.url);
        }));
    }
    _checkRequestCount() {
        this._requestedCount += 1;
        if (this._options.maxRequest && this._requestedCount >= this._options.maxRequest) {
            this.emit(HeadlessCrawler.Events.MaxRequestReached);
            this.pause();
        }
    }
    _exportHeader() {
        if (!this._exporter)
            return;
        this._exporter.writeHeader();
    }
    _exportLine(res) {
        if (!this._exporter)
            return;
        this._exporter.writeLine(res);
    }
    async _endExporter() {
        if (!this._exporter)
            return;
        await new Promise((resolve, reject) => {
            this._exporter.onEnd().then(resolve).catch(reject);
            this._exporter.writeFooter();
            this._exporter.end();
        });
    }
    async _clearCacheOnEnd() {
        if (this._options.persistCache)
            return;
        await this.clearCache();
    }
    async _closeCache() {
        await this._cache.close();
    }
}
exports.default = HeadlessCrawler;
HeadlessCrawler.Events = {
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
tracePublicAPI(HeadlessCrawler);
module.exports = HeadlessCrawler;
//# sourceMappingURL=index.js.map
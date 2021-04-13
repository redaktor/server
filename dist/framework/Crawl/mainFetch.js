"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const EventEmitter = require("events");
const devices = require('puppeteer/DeviceDescriptors');
const rp = require('request-promise');
const robotsParser = require('robots-parser');
const { delay, generateKey, checkDomainMatch, getRobotsUrl, getSitemapUrls, tracePublicAPI } = require('./helper');
const PriorityQueue = require('./priority-queue');
const Crawler = require('./crawler');
const SessionCache = require('../cache/session');
class Fetcher extends EventEmitter {
}
exports.default = Fetcher;
//# sourceMappingURL=mainFetch.js.map
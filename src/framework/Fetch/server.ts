// TODO FIXME : allowedDomains / deniedDomains
/* When to consider navigation succeeded, defaults to load.
See the Puppeteer's page.goto()'s waitUntil options for further details. */
//waitUntil?: Puppeteer.WaitForSelectorOptions;
/* Wait for selector. See Puppeteer's page.waitFor() for further details. */
//waitFor?: CrawlerWait;
/* =
waitFor <Object> See Puppeteer's page.waitFor() for further details.
selectorOrFunctionOrTimeout?: string|number|function; A selecctor, predicate or timeout to wait for.
options?: Puppeteer.WaitForSelectorOptions; Optional waiting parameters.
args <Array<Serializable>> List of arguments to pass to the predicate function.
*/
// TODO CHECK what does node-fetch not support
import has from '@dojo/framework/core/has';
import * as fs from 'fs';
import * as util from 'util';
import * as sharp from 'sharp';
import * as EventEmitter from 'events';
import * as Puppeteer from 'Puppeteer';
import { parse } from 'url';

const seen: any = new Map();
export default class Fetch extends EventEmitter {
  static Events = {
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
  protected fetchFn: any = null;
  protected isHeadless = false;
  // protected _defaultOptions: CrawlerProperties = {}

  /**
   * @param {!Puppeteer.Browser} browser
   * @param {!Object} options
   */
  constructor(
    public options: any,
    private _browser: Puppeteer.Browser,
    private _options: any = {},
    private _cache: any = {},
    private _queue: any = {},
    private _exporter: any = {},
    private _preRequest: any = null,
    private _requestedCount: number = 0,
    private _onSuccess: any = null,
    private _onError: any = null,
    private _customCrawl: any = null
  ) {
    super();

/*
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

    this._queue.on('pull', (
      _options: CrawlerConnectProperties, depth: number, previousUrl: string
    ) => this._startRequest(_options, depth, previousUrl));
    this._browser.on('disconnected', () => void this.emit(HeadlessCrawler.Events.Disconnected));
*/
  }

  /**
   * @param {!Object=} options
   * @return {!Promise<!HeadlessCrawler>}
   */
  static async fetch(options: any) {

  }
}
/*
    const {
      ignoreHTTPSErrors, headless, executablePath, slowMo, args, ignoreDefaultArgs,
      handleSIGINT, handleSIGTERM, handleSIGHUP, dumpio, userDataDir, env, devtools,
      ...CRAWL
    } = options;
    const LAUNCH: Puppeteer.LaunchOptions = {
      ignoreHTTPSErrors, headless, executablePath, slowMo, args, ignoreDefaultArgs,
      handleSIGINT, handleSIGTERM, handleSIGHUP, dumpio, userDataDir, env, devtools
    }
    const browser = await Puppeteer.launch(LAUNCH);
    const crawler = new HeadlessCrawler(CRAWL, browser);
    await crawler.init();
    return crawler;
  */

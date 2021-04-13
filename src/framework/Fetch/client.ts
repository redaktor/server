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
export interface ServerProperties extends Puppeteer.LaunchOptions {
  /* Whether to adjust priority based on its depth, defaults to true.
  Leave default to increase priority for higher depth (depth-first search). */
  depthPriority?: boolean;
  /* Function to customize crawled result, allowing access to Puppeteer's raw API. */
  customCrawl?: (page: /*TODO Puppeteer.Page*/any, crawl: Function) => any;
  /* Function to be called when evaluatePage() successes. */
  onSuccess?: (result: FetchResponse) => void;
  /* Function to be called when request fails. */
  onError?: (error: Error) => void;
}
export interface FetchProperties extends RequestInit {
  // These properties are part of the Fetch Standard
  /* Request Body. Can be null, a string, a Buffer, a Blob,
  or a Node.js Readable stream */
  body?: BodyInit | NodeJS.ReadableStream | null;
  /* The cache mode of the request (e.g., default, reload, no-cache) */
  cache?: RequestCache;
  /* Credentials of the request (e.g., "omit", "same-origin", "include").
  Default is "same-origin". */
  credentials?: RequestCredentials;
  /* Request Headers.
  Format is the identical to that accepted by the Headers constructor */
  headers?: HeadersInit;
  /* The subresource integrity value of the request */
  integrity?: string;
  /* Persistent connection */
  keepalive?: boolean;
  /* The request's method (GET, POST, HEAD, etc.) */
  method?: string;
  /* Mode of the request (e.g., cors, no-cors, same-origin, navigate.)
  NOTE: no effect when used with NodeJS */
  mode?: RequestMode;
  /* Set to `manual` to extract redirect headers, `error` to reject redirect.
  Default is `follow` */
  redirect?: RequestRedirect;
  /* The referrer of the request (e.g., client) */
  referrer?: string;
  /* The referrer policy of the request (e.g., no-referrer) */
  referrerPolicy?: ReferrerPolicy;
  /* Pass an instance of AbortSignal to optionally abort requests */
  signal?: any; /* TODO */ /*AbortSignal | null;*/
  window?: any;
  // The following properties are fetch extensions
  /* http(s).Agent instance, for custom proxy, certificate, dns lookup etc. */
  agent: any;
  /* Support gzip/deflate content encoding. Default true */
  compress: boolean;
  /* Maximum redirect count. 0 to not follow redirect. Default is 12 */
  follow: number;
  /* Respect robots.txt and Robot Meta Tags. Default false */
  isRobot: boolean;
  /* req/res timeout in ms, it resets on redirect. 0 to disable (OS limit).
  Signal is recommended instead. Default: uses Signal */
  timeout: number;
  /* Maximum response body size in bytes. 0 to disable */
  size: number;
  /* Whether to skip duplicate requests, default to true. Request is considered
  to match if url, userAgent, device & extraHeaders are strictly the same. */
  skipDuplicates?: boolean;
  /* Priority of queues, defaults to 1. Any larger number is preferred then. */
  priority?: number;
  /* Function to do anything like modifying options before each request.
  You can also return false if you want to skip the request. */
  preRequest?: (options: FetchProperties) => any;
  /* Number of limit when retry fails, defaults to 3. */
  retryCount?: number;
  /* Number of milliseconds after each retry fails, defaults to 10000. */
  retryDelay?: number;
  /* NodeJS only */
  server?: ServerProperties | null;
}

export interface FetchResponse extends Response {

}


const seen: any = new Map();
export default class F extends EventEmitter {
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
  protected async fetch(options: any) {
    if (!this.fetchFn) {
      if (has('host-browser')) {
        await require('whatwg-fetch');
        this.fetchFn = window.fetch
      } else if (has('host-node')) {
        const [result1, result2] = await Promise.all([
          import('node-fetch'),
          import('puppeteer')
        ]);
        this.fetchFn = await import('node-fetch')
      } else {
        throw new Error('This environment is not supported!');
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
  }
}

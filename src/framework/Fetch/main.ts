// TODO FIXME : allowedDomains / deniedDomains
/* When to consider navigation succeeded, defaults to load.
See the Puppeteer's page.goto()'s waitUntil options for further details. */
//waitUntil?: Puppeteer.WaitForSelectorOptions;
/* Wait for selector. See Puppeteer's page.waitFor() for further details. */
//waitFor?: CrawlerWait;
/* =
waitFor <Object> See Puppeteer's page.waitFor() for further details.
selectorOrFunctionOrTimeout?: string|number|function; A selector, predicate or timeout to wait for.
options?: Puppeteer.WaitForSelectorOptions; Optional waiting parameters.
args <Array<Serializable>> List of arguments to pass to the predicate function.
*/
// TODO CHECK what does node-fetch is NOT supporting
import has from '@dojo/framework/has/has';
import { Url, FetchProperties, FetchPropertiesOnly } from './index';
import ServerProperties from './server';
import API from './main.r';
console.log('ready');
/* --< */

/**
* TODO FIXME DOC
* l2
* @param
*/
//@API
export default class Fetch {
  private errors: any;
  private _cache: any = {};
  private _queue: any = {};
  private _seen: any = new Map();
  protected fetchFn: any = null;
  protected isHeadless = false;

  constructor(public options: FetchProperties = {}) {
    options.method = typeof options.method === 'string' ?
      `${options.method.toUpperCase()}` : 'GET';
/*
    this._cache = options.cache || new SessionCache();
    this._queue = new PriorityQueue({
      maxConcurrency: this._options.maxConcurrency,
      cache: this._cache,
    });
    this._exportHeader();
    this._queue.on('pull', (
      _options: CrawlerConnectProperties, depth: number, previousUrl: string
    ) => this._startRequest(_options, depth, previousUrl));
    this._browser.on('disconnected', () => void this.emit(HeadlessCrawler.Events.Disconnected));
*/
  }

  /**
  * comment
  */
  async fetch(url: Url, options: FetchProperties = this.options) {

    if ( this.errors ) {
      console.log('ERROR', this.errors)
    }

    console.log(url, options);
    //, c: [string,number,number] = ['a',1,2] //const V = v('fetch', {url, options});
    //console.log( 'do', options ); return;
    if (!this.fetchFn) {
      if (has('host-node')) {
        this.fetchFn = await import('node-fetch');

      } else if (has('host-browser')) {
        delete options.server;
        await require('whatwg-fetch');
        this.fetchFn = window.fetch
      } else {
        throw new Error('This environment is not supported!');
      }
    }
    this.options = options;

    // TODO isRobot prefetch robots.txt

    if (has('host-node')) {
      return this.fetchFn(url, this.options)
    } else {
      return this.clientFetch(url, this.options)
    }

      // in following scenarios we ignore compression support
			// 1. compression support is disabled
			// 2. HEAD request
			// 3. no Content-Encoding header
			// 4. no content response (204)
			// 5. content not modified response (304)
			/*if (!request.compress || request.method === 'HEAD' || codings === null || res.statusCode === 204 || res.statusCode === 304) {
				response = new Response(body, response_options);
				resolve(response);
				return;
			}*/
    }

    private clientFetch(url: string, options: FetchProperties = {}) {

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

console.log('--- new:');

const F = new Fetch();
console.log('--- do .fetch:');
F.fetch('https://heise.de', {})
.then(res => { console.log(res, res.socket); return res })
//.then(res => res.text()).then(console.log);
//(<any>F).fetch(2);

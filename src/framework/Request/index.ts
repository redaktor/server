/*
RequestMixin - a special HTTP request class to mixin dealing with the OAuth mess
TODO FIXME and DOC EVERYTHING
*/
import { authRequest, authResponse } from './interfaces';
import has from '@dojo/framework/has/has';
import { mixin, deepMixin } from '@dojo/framework/core/util';
//import Promise from '@dojo/shim/Promise';
/* NOTE - request itself SHOULD become dojo/core, our changes are covered by
 * e.g. https://github.com/dojo/core/issues/197 and https://github.com/dojo/core/issues/259
 */
import request, { filterRegistry } from './request';
/* < */
import * as uriTemplates from 'uri-templates';
//import microformats from '../microformats';
import jsonPointer from '../JSON/Pointer';
import URL from '../url';
//import crypto from '../crypto';
import uuid, { nonce } from '../uuid';
import { urlEncode, urlDecode } from '../String/base64';
import { isObject } from '../lang/isObjectTypes';
/* TODO separate util main */
import { byteLength } from '../util/lang';

/* TODO FIXME */
const pwLog = console.log;



/* TODO
FUNCTION TO getRedirects

- SHOULD require logFns ONLY IF this.debug
- SHOULD handle expired token errors, https://goo.gl/Kz9OHw :
if (status_code === 401 && parsed_www_authenticate["error"] === "invalid_token")
AND
if (status_code === 400 && www_authenticate has 'OAuth "Facebook Platform" "invalid_token"')
*/

type FN = (data: any) => void;
class RequestMixin {
  debug: boolean = false;
  protected _authHeaderKey: string = 'Authorization';
  protected _protocol: string = 'BasicAuth';
  protected _version: string = '';
  protected _type: string = (has('host-browser')||!has('host-node')) ? '2legged' : '3legged';
  protected _headerPrefix: string = 'Basic '; /* Dynamic */
  protected _nonceSize: number = 32;
  _options: any = { /* No further assumptions */
    headers: {}, query: {}, responseType: 'text'
  }
  protected authOptions: any = { /* BasicAuth default */
    method: 'GET', headers: {}, query: {}
  };
  get protocolStr(): string {
    return [this._protocol,this._version,this._type].join(' ');
  }

  constructor(protected messages = {}, protected key?: string, protected secret?: string) {
    for (var k in this.responseTypes) {
      filterRegistry.register((<any>this).registerType(k), this.responseTypes[k]);
    }
    this.initRequest();
  }
  /* public, overwritable : */
  public initRequest() {}

	protected proxy(res: authResponse<any>, data: any, type = 'text') {
    const options = res.requestOptions;
		if (!!(options.set && typeof options.set[type] === 'function')) {
			data = options.set[type](data);
		}
		return data;
	}
  protected responseTypes: any = {
    /* TODO - FIXME SHOULD emit .on events for multiple converts */
    text: (res: authResponse<any>): Object => {
			let data = this.proxy(res, res.data);
			return {data: data.toString()};
		},
    json: (res: authResponse<any>): Object => {
			let data = this.proxy(res, this.responseTypes.text(res).data, 'json');
			return {data: JSON.parse(data)};
		},
    html: (res: authResponse<any>): Object => {
			let data = this.proxy(res, this.responseTypes.text(res).data, 'html');
			if (has('host-node')) {
				const cheerio: any = require('cheerio');
				return {data: (cheerio.load(data, {decodeEntities: false}))};
			}
			return {data: data};
			/* TODO FIXME client ! */
		},
    /* TODO FIXME w. NEW MICROFORMATS CLASS
    mf: (res: authResponse<any>): Object => {
			let data = this.proxy(res, this.responseTypes.html(res).data, 'mf');
      return {data: microformats.get(data, res.url)}
    },*/
    query: (res: authResponse<any>): Object => {
      let data = this.proxy(res, this.responseTypes.text(res).data, 'query');
      return {data: URL.parameters(data).get()}
    }
  }

  protected registerType(type: string) {
    return (res: authResponse<any>): boolean => {
      const options = res.requestOptions;
      return !!(typeof res.data && options && options.responseType === type);
    }
  }

  protected _getUUID(str?: string) {
    return uuid(str);
  }
  protected _getNonce(lengthOrMin: number = this._nonceSize, maxLength?: number) {
    return nonce(lengthOrMin, maxLength);
  }
  protected _escapeHTML(str: string): string {
    var map: any = {
      '&': '&amp;',
      '<': '&lt;',
      '>': '&gt;',
      '"': '&quot;',
      "'": '&#039;'
    };
    return str.replace(/[&<>"']/g, function(m) { return map[m]; });
  }
  protected _getTimestamp(): string {
    return Math.floor((new Date()).getTime() / 1000).toString();
  }
  protected _fixEncode(str: string): string {
    // Fix the mismatch between OAuth's RFC3986's and Javascript's beliefs ;)
    return str.replace(/\!/g, '%21').replace(/\'/g, '%27')
              .replace(/\(/g, '%28').replace(/\)/g, '%29')
              .replace(/\*/g, '%2A');
  }
  protected _encode(toEncode: string | Buffer): string {
    if (typeof toEncode != 'string' || !toEncode.length) { return ''; }
    var result = encodeURIComponent(toEncode);
    return this._fixEncode(result);
  }
  protected _decode(toDecode: string): string {
    if (typeof toDecode != 'string' || !toDecode.length) { return toDecode; }
    return decodeURIComponent(toDecode);
  }
  protected _urlEncode(str: string): string {
    return urlEncode(str);
  }
  protected _urlDecode(str: string): string {
    return urlDecode(str);
  }

  msg(_id?: any, el?: any, bundle?: any, fallback = '', doReturn = false): string {
    if (!_id) { _id = 'unknown'; }
    var m = (!!(this.messages) && (<any>this.messages)[_id]);
    if (!m) { m = (!!bundle && !!(bundle.messages) && bundle.messages[_id]); }
    if (!m) { m = _id; }
    if (!!el && typeof el === 'object') {
      const rawData = !!(el.dataset) ? el.dataset : el;
      (m.match(/[_]\{([^}]+)\}/gi)||[]).map((tplStr: string) => {
        const pointer = tplStr.slice(2, -1);
        var data = rawData[pointer];
        if (typeof data !== 'string' && tplStr.slice(2, 3) === '/') {
          data = jsonPointer(rawData, pointer);
        }
        m = m.replace(tplStr, (typeof data === 'string') ? data : fallback);
      });
    }
    // allow to reuse variables inside a template ...
    return (!!doReturn) ? m : this.msg(m, el, bundle, fallback, true);
  }
  /* debug functions: error log, initial parameters log and request log */
  errLog(_text: string, _status: number = 400, _data: any = {}) {
    return JSON.stringify({
      type: this.protocolStr, status: _status, text: _text, data: _data
    });
  }
  debugLog(logArr: any, doPadding: boolean = false, inclFn: boolean = false) {
    if (!this.debug) { return; }
    if (!Array.isArray(logArr)) { logArr = [logArr]; }
    console.log(logArr, doPadding, inclFn);
  }
  initDebugLog(secretKeys: string[] = [], excludeKeys: string[] = []) {
    if (!this.debug) { return; }
    const o: any = mixin({}, this);
    Object.keys(o).forEach((key) => {
      if (key.slice(0,8) === '_options' || key === 'E') { delete o[key]; }
      if (secretKeys.indexOf(key) > -1) { o[key] = pwLog(o[key], 1); }
			if (excludeKeys.indexOf(key) > -1) { delete o[key]; }
    });
    this.debugLog([
      { success: [this.protocolStr,'Module started:'].join(' ') },
      { list: o },
      { neutral: [this.protocolStr, 'is waiting ...'].join(' ') }, {neutral:' '}
    ], true);
  }
  requestLog(opts: authRequest|any) {
    return Object.keys(opts).reduce((r: any, k: string): any => {
      if (k != 'url' && k != 'method') {
        r[k] = (typeof opts[k] === 'string' && /secret/i.test(k)) ?
                pwLog(opts[k], 1) : opts[k];
      }
      return r;
    }, {});
  }
  /* default error handling */
  error(id?: string, statusCode = 412, isPromise = false): any {
    return (eRes: any) => {
      this.debugLog({ warning: eRes.status || '!' });
      this.debugLog([{ error: 'Request Error: ' }, { list: eRes }]);
      return eRes;
    }
  }
  debugError(res: any) {
    const debugE = { prefix: '', msg: '' };
    if (this.debug) {
      debugE.prefix = !!(this._protocol) ?
        ['[',this._protocol,(this._type || ''),']'].join(' ') :
        ['[',(this.constructor['name'] || ''),']'].join(' ');
      debugE.msg = [
        (res.statusCode||res.code||''),
        (res.statusMessage||'< ' + res.host||'')
      ].join(' ');
    }
    return debugE;
  }
  /* <-- debug functions */


  protected _resolveRelative(mainUrl: string, url: string) {
    return URL.resolveRelative(mainUrl, url);
  }
  protected _normalizeUrl(url: any, inclQuery: boolean = true, nonHTTPto?: string): string {
    return URL.normalizeUrl(url, inclQuery, nonHTTPto);
  }

  protected _getRequest(url: string, myOptions: any): any {
    var _url = URL.parse(url, true);
    /* TODO - PUT q-params in the url to myOptions.query */
    const myUrl = this._normalizeUrl(_url, false);
    return request(myUrl, mixin({debug: this.debug}, myOptions));
  }

  private _getClientOptions(kwArgs: any = {}) {
    if (!kwArgs.url) {
      kwArgs.url = (!!(<any>this)['requestUrl'] && (<any>this)['requestUrl']) ||
        (<any>this)['authUrl'];
    }
    /* TODO FIXME give up if no kwArgs.url or URL not valid -
      might happen if this is used externally */
    let parsedUrl = URL.parse(kwArgs.url, false);
    kwArgs = deepMixin({
      query: parsedUrl.query, auth: parsedUrl.auth,
      headers: { host: parsedUrl.host, 'content-length': 0 }
    }, this._options, kwArgs);
    mixin(kwArgs, {
      url: URL.normalizeUrl(URL.format(mixin(parsedUrl, {query:{}, auth:''})), false)
    });
    const rt = kwArgs.responseType;
    if (typeof rt !== 'string' || Object.keys(this.responseTypes).indexOf(rt) < 0) {
      kwArgs.responseType = /.json$/i.test(kwArgs.url) ? 'json' : 'text'
    }
    if (kwArgs.data) {
      kwArgs.headers['content-length'] = byteLength(kwArgs.data);
    }
    /* OAuth parameters can be included in a single oauth object -
     * useful for middleware requests {oauth: res} or web tokens */
    if (typeof kwArgs.oauth === 'object') {
      mixin(kwArgs, kwArgs.oauth);
      for (var key in kwArgs.oauth) {
        if (key === 'meta' || key === 'authUrl' || key.slice(0,6) === 'oauth_') {
          delete kwArgs.oauth[key];
        }
      }
    }
    const authStr = this.getAuthHeader(kwArgs);
    if (typeof authStr === 'string') {
      kwArgs.headers[this._authHeaderKey] = authStr;
    }
    return this.getClientOptions(kwArgs);
  }
  getClientOptions(kwArgs: any = {}) { return kwArgs; }

  /* getAuthHeader is different in OAuth1 / Oauth2 etc. - BasicAuth : */
  protected getAuthHeader(...a: any[]): string {
    if (this._protocol !== 'BasicAuth') { return null; }
    const auth = {key: '', secret: <string>undefined};
    if (this.isObject(a[0])) {
      if (!!a[0].auth && typeof a[0].auth === 'string') {
        const authArr = a[0].auth.split(':');
        auth.key = authArr[0] || this.key;
        if (authArr.length > 1) { auth.secret = authArr[1] || this.secret; }
      } else {
        auth.key = (this.isObject(a[0]) && typeof a[0].key === 'string' && a[0].key) || this.key;
        const s = (this.isObject(a[0]) && typeof a[0].secret === 'string' && a[0].secret) || this.secret;
        if (!!s) { auth.secret = s; }
      }
    }
    const authStr = auth.key + ((!!auth.secret) ? (':' + auth.secret) : '');
    this.debugLog({ neutral: 'Basic Authentication for ' + auth.key });
    return [this._headerPrefix, urlEncode(authStr)].join(' ');
  }

  reply(res: authResponse<{}>, kwArgs: any, myOptions: any, success?: FN, err?: FN) {
    const status = res.statusCode;
    const headers = (res.nativeResponse) ? res.nativeResponse.headers : {};
    const isOK = (res.statusCode >= 200 && res.statusCode <= 299);
    res.statusMessage = (res.nativeResponse.statusMessage || '');
    let debug = this.debugError(res);
    if (isOK) {
      this.debugLog([
        { neutral: debug.prefix + ' SUCCESS: ' },
        { success: debug.msg + ' < ' +  kwArgs.url }
      ]);
      var data: any = { meta: { status: res.statusCode } }
      if (myOptions.responseType === 'json') {
        data = deepMixin({}, res.data, data);
      } else if (this.isObject(kwArgs.oauth)) {
        data = mixin(data, URL.parameters(String(res.data)).get());
      } else {
        data = res.data;
      }
      if (this.isObject(kwArgs.oauth)) {
        for (var key in kwArgs.oauth) {
          if (key === 'meta' || key === 'authUrl' || key.slice(0,6) === 'oauth_') {
            delete kwArgs.oauth[key];
          }
        }
        res.requestOptions.meta.oauth = kwArgs.oauth;
      }

      res.data = data;
      return (!!success) ? success(res) : res;
    } else {
      this.debugLog([
        { neutral: debug.prefix + ' FAILED:' + res.statusCode },
        { error: headers.location + ' : ' + debug.msg }
      ]);
      if (typeof res.url === 'string') {
        mixin(res, URL.parse((res.requestOptions['url'] || res.url), true));
      }
      res.error = new Error(debug.msg);
      return ((typeof err === 'function') ? err(res) : res);
    }
  }

  request(kwArgs: authRequest|any, success?: FN, reqError?: FN) {
    if (!kwArgs.url && !!kwArgs['options']) { kwArgs = kwArgs['options']; }
    kwArgs = this._getClientOptions(kwArgs);
    const myOptions: authRequest = {
			url: kwArgs.url,
			responseType: kwArgs.responseType,
      method:  kwArgs.method,
      query:   kwArgs.query,
      headers: kwArgs.headers,
      timeout: kwArgs.timeout || 6000,
      maxRedirects: kwArgs.maxRedirects || 5,
      meta: mixin({url: kwArgs.url}, (kwArgs.meta || {})),
			set: kwArgs.set || false
      //,sslEnabled: !!(_url.protocol === 'https:')
			/* TODO FIXME
			followRedirects
			cacheBust
			*/
    }
    if (this.isPutPost(kwArgs)) { myOptions.data = kwArgs.data; }
    if (this.debug) {
      this.debugLog([
        {out:[kwArgs.method,kwArgs.url]}, {list:this.requestLog(myOptions)}
      ]);
    }


    const myError = (e: authResponse<{}>) => {
      const res = {
        meta: {},
        statusCode: 0,
        statusMessage: '',
        error: { code: 0, message: '' }
      }
      /*
      if (typeof e.code != 'string' || !(Errors.hasOwnProperty(e.code))) {
        res.meta = myOptions.meta;
        res.error.code = 0;
        res.error.message = 'An unknown error occured.';
        res.statusMessage = res.error.message;
      } else {
        const _index = Errors[e.code];
        res.meta = myOptions.meta;
        res.error.code = 0;
        res.error.message = ErrorMessages[_index] + ' – ' + e.code;
        res.statusMessage = res.error.message;
      }
      */
      let debug = this.debugError(res);
      this.debugLog([
        { neutral: debug.prefix + ' FAILED:' },
        { error: res.error.code + ' – ' + debug.msg }
      ]);
      //reject((typeof reqError === 'function') ? reqError(res) : res);
    }
    /* TODO */
    const myRequest = this._getRequest(kwArgs.url, myOptions);
    return myRequest.then((res: authResponse<{}>): any => {
			if (res.data instanceof Promise) {
        /* important, allows responseTypes to return a Promise */
				return res.data.then((d: any) => {
					res.data = d;
					return this.reply(res, kwArgs, myOptions, success, reqError);
				});
			} else {
				return this.reply(res, kwArgs, myOptions, success, reqError);
			}
    } /*, myError TODO FIXME */);
  }

  _kwArgs(urlOrKwArgs: authRequest|string, kwArgs: authRequest = {}) {
    const o = (typeof urlOrKwArgs === 'string') ?
      mixin({url: urlOrKwArgs}, kwArgs) : urlOrKwArgs;
    if (!!o.url) { o.url = uriTemplates(o.url).fillFromObject(this); }
    return o;
  }
  urlToObj(obj: any, name: string) {
    const _d = ((this.isObject(obj[name+'Options']) && obj[name+'Options'])||{});
    //console.log('b', this._kwArgs((obj[name+'Url']||obj), _d));
    return this._kwArgs((obj[name+'Url']||obj), _d);
  }
  options(o: any = {}, ...optionObjects: any[]): Promise<any> {
    //console.log('a', o.options.state);
    const defaultO = (typeof o.id === 'string') ? this.urlToObj(this, o.id) : {};
    const optionsO = (typeof o.id === 'string') ? this.urlToObj(o.options, o.id) : {};

    //console.log(this._options, defaultO, optionsO);
    o.options = deepMixin({}, this._options, defaultO, optionsO);
    //deepMixin(_default, optionsO);
    //console.log('c',  o.options.state);
    optionObjects.forEach((oO: any) => {
      if (!this.isObject(oO)) { oO = {}; }
      deepMixin(o.options, oO);
    });
    if (!!o.options.set && typeof o.options.set.options === 'function') {
      mixin(o.options, o.options.set.options(this));
    }
    return Promise.resolve(o);
  }

  head(urlOrKwArgs: authRequest|string, kwArgs?: authRequest) {
    kwArgs = this._kwArgs(urlOrKwArgs, kwArgs);
    return this.request(mixin(kwArgs, {method: 'HEAD', responseType: 'text'}));
  }
  get(urlOrKwArgs: authRequest|string, kwArgs?: authRequest) {
    kwArgs = this._kwArgs(urlOrKwArgs, kwArgs);
    return this.request(mixin(kwArgs, {method: 'GET'}));
  }
  put(urlOrKwArgs: authRequest|string, kwArgs?: authRequest) {
    kwArgs = this._kwArgs(urlOrKwArgs, kwArgs);
    return this.request(mixin(kwArgs, {method: 'PUT'}));
  }
  post(urlOrKwArgs: authRequest|string, kwArgs?: authRequest) {
    kwArgs = this._kwArgs(urlOrKwArgs, kwArgs);
    return this.request(mixin(kwArgs, {method: 'POST'}));
  }
  delete(urlOrKwArgs: authRequest|string, kwArgs?: authRequest) {
    kwArgs = this._kwArgs(urlOrKwArgs, kwArgs);
    return this.request(mixin(kwArgs, {method: 'DELETE'}));
  }

  /* utilities for promise chains TODO baseClass ? */
  isObject(v: any): boolean { return isObject(v); }
  isPutPost(kwArgs: any) {
    return ((kwArgs.method) && (kwArgs.method === 'POST' || kwArgs.method === 'PUT'));
  }
  hasRedirect(res: any) {
    return (this.isObject(res) && typeof res.redirect === 'function');
  }
  copy(o: any = {}, getPointer = '/data', setPointer = '/result', mix = false) {
    if (!this.isObject(o)) {
      let toObj: any;
      try { toObj = JSON.parse(o); } catch(e) {}
      if (!this.isObject(toObj)) {
        return Array.isArray(toObj) ? JSON.parse(JSON.stringify(toObj)) : toObj;
      }
      o = toObj;
    }
    const _value: any = jsonPointer(o, getPointer);
    const target: any = (!mix) ? o : {};
    jsonPointer(target, setPointer, _value);
    return (!mix) ? o : deepMixin(o, target);
  }
  mix(o: any = {}, getPointer = '/data', setPointer = '/result') {
    return this.copy(o, getPointer, setPointer, true);
  }

  forceHTTPS(o: any = {}) {
   /* Heroku terminates SSL connections at the load balancer level,
    * so req.secure will never be true but "x-forwarded-proto" will be "https"
    */
    if (has('host-node') && !(o.req.secure || o.req.headers["x-forwarded-proto"] === "https")) {
      /* REDIRECT HTTP TO HTTPS :
       * Unfortunately a path configured in Apache .htaccess to redirect to node.js
       * is not part of express' url but of the window.location.href, so TODO :
       */
      o.res.set({ Upgrade: 'TLS/1.0, HTTP/1.1', Connection: 'Upgrade' });
      o.res.status('426').send(this.redirectPage());
    }
    const options = (o.options || o.req);
    if (options.url && URL.normalizeUrl(options.url).slice(0,5) !== 'https') {
      (o.options || o.req).url = URL.normalizeUrl(options.url, true, 'https', true);
    }
    return o;
  }
  redirectPage() {
    return ('<html lang="en-US"><head><title>HTTPS REQUIRED</title></head>' +
    '<body style="text-align:center;"><script>window.location.href = ' +
    '"https://" + window.location.href.split("//").slice(1).join("");'+
    '</script></body></html>');
  }
  redirect(o: any, params?: any, rUrl?: string) {
    const _url = rUrl || (o.options || o.req).url;
    const _query = (!!params) ? params : (o.options || o.req).query;
    const myAuthUrl = URL.withParameters(_url, _query);
    if (this.hasRedirect(o.res)) {
      this.debugLog({ neutral: 'Redirecting to ' + myAuthUrl });
      o.res.redirect(302, myAuthUrl);
    } else {
      window.location.href = myAuthUrl;
    }
    return {url: myAuthUrl};
  }
}

export default RequestMixin;

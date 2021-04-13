"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const has_1 = require("@dojo/framework/has/has");
const util_1 = require("@dojo/framework/core/util");
const request_1 = require("./request");
const uriTemplates = require("uri-templates");
const Pointer_1 = require("../JSON/Pointer");
const url_1 = require("../url");
const uuid_1 = require("../uuid");
const base64_1 = require("../String/base64");
const isObjectTypes_1 = require("../lang/isObjectTypes");
const lang_1 = require("../util/lang");
const pwLog = console.log;
class RequestMixin {
    constructor(messages = {}, key, secret) {
        this.messages = messages;
        this.key = key;
        this.secret = secret;
        this.debug = false;
        this._authHeaderKey = 'Authorization';
        this._protocol = 'BasicAuth';
        this._version = '';
        this._type = (has_1.default('host-browser') || !has_1.default('host-node')) ? '2legged' : '3legged';
        this._headerPrefix = 'Basic ';
        this._nonceSize = 32;
        this._options = {
            headers: {}, query: {}, responseType: 'text'
        };
        this.authOptions = {
            method: 'GET', headers: {}, query: {}
        };
        this.responseTypes = {
            text: (res) => {
                let data = this.proxy(res, res.data);
                return { data: data.toString() };
            },
            json: (res) => {
                let data = this.proxy(res, this.responseTypes.text(res).data, 'json');
                return { data: JSON.parse(data) };
            },
            html: (res) => {
                let data = this.proxy(res, this.responseTypes.text(res).data, 'html');
                if (has_1.default('host-node')) {
                    const cheerio = require('cheerio');
                    return { data: (cheerio.load(data, { decodeEntities: false })) };
                }
                return { data: data };
            },
            query: (res) => {
                let data = this.proxy(res, this.responseTypes.text(res).data, 'query');
                return { data: url_1.default.parameters(data).get() };
            }
        };
        for (var k in this.responseTypes) {
            request_1.filterRegistry.register(this.registerType(k), this.responseTypes[k]);
        }
        this.initRequest();
    }
    get protocolStr() {
        return [this._protocol, this._version, this._type].join(' ');
    }
    initRequest() { }
    proxy(res, data, type = 'text') {
        const options = res.requestOptions;
        if (!!(options.set && typeof options.set[type] === 'function')) {
            data = options.set[type](data);
        }
        return data;
    }
    registerType(type) {
        return (res) => {
            const options = res.requestOptions;
            return !!(typeof res.data && options && options.responseType === type);
        };
    }
    _getUUID(str) {
        return uuid_1.default(str);
    }
    _getNonce(lengthOrMin = this._nonceSize, maxLength) {
        return uuid_1.nonce(lengthOrMin, maxLength);
    }
    _escapeHTML(str) {
        var map = {
            '&': '&amp;',
            '<': '&lt;',
            '>': '&gt;',
            '"': '&quot;',
            "'": '&#039;'
        };
        return str.replace(/[&<>"']/g, function (m) { return map[m]; });
    }
    _getTimestamp() {
        return Math.floor((new Date()).getTime() / 1000).toString();
    }
    _fixEncode(str) {
        return str.replace(/\!/g, '%21').replace(/\'/g, '%27')
            .replace(/\(/g, '%28').replace(/\)/g, '%29')
            .replace(/\*/g, '%2A');
    }
    _encode(toEncode) {
        if (typeof toEncode != 'string' || !toEncode.length) {
            return '';
        }
        var result = encodeURIComponent(toEncode);
        return this._fixEncode(result);
    }
    _decode(toDecode) {
        if (typeof toDecode != 'string' || !toDecode.length) {
            return toDecode;
        }
        return decodeURIComponent(toDecode);
    }
    _urlEncode(str) {
        return base64_1.urlEncode(str);
    }
    _urlDecode(str) {
        return base64_1.urlDecode(str);
    }
    msg(_id, el, bundle, fallback = '', doReturn = false) {
        if (!_id) {
            _id = 'unknown';
        }
        var m = (!!(this.messages) && this.messages[_id]);
        if (!m) {
            m = (!!bundle && !!(bundle.messages) && bundle.messages[_id]);
        }
        if (!m) {
            m = _id;
        }
        if (!!el && typeof el === 'object') {
            const rawData = !!(el.dataset) ? el.dataset : el;
            (m.match(/[_]\{([^}]+)\}/gi) || []).map((tplStr) => {
                const pointer = tplStr.slice(2, -1);
                var data = rawData[pointer];
                if (typeof data !== 'string' && tplStr.slice(2, 3) === '/') {
                    data = Pointer_1.default(rawData, pointer);
                }
                m = m.replace(tplStr, (typeof data === 'string') ? data : fallback);
            });
        }
        return (!!doReturn) ? m : this.msg(m, el, bundle, fallback, true);
    }
    errLog(_text, _status = 400, _data = {}) {
        return JSON.stringify({
            type: this.protocolStr, status: _status, text: _text, data: _data
        });
    }
    debugLog(logArr, doPadding = false, inclFn = false) {
        if (!this.debug) {
            return;
        }
        if (!Array.isArray(logArr)) {
            logArr = [logArr];
        }
        console.log(logArr, doPadding, inclFn);
    }
    initDebugLog(secretKeys = [], excludeKeys = []) {
        if (!this.debug) {
            return;
        }
        const o = util_1.mixin({}, this);
        Object.keys(o).forEach((key) => {
            if (key.slice(0, 8) === '_options' || key === 'E') {
                delete o[key];
            }
            if (secretKeys.indexOf(key) > -1) {
                o[key] = pwLog(o[key], 1);
            }
            if (excludeKeys.indexOf(key) > -1) {
                delete o[key];
            }
        });
        this.debugLog([
            { success: [this.protocolStr, 'Module started:'].join(' ') },
            { list: o },
            { neutral: [this.protocolStr, 'is waiting ...'].join(' ') }, { neutral: ' ' }
        ], true);
    }
    requestLog(opts) {
        return Object.keys(opts).reduce((r, k) => {
            if (k != 'url' && k != 'method') {
                r[k] = (typeof opts[k] === 'string' && /secret/i.test(k)) ?
                    pwLog(opts[k], 1) : opts[k];
            }
            return r;
        }, {});
    }
    error(id, statusCode = 412, isPromise = false) {
        return (eRes) => {
            this.debugLog({ warning: eRes.status || '!' });
            this.debugLog([{ error: 'Request Error: ' }, { list: eRes }]);
            return eRes;
        };
    }
    debugError(res) {
        const debugE = { prefix: '', msg: '' };
        if (this.debug) {
            debugE.prefix = !!(this._protocol) ?
                ['[', this._protocol, (this._type || ''), ']'].join(' ') :
                ['[', (this.constructor['name'] || ''), ']'].join(' ');
            debugE.msg = [
                (res.statusCode || res.code || ''),
                (res.statusMessage || '< ' + res.host || '')
            ].join(' ');
        }
        return debugE;
    }
    _resolveRelative(mainUrl, url) {
        return url_1.default.resolveRelative(mainUrl, url);
    }
    _normalizeUrl(url, inclQuery = true, nonHTTPto) {
        return url_1.default.normalizeUrl(url, inclQuery, nonHTTPto);
    }
    _getRequest(url, myOptions) {
        var _url = url_1.default.parse(url, true);
        const myUrl = this._normalizeUrl(_url, false);
        return request_1.default(myUrl, util_1.mixin({ debug: this.debug }, myOptions));
    }
    _getClientOptions(kwArgs = {}) {
        if (!kwArgs.url) {
            kwArgs.url = (!!this['requestUrl'] && this['requestUrl']) ||
                this['authUrl'];
        }
        let parsedUrl = url_1.default.parse(kwArgs.url, false);
        kwArgs = util_1.deepMixin({
            query: parsedUrl.query, auth: parsedUrl.auth,
            headers: { host: parsedUrl.host, 'content-length': 0 }
        }, this._options, kwArgs);
        util_1.mixin(kwArgs, {
            url: url_1.default.normalizeUrl(url_1.default.format(util_1.mixin(parsedUrl, { query: {}, auth: '' })), false)
        });
        const rt = kwArgs.responseType;
        if (typeof rt !== 'string' || Object.keys(this.responseTypes).indexOf(rt) < 0) {
            kwArgs.responseType = /.json$/i.test(kwArgs.url) ? 'json' : 'text';
        }
        if (kwArgs.data) {
            kwArgs.headers['content-length'] = lang_1.byteLength(kwArgs.data);
        }
        if (typeof kwArgs.oauth === 'object') {
            util_1.mixin(kwArgs, kwArgs.oauth);
            for (var key in kwArgs.oauth) {
                if (key === 'meta' || key === 'authUrl' || key.slice(0, 6) === 'oauth_') {
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
    getClientOptions(kwArgs = {}) { return kwArgs; }
    getAuthHeader(...a) {
        if (this._protocol !== 'BasicAuth') {
            return null;
        }
        const auth = { key: '', secret: undefined };
        if (this.isObject(a[0])) {
            if (!!a[0].auth && typeof a[0].auth === 'string') {
                const authArr = a[0].auth.split(':');
                auth.key = authArr[0] || this.key;
                if (authArr.length > 1) {
                    auth.secret = authArr[1] || this.secret;
                }
            }
            else {
                auth.key = (this.isObject(a[0]) && typeof a[0].key === 'string' && a[0].key) || this.key;
                const s = (this.isObject(a[0]) && typeof a[0].secret === 'string' && a[0].secret) || this.secret;
                if (!!s) {
                    auth.secret = s;
                }
            }
        }
        const authStr = auth.key + ((!!auth.secret) ? (':' + auth.secret) : '');
        this.debugLog({ neutral: 'Basic Authentication for ' + auth.key });
        return [this._headerPrefix, base64_1.urlEncode(authStr)].join(' ');
    }
    reply(res, kwArgs, myOptions, success, err) {
        const status = res.statusCode;
        const headers = (res.nativeResponse) ? res.nativeResponse.headers : {};
        const isOK = (res.statusCode >= 200 && res.statusCode <= 299);
        res.statusMessage = (res.nativeResponse.statusMessage || '');
        let debug = this.debugError(res);
        if (isOK) {
            this.debugLog([
                { neutral: debug.prefix + ' SUCCESS: ' },
                { success: debug.msg + ' < ' + kwArgs.url }
            ]);
            var data = { meta: { status: res.statusCode } };
            if (myOptions.responseType === 'json') {
                data = util_1.deepMixin({}, res.data, data);
            }
            else if (this.isObject(kwArgs.oauth)) {
                data = util_1.mixin(data, url_1.default.parameters(String(res.data)).get());
            }
            else {
                data = res.data;
            }
            if (this.isObject(kwArgs.oauth)) {
                for (var key in kwArgs.oauth) {
                    if (key === 'meta' || key === 'authUrl' || key.slice(0, 6) === 'oauth_') {
                        delete kwArgs.oauth[key];
                    }
                }
                res.requestOptions.meta.oauth = kwArgs.oauth;
            }
            res.data = data;
            return (!!success) ? success(res) : res;
        }
        else {
            this.debugLog([
                { neutral: debug.prefix + ' FAILED:' + res.statusCode },
                { error: headers.location + ' : ' + debug.msg }
            ]);
            if (typeof res.url === 'string') {
                util_1.mixin(res, url_1.default.parse((res.requestOptions['url'] || res.url), true));
            }
            res.error = new Error(debug.msg);
            return ((typeof err === 'function') ? err(res) : res);
        }
    }
    request(kwArgs, success, reqError) {
        if (!kwArgs.url && !!kwArgs['options']) {
            kwArgs = kwArgs['options'];
        }
        kwArgs = this._getClientOptions(kwArgs);
        const myOptions = {
            url: kwArgs.url,
            responseType: kwArgs.responseType,
            method: kwArgs.method,
            query: kwArgs.query,
            headers: kwArgs.headers,
            timeout: kwArgs.timeout || 6000,
            maxRedirects: kwArgs.maxRedirects || 5,
            meta: util_1.mixin({ url: kwArgs.url }, (kwArgs.meta || {})),
            set: kwArgs.set || false
        };
        if (this.isPutPost(kwArgs)) {
            myOptions.data = kwArgs.data;
        }
        if (this.debug) {
            this.debugLog([
                { out: [kwArgs.method, kwArgs.url] }, { list: this.requestLog(myOptions) }
            ]);
        }
        const myError = (e) => {
            const res = {
                meta: {},
                statusCode: 0,
                statusMessage: '',
                error: { code: 0, message: '' }
            };
            let debug = this.debugError(res);
            this.debugLog([
                { neutral: debug.prefix + ' FAILED:' },
                { error: res.error.code + ' – ' + debug.msg }
            ]);
        };
        const myRequest = this._getRequest(kwArgs.url, myOptions);
        return myRequest.then((res) => {
            if (res.data instanceof Promise) {
                return res.data.then((d) => {
                    res.data = d;
                    return this.reply(res, kwArgs, myOptions, success, reqError);
                });
            }
            else {
                return this.reply(res, kwArgs, myOptions, success, reqError);
            }
        });
    }
    _kwArgs(urlOrKwArgs, kwArgs = {}) {
        const o = (typeof urlOrKwArgs === 'string') ?
            util_1.mixin({ url: urlOrKwArgs }, kwArgs) : urlOrKwArgs;
        if (!!o.url) {
            o.url = uriTemplates(o.url).fillFromObject(this);
        }
        return o;
    }
    urlToObj(obj, name) {
        const _d = ((this.isObject(obj[name + 'Options']) && obj[name + 'Options']) || {});
        return this._kwArgs((obj[name + 'Url'] || obj), _d);
    }
    options(o = {}, ...optionObjects) {
        const defaultO = (typeof o.id === 'string') ? this.urlToObj(this, o.id) : {};
        const optionsO = (typeof o.id === 'string') ? this.urlToObj(o.options, o.id) : {};
        o.options = util_1.deepMixin({}, this._options, defaultO, optionsO);
        optionObjects.forEach((oO) => {
            if (!this.isObject(oO)) {
                oO = {};
            }
            util_1.deepMixin(o.options, oO);
        });
        if (!!o.options.set && typeof o.options.set.options === 'function') {
            util_1.mixin(o.options, o.options.set.options(this));
        }
        return Promise.resolve(o);
    }
    head(urlOrKwArgs, kwArgs) {
        kwArgs = this._kwArgs(urlOrKwArgs, kwArgs);
        return this.request(util_1.mixin(kwArgs, { method: 'HEAD', responseType: 'text' }));
    }
    get(urlOrKwArgs, kwArgs) {
        kwArgs = this._kwArgs(urlOrKwArgs, kwArgs);
        return this.request(util_1.mixin(kwArgs, { method: 'GET' }));
    }
    put(urlOrKwArgs, kwArgs) {
        kwArgs = this._kwArgs(urlOrKwArgs, kwArgs);
        return this.request(util_1.mixin(kwArgs, { method: 'PUT' }));
    }
    post(urlOrKwArgs, kwArgs) {
        kwArgs = this._kwArgs(urlOrKwArgs, kwArgs);
        return this.request(util_1.mixin(kwArgs, { method: 'POST' }));
    }
    delete(urlOrKwArgs, kwArgs) {
        kwArgs = this._kwArgs(urlOrKwArgs, kwArgs);
        return this.request(util_1.mixin(kwArgs, { method: 'DELETE' }));
    }
    isObject(v) { return isObjectTypes_1.isObject(v); }
    isPutPost(kwArgs) {
        return ((kwArgs.method) && (kwArgs.method === 'POST' || kwArgs.method === 'PUT'));
    }
    hasRedirect(res) {
        return (this.isObject(res) && typeof res.redirect === 'function');
    }
    copy(o = {}, getPointer = '/data', setPointer = '/result', mix = false) {
        if (!this.isObject(o)) {
            let toObj;
            try {
                toObj = JSON.parse(o);
            }
            catch (e) { }
            if (!this.isObject(toObj)) {
                return Array.isArray(toObj) ? JSON.parse(JSON.stringify(toObj)) : toObj;
            }
            o = toObj;
        }
        const _value = Pointer_1.default(o, getPointer);
        const target = (!mix) ? o : {};
        Pointer_1.default(target, setPointer, _value);
        return (!mix) ? o : util_1.deepMixin(o, target);
    }
    mix(o = {}, getPointer = '/data', setPointer = '/result') {
        return this.copy(o, getPointer, setPointer, true);
    }
    forceHTTPS(o = {}) {
        if (has_1.default('host-node') && !(o.req.secure || o.req.headers["x-forwarded-proto"] === "https")) {
            o.res.set({ Upgrade: 'TLS/1.0, HTTP/1.1', Connection: 'Upgrade' });
            o.res.status('426').send(this.redirectPage());
        }
        const options = (o.options || o.req);
        if (options.url && url_1.default.normalizeUrl(options.url).slice(0, 5) !== 'https') {
            (o.options || o.req).url = url_1.default.normalizeUrl(options.url, true, 'https', true);
        }
        return o;
    }
    redirectPage() {
        return ('<html lang="en-US"><head><title>HTTPS REQUIRED</title></head>' +
            '<body style="text-align:center;"><script>window.location.href = ' +
            '"https://" + window.location.href.split("//").slice(1).join("");' +
            '</script></body></html>');
    }
    redirect(o, params, rUrl) {
        const _url = rUrl || (o.options || o.req).url;
        const _query = (!!params) ? params : (o.options || o.req).query;
        const myAuthUrl = url_1.default.withParameters(_url, _query);
        if (this.hasRedirect(o.res)) {
            this.debugLog({ neutral: 'Redirecting to ' + myAuthUrl });
            o.res.redirect(302, myAuthUrl);
        }
        else {
            window.location.href = myAuthUrl;
        }
        return { url: myAuthUrl };
    }
}
exports.default = RequestMixin;
//# sourceMappingURL=index.js.map
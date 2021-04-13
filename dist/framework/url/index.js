"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const has_1 = require("@dojo/framework/core/has");
const isIdentical_1 = require("../isIdentical");
const UrlSearchParams_1 = require("./UrlSearchParams");
const _url = (has_1.default('host-node')) ? require('url') : window.URL;
class Parameters extends UrlSearchParams_1.UrlSearchParams {
    constructor(input) {
        super(input);
    }
    get(key = '') {
        if (!this.has(key)) {
            return Object.keys(this._list).reduce((_o, key) => {
                if (key !== '') {
                    _o[key] = this._list[key][0];
                }
                return _o;
            }, {});
        }
        return this._list[key][0];
    }
}
exports.Parameters = Parameters;
class url {
    static format(urlAny) {
        if (has_1.default('host-node')) {
            return _url.format(urlAny);
        }
        ;
        return (new _url(urlAny)).toString();
    }
    static parse(urlStr, parseQuery = false, slashesDenoteHost = false) {
        urlStr = urlStr.trim();
        const proto = url.protocolPattern.exec(urlStr);
        const defProto = url.defaultProtocolPattern.exec(urlStr);
        if (!proto || defProto) {
            urlStr = `https:${defProto ? '' : '//'}${urlStr}`;
        }
        if (has_1.default('host-node')) {
            const parsed = _url.parse(urlStr, parseQuery, slashesDenoteHost);
            parsed.originalUrl = urlStr;
            return (!!(parseQuery) && !(parsed.host) && !Object.keys(parsed.query).length) ? Object.assign(Object.assign({}, parsed), { query: url.parameters(urlStr).get() }) : parsed;
        }
        var U;
        try {
            U = new _url(urlStr);
        }
        catch (e) {
            return {};
        }
        U.originalUrl = urlStr;
        U.path = [U.pathname || '', U.search || ''].join('');
        U.auth = (typeof U.username === 'string' && U.username.length) ?
            [U.username, U.password] : '';
        if (parseQuery) {
            U.query = (typeof U.searchParams === 'object') ?
                U.searchParams : new Parameters(U.search || '').get();
        }
        else {
            U.query = U.search;
        }
        if (proto) {
            var lowerProto = proto[0].toLowerCase();
            U.protocol = lowerProto;
            urlStr = urlStr.substr(proto[0].length);
        }
        if (slashesDenoteHost || proto || urlStr.match(/^\/\/[^@\/]+@[^@\/]+/)) {
            var slashes = (urlStr.substr(0, 2) === '//');
            var lowerProto = proto[0].toLowerCase();
            if (slashes && !(lowerProto && url.hostlessProtocol[lowerProto])) {
                urlStr = urlStr.substr(2);
                U.slashes = true;
            }
        }
        return U;
    }
    static parameters(input) {
        const U = (typeof input === 'string') ? url.parse(input) : input;
        if (!U.host && !U.search) {
            U.search = U.pathname;
        }
        return (new Parameters((!U.search) ? '' : U.search.replace('?', '')));
    }
    static withParameters(baseUrl, queryObj) {
        const t = (typeof baseUrl);
        if (t !== 'string' && t !== 'object') {
            return '';
        }
        let parsed = (t === 'string') ? url.parse(baseUrl, true, false) : baseUrl;
        parsed.query = Object.assign(Object.assign({}, (parsed.query || {})), (queryObj || {}));
        return url.format(parsed);
    }
    static concat(baseUrl, path) {
        return ((baseUrl.slice(-1) === '/') ? baseUrl.slice(0, -1) : baseUrl) +
            ((path.slice(0, 1) !== '/') ? ('/' + path) : path);
    }
    static resolve(from, to) {
        if (has_1.default('host-node')) {
            return _url.resolve(from, to);
        }
        ;
    }
    static resolveRelative(mainUrl, u) {
        const _u = url.parse(u);
        if (!(_u.protocol) && !(_u.host) && (!!(_u.path) || _u.href.charAt(0) === '#')) {
            return url.resolve(mainUrl, u);
        }
        return u;
    }
    static normalizeUrl(u, inclQuery = true, defaultProtocol = 'https:', forceProtocol = false) {
        u = (typeof u === 'string') ? url.parse(u, true) : u;
        const port = (!!u.port && ((u.protocol === 'http:' && u.port != '80') ||
            (u.protocol === 'https:' && u.port != '443'))) ?
            [':', u.port].join('') : '';
        if (!(u.protocol) && !(u.host) && !!(u.pathname)) {
            const h = JSON.parse(JSON.stringify(u.pathname));
            if (!!(u.query)) {
                delete u.query[h];
            }
            u = Object.assign(Object.assign({}, u), { host: h, hostname: h, path: '/', pathname: '/' });
        }
        if (!!forceProtocol) {
            u = Object.assign(Object.assign({}, u), { protocol: defaultProtocol });
        }
        else if (typeof defaultProtocol === 'string' && !u.protocol) {
            u = Object.assign(Object.assign({}, u), { protocol: (defaultProtocol + ':') });
        }
        if (!inclQuery) {
            u.search = '';
        }
        if (!u.pathname || u.pathname === '') {
            u.pathname = '/';
        }
        if (!u.hostname) {
            return u.pathname;
        }
        return url.format(u);
    }
    static hasIdentical(urls, myUrl) {
        if (typeof urls === 'string') {
            urls = [urls];
        }
        if (Array.isArray(urls) && urls.length && typeof myUrl === 'string' && myUrl.trim().length) {
            var nUrl = url.normalizeUrl(myUrl);
            var i, u;
            for (i = 0; i < urls.length; i++) {
                u = url.resolveRelative(myUrl, urls[i]);
                u = url.normalizeUrl(u);
                if (typeof u === 'string' && u.trim().length && isIdentical_1.isIdentical(u, nUrl)) {
                    return true;
                }
            }
        }
        return false;
    }
}
url.protocolPattern = /^([a-z0-9.+-]+:)/i;
url.defaultProtocolPattern = /^(\/\/)/i;
url.hostlessProtocol = {
    'javascript': true,
    'javascript:': true
};
url.slashedProtocol = {
    'http': true,
    'https': true,
    'ftp': true,
    'gopher': true,
    'file': true
};
exports.default = url;
//# sourceMappingURL=index.js.map
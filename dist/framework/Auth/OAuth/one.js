"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const util_1 = require("@dojo/framework/core/util");
const url_1 = require("../../url");
const crypto_1 = require("../../crypto");
const __1 = require("..");
var SIGNATURES;
(function (SIGNATURES) {
    SIGNATURES[SIGNATURES["HMAC-SHA1"] = 0] = "HMAC-SHA1";
    SIGNATURES[SIGNATURES["RSA-SHA1"] = 1] = "RSA-SHA1";
    SIGNATURES[SIGNATURES["PLAINTEXT"] = 2] = "PLAINTEXT";
})(SIGNATURES || (SIGNATURES = {}));
;
class OAuthOneClient extends __1.default {
    constructor(authUrl, accessUrl, requestUrl, callbackUrl, consumerKey, consumerSecret, _signMethod = 'HMAC-SHA1', _nonceSize = 32, verify = ((o) => { return o; })) {
        super();
        this.authUrl = authUrl;
        this.accessUrl = accessUrl;
        this.requestUrl = requestUrl;
        this.callbackUrl = callbackUrl;
        this.consumerKey = consumerKey;
        this.consumerSecret = consumerSecret;
        this._signMethod = _signMethod;
        this._nonceSize = _nonceSize;
        this.verify = verify;
        this._protocol = 'OAuth';
        this._version = '1.0';
        this._headerPrefix = 'OAuth';
        this.requestOptions = { responseType: 'query' };
        this.accessOptions = { responseType: 'query' };
        this._E = {
            STATELESS: 'Stateless OAuth1 (e.g. only in the Browser) is not supported. ' +
                'Use OAuth2 !',
            SIGN: 'Unsupported signature method:',
            PROP: 'Missing property:'
        };
        this.isObject(authUrl) && util_1.mixin(this, authUrl);
        if (!SIGNATURES.hasOwnProperty(this._signMethod)) {
            throw new TypeError(this.errLog(`${this._E.SIGN} ${this._signMethod}`));
        }
        else if (this._signMethod === 'RSA-SHA1') {
            this._privateKey = this.consumerSecret;
        }
        this.consumerSecret = this._encode(this.consumerSecret);
        if (!this.callbackUrl) {
            this._type = '1legged';
        }
        this.initDebugLog(['consumerSecret'], ['setup', 'svg']);
        this.initOAuthOne();
    }
    get OAuthParams() {
        return {
            oauth_timestamp: this._getTimestamp(),
            oauth_nonce: this._getNonce(this._nonceSize),
            oauth_version: this._version,
            oauth_signature_method: this._signMethod,
            oauth_consumer_key: this.consumerKey
        };
    }
    initOAuthOne() { }
    _sortParams(o) {
        const ordered = {};
        Object.keys(o).sort().forEach((key) => { ordered[key] = o[key]; });
        return ordered;
    }
    _normalizeParams(o) {
        const argStrings = [];
        const orderedKeys = Object.keys(o).map((k) => {
            return this._encode(k);
        }).sort().forEach((k) => {
            argStrings.push([k, '=', this._encode(o[k])].join(''));
        });
        return argStrings.join('&');
    }
    _getSignature(kwArgs, oauthParams) {
        const _url = this._encode(this._normalizeUrl(kwArgs.url, false));
        const _params = this._encode(this._normalizeParams(oauthParams));
        const _secret = this._encode(kwArgs.oauth_token_secret);
        const _base = [kwArgs.method.toUpperCase(), _url, _params].join('&');
        if (this._signMethod === 'RSA-SHA1') {
            let key = this._privateKey || '';
            return crypto_1.default.sign(_base, key, 'RSA-SHA1');
        }
        else {
            let key = [this.consumerSecret, _secret].join('&');
            return (this._signMethod === 'PLAINTEXT') ? key : crypto_1.default.hmac(_base, key, 'base64', 'sha1');
        }
    }
    _getOAuthParams(kwArgs) {
        const newParams = this.OAuthParams;
        ['oauth_callback', 'oauth_token', 'oauth_verifier'].forEach((k) => {
            if (typeof kwArgs[k] === 'string') {
                newParams[k] = kwArgs[k];
                delete kwArgs[k];
            }
        });
        util_1.mixin(newParams, (url_1.default.parse(kwArgs.url, true).query || {}));
        newParams.oauth_signature = this._getSignature(kwArgs, newParams);
        return this._sortParams(newParams);
    }
    getAuthHeader(kwArgs) {
        const oauthParams = this._getOAuthParams(util_1.mixin({}, kwArgs));
        const header = Object.keys(oauthParams).map((key) => {
            return (key.slice(0, 6) === 'oauth_') ?
                [this._encode(key), '="', this._encode(oauthParams[key]), '"'].join('') : '';
        }).join(',');
        return [this._headerPrefix, header].join(' ');
    }
    success(o = {}, req = {}, res = {}, finish = false) {
        util_1.mixin(o, { req: req, res: res, options: { url: this.authUrl }, finish: finish });
        const key = 'oauth_token';
        const tokenStr = finish ? 'access token' : 'request token';
        const token = (this.isObject(o.data) && o.data[key]);
        if (typeof token !== 'string') {
            const eMsg = `${this._E.PROP} "${key}" in ${tokenStr} result!`;
            return Promise.reject(this.error(eMsg, 412));
        }
        if (this.debug) {
            const uStr = finish ? '!' : ('& authUrl: ' + this.authUrl);
            this.debugLog({ success: `Valid ${tokenStr} ${uStr} ` });
            (!finish && this.debugLog({ neutral: 'Redirecting to authUrl ...' }));
        }
        return (!finish) ? this.redirect(o, { oauth_token: token }) : this.state(o);
    }
    auth(req = {}, res = {}, kwArgs = {}) {
        if (!this.isStateful(req)) {
            return Promise.reject(this.errLog(this._E.STATELESS));
        }
        this.debugLog({ neutral: 'Getting a request token ...' });
        return this.options({ id: 'request', req: req, res: res, options: kwArgs })
            .then(o => this.state(o, '/oauth_callback'))
            .then(o => this.request(o))
            .then(o => this.success(o, req, res), this.authError());
    }
    access(req = { url: window.location.href }, res = {}, kwArgs = {}) {
        this.debugLog({ neutral: 'Getting an access token ...' });
        const accessArgs = (req && req.url && url_1.default.parse(req.url, true).query) || {};
        return this.options({ id: 'access', req: req, res: res, options: kwArgs }, accessArgs)
            .then(o => this.state(o))
            .then(o => this.request(o))
            .then(o => this.success(o, req, res, true), this.authError('eAccess'));
    }
}
exports.default = OAuthOneClient;
//# sourceMappingURL=one.js.map
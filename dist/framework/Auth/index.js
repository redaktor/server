"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const has_1 = require("@dojo/framework/has/has");
const util_1 = require("@dojo/framework/core/util");
const Pointer_1 = require("../JSON/Pointer");
const webtoken_1 = require("../JSON/webtoken");
const uuid_1 = require("../uuid");
const crypto_1 = require("../crypto");
const url_1 = require("../url");
const i18n_1 = require("../util/i18n");
const Request_1 = require("../Request");
const common_1 = require("./nls/common");
class Auth extends Request_1.default {
    constructor(authUrl, callbackUrl, kid, key, secret, scope, scopeSeparator = ' ', _nonceSize = 32) {
        super();
        this.authUrl = authUrl;
        this.callbackUrl = callbackUrl;
        this.kid = kid;
        this.key = key;
        this.secret = secret;
        this.scope = scope;
        this.scopeSeparator = scopeSeparator;
        this._nonceSize = _nonceSize;
        this.debug = false;
        this._protocol = 'BasicAuth';
        this._version = '';
        this._headerPrefix = 'Basic';
        this.validity = (5 * 60);
        this._sessionData = { date: (new Date()), pub: '' };
        this._options = {
            followRedirects: true,
            method: 'POST',
            headers: {
                Accept: '*/*',
                Connection: 'close',
                'Content-Type': 'application/x-www-form-urlencoded;charset=UTF-8',
                'User-Agent': 'redaktor.auth'
            },
            query: {},
            cacheBust: true
        };
        this.isObject(authUrl) && util_1.mixin(this, authUrl);
        this.initAuth();
        if (!this.kid) {
            this.kid = this._getUUID(`${this['authUrl'] || ''}#${Date.now()}`);
        }
    }
    initAuth() { }
    i18nOptions(o = { req: {}, nls: common_1.default }) {
        return i18n_1.getCachedI18n(o.req, o.nls).then((mO) => {
            return this.options(util_1.mixin(o, mO));
        });
    }
    success(requestRes) {
        return requestRes.data || {};
    }
    resJSON(data, res, returnFn) {
        if (!!res) {
            res.status(200).json(data);
        }
        return !!(returnFn) ? returnFn(data) : data;
    }
    errJSON(errStr, res, status = 400) {
        this.resJSON(this.error('verifyInsecure', 400), res);
        return false;
    }
    _reqError(e, id) {
        if (!(id)) {
            id = !!(e.meta.id) ? e.meta.id : 'me';
        }
        if (!(e.statusMessage)) {
            e.statusMessage = this.msg() + ': ' + id;
        }
        this.debugLog({ error: e });
        return e;
    }
    error(id, statusCode = 412, isPromise = false) {
        if (id === 'me') {
            statusCode = -1;
        }
        const msg = this.msg(id);
        const e = {
            meta: { id: id }, statusCode: statusCode, statusMessage: msg,
            error: { code: statusCode, message: msg, id: id }
        };
        if (!!isPromise) {
            return (eRes) => {
                e.error = eRes;
                this.debugLog({ warning: statusCode || '!' });
                this.debugLog([{ error: msg }, { list: e }]);
                return e;
            };
        }
        this.debugLog({ error: msg });
        return e;
    }
    authError(id = 'eRequest', statusCode = 412) {
        return this.error(id, statusCode, true);
    }
    expires(validitySec) {
        return Math.floor(Date.now() + (((!!validitySec && validitySec) || this.validity) * 1000));
    }
    sessionData(req = {}, kwArgs = {}) {
        const state = (!!req.requestOptions && req.requestOptions.state) ||
            this._getNonce(this._nonceSize);
        return util_1.mixin({}, this._sessionData, { state: state, client_state: state }, kwArgs);
    }
    sessionID() {
        return uuid_1.default(this.accessUrl || this.authUrl || (this.protocolStr + uuid_1.default(this.callbackUrl || ' ')));
    }
    meID(req = {}) {
        return [((!!req && req.me) || (!!req && !!req.query && req.query.me) ||
                (!!req && !!req.body && req.body.me) || '/'),
            '#',
            (req.headers['x-forwarded-for'].replace(/ /g, '') || req.connection.remoteAddress)].join('');
    }
    meIP(meID) {
        const meIDarr = (typeof meID !== 'string' ? [] : meID.split('#'));
        return ((meIDarr.length === 2) && meIDarr[1]);
    }
    hasSession(req) {
        return (!!req.session && !!req.session.redaktor &&
            !!(req.session.redaktor[this.sessionID()]));
    }
    setSession(req, content) {
        const sId = this.sessionID();
        if (!req.session) {
            console.log([this._protocol, this._type, 'needs express-session!'].join(' '));
            this.debugLog({ error: 'See https://www.npmjs.com/package/express-session !' });
            return false;
        }
        if (!req.session.redaktor) {
            req.session.redaktor = {};
        }
        if (!req.session.redaktor[sId]) {
            req.session.redaktor[sId] = {};
        }
        req.session.redaktor[sId] = content;
        return req.session.redaktor[sId];
    }
    getSession(req) {
        const sId = this.sessionID();
        if (!req.session.redaktor || !req.session.redaktor[sId]) {
            return void 0;
        }
        return req.session.redaktor[sId];
    }
    session(req, content) {
        let s = this.getSession(req);
        if (!s) {
            s = this.setSession(req, (content || this.sessionData(req)));
        }
        return (this.isObject(content)) ? util_1.deepMixin(s, content) : s;
    }
    setToken(req, content = {}, pw) {
        if (!pw) {
            pw = this.sessionOrCookie(req).tokenSecret;
        }
        const payload = util_1.mixin({
            iss: this.protocolStr,
            exp: this.expires(),
            jti: this._getUUID()
        }, content);
        return webtoken_1.default.encode(payload, pw || '');
    }
    getTokenStr(req, key = 'state') {
        return (!!(req.query) && req.query[key])
            || (!!(req.body) && req.body[key])
            || (!!(req.data) && req.data[key]);
    }
    getToken(req, pw, key = 'state') {
        const s = this.sessionOrCookie(req);
        if (!pw) {
            pw = s.tokenSecret;
        }
        if (!pw || !s.state) {
            return void 0;
        }
        return webtoken_1.default.decode(this.getTokenStr(req, key), pw);
    }
    cbUrl(o = {}, ks = ['redirect_uri', 'callbackUrl']) {
        return (o.query && o.query[ks[0]]) || o[ks[1]] || this[ks[1]] || '';
    }
    getCookie() {
        const sId = this.sessionID();
        var cRegex = new RegExp('(?:(?:^|.*;\\s*)' + sId + '\\s*\\=\\s*([^;]*).*$)|^.*$');
        return JSON.parse(document.cookie.replace(cRegex, '$1'));
    }
    setCookie(content = {}) {
        const sId = this.sessionID();
        document.cookie = [sId, JSON.stringify(content)].join('=');
        return content;
    }
    isStateful(req = {}) {
        return !has_1.default('host-browser');
    }
    sessionOrCookie(req = {}, content) {
        if (this.isStateful(req)) {
            return (!!req.session && this.session(req, content));
        }
        let c = this.getCookie();
        if (!c) {
            return this.setCookie(content || this.sessionData(req));
        }
        else {
            return (this.isObject(content)) ? this.setCookie(util_1.mixin(c, content)) : c;
        }
    }
    oneTimePass(o = {}, lengthOrPointer) {
        if (typeof lengthOrPointer === 'string') {
            return this.verifyOneTimePass(o, lengthOrPointer);
        }
        if (typeof o.options.code !== 'string') {
            const l = (typeof lengthOrPointer === 'number' && lengthOrPointer > 1 && lengthOrPointer);
            o.options.code = this._getNonce(l || 12);
        }
        this.sessionOrCookie(o.req, { oneTimeSecret: uuid_1.default(o.options.code + this.kid) });
        return o;
    }
    verifyOneTimePass(o = {}, pointer, code) {
        const pass = (!code && typeof pointer === 'string') ?
            Pointer_1.default(o, pointer) :
            (code || o.req.code || o.req.body.code);
        const validation = {
            valid: (this.sessionOrCookie(o.req).oneTimeSecret === uuid_1.default(pass + this.kid))
        };
        this.sessionOrCookie(o.req, { oneTimeSecret: '' });
        if (validation.valid !== true) {
            return Promise.reject(validation);
        }
        return util_1.mixin(o, { data: { code: uuid_1.default() } });
    }
    rfpToken(o = {}) {
        const meId = this.meID(o.req);
        const rfp = JSON.stringify({ me: meId, id: this._getNonce(32) });
        const tokenSecret = this._getNonce(64);
        this.sessionOrCookie(o.req, {
            rfp: (!this.isStateful(o.req) ? uuid_1.default(rfp) : rfp),
            tokenSecret: tokenSecret
        });
        return {
            kid: this.kid,
            exp: this.expires(),
            rfp: rfp,
            as: this.cbUrl(o.options)
        };
    }
    rfpTokenInvalidate(req = {}, token = {}) {
        this.sessionOrCookie(req, { rfp: false, accessed: false, tokenSecret: false });
        if (!!token.rfp) {
            delete token.rfp;
        }
        return token;
    }
    stateHashObj(o, tokenLength = 256, hashObj = {}) {
        const ks = { c_hash: 'code', at_hash: 'access_token', ot_hash: 'oauth_token' };
        let keys = [];
        let k;
        for (k in ks) {
            if (!!o.data[ks[k]]) {
                keys = [k, ks[k]];
                break;
            }
        }
        if (!keys) {
            return void 0;
        }
        const tokenStr = this.getTokenStr(o.req);
        const hashLength = (!tokenStr) ? tokenLength : webtoken_1.default.algLength(tokenStr);
        const hash = crypto_1.default.hash(o.data[keys[1]], ('sha' + hashLength), 'base64');
        hashObj[keys[0]] = this._base64UrlEncode(hash.slice(0, (hash.length / 2)));
        return hashObj;
    }
    stateError(req, messageId = 'unknown', statusCode = 403) {
        this.rfpTokenInvalidate(req);
        return this.error(messageId, statusCode);
    }
    state(o = {}, cbPointer, cbUrl = this.callbackUrl) {
        return new Promise((resolve, reject) => {
            const kwArgs = util_1.mixin((o.options || {}), (o.req.body || {}));
            let s = this.sessionOrCookie(o.req);
            if (!s) {
                return reject(this.error('eSession', 500));
            }
            let token;
            const codeResult = (!!(kwArgs.data) && kwArgs.data.code) || (!!(kwArgs.query) && kwArgs.query.code);
            if (!(o.finish) && !(kwArgs.oauth_token) && !(codeResult)) {
                const scope = (kwArgs.scope || this.scope);
                if ((typeof scope === 'string' || Array.isArray(scope)) && scope.length) {
                    kwArgs.query.scope = Array.isArray(scope) ? scope.join(this.scopeSeparator) : scope;
                }
                ;
                token = this.rfpToken(o);
                this.debugLog({ neutral: 'initial state, generated rfp token' });
            }
            else if (!s.tokenSecret) {
                this.rfpTokenInvalidate(o.req);
                return reject(this.error('eSessionSec', 500));
            }
            else {
                token = this.getToken(o.req);
                if (!(token.iss) || token.iss !== this.protocolStr) {
                    console.log('ERROR state 1');
                    return reject(this.stateError(o.req, ''));
                }
                const checkRFP = (!this.isStateful(o.req)) ? uuid_1.default(token.rfp) : token.rfp;
                if (!s.rfp || checkRFP !== s.rfp || token.as !== this.cbUrl(kwArgs)) {
                    console.log('ERROR state 2');
                    return reject(this.stateError(o.req, ''));
                }
                const tokenMe = JSON.parse(token.rfp).me;
                const subMe = this.meID(o.req);
                if (this.meIP(tokenMe) !== this.meIP(subMe)) {
                    console.log('ERROR state 3', this.meIP(tokenMe), this.meIP(subMe));
                    return reject(this.stateError(o.req, ''));
                }
                if (!(s.accessed) && !(o.finish)) {
                    this.debugLog({ success: ['state token is valid,',
                            Math.floor((token.exp - Date.now()) / 1000), 'seconds were left ...'].join(' ') });
                    this.sessionOrCookie(o.req, { accessed: Date.now(), exp: this.expires(30) });
                }
                else {
                    this.debugLog({ success: ['final state token is valid,', subMe, ':',
                            Math.floor((token.exp - Date.now()) / 1000), 'seconds were left ...'].join(' ') });
                    const hashObj = this.stateHashObj(o);
                    if (!hashObj) {
                        console.log('ERROR state 4');
                        return reject(this.stateError(o.req, '', 412));
                    }
                    util_1.mixin(token, { exp: this.expires(), sub: subMe }, hashObj);
                    token = this.rfpTokenInvalidate(o.req, token);
                    token.state = s.state;
                    console.log('FINAL TOKEN', token);
                    console.log('FINAL RES', o.data);
                    console.log('FINAL S', s);
                    return resolve(token);
                }
            }
            const stateToken = this.setToken(o.req, token);
            const stateOptions = util_1.mixin({ exp: token.exp }, kwArgs);
            if (cbPointer) {
                if (cbPointer.charAt(0) !== '/') {
                    cbPointer = '/' + cbPointer;
                }
                let u = url_1.default.withParameters(cbUrl, { state: stateToken });
                Pointer_1.default(stateOptions, cbPointer, u);
            }
            else {
                Pointer_1.default(stateOptions, '/query/state', stateToken);
            }
            o.options = stateOptions;
            resolve(o);
        });
    }
    hasMe(req, meArr) {
        let s = this.session(req);
        if (!(s) || !(s.urls.me) || !(s.urls.me.length)) {
            return false;
        }
        if (typeof meArr === 'string') {
            meArr = [meArr];
        }
        let urls = Array.isArray(meArr) ? meArr : meArr.data.rels.me;
        let i;
        for (i = 0; i < s.urls.me.length; i++) {
            if (url_1.default.hasIdentical(urls, s.urls.me[i])) {
                return true;
            }
        }
        return false;
    }
    normalizeMe(u) { return this._normalizeUrl(u, true, 'http'); }
    auth(req, res, kwArgs = {}) {
        const options = this.options(kwArgs);
        return this.request(options)
            .then((o) => this.success(o), this.authError());
    }
}
exports.default = Auth;
//# sourceMappingURL=index.js.map
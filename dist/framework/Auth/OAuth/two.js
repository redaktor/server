"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const has_1 = require("@dojo/framework/has/has");
const util_1 = require("@dojo/framework/core/util");
const string_1 = require("../../util/string");
const url_1 = require("../../url");
const __1 = require("..");
class OAuthTwoClient extends __1.default {
    constructor(authUrl, accessUrl, callbackUrl, scope, clientId, clientSecret, _nonceSize = 32, implicit = false, verify = ((o) => { return o; })) {
        super();
        this.authUrl = authUrl;
        this.accessUrl = accessUrl;
        this.callbackUrl = callbackUrl;
        this.scope = scope;
        this.clientId = clientId;
        this.clientSecret = clientSecret;
        this._nonceSize = _nonceSize;
        this.implicit = implicit;
        this.verify = verify;
        this._protocol = 'OAuth';
        this._version = '2';
        this._headerPrefix = 'Bearer';
        this.authOptions = {
            responseType: 'query',
            query: { client_id: '', response_type: 'code' }
        };
        this.accessOptions = {
            responseType: 'json',
            query: { client_id: '', grant_type: 'authorization_code' }
        };
        this.accessTokenName = 'access_token';
        this.isObject(authUrl) && util_1.mixin(this, authUrl);
        this._init();
    }
    get user() { return this.key; }
    set user(user) { this.key = user; }
    get password() { return this.secret; }
    set password(pw) { this.secret = pw; }
    _init() {
        if (this._type === '3legged') {
            this.implicit = false;
        }
        this.clientId = this._encode(this.clientId);
        this.authOptions.query.client_id = this.clientId;
        this.accessOptions.query.client_id = this.clientId;
        if (this.clientSecret && this._type === '3legged') {
            this.clientSecret = this._encode(this.clientSecret);
            this.accessOptions.query.client_secret = this.clientSecret;
        }
        else {
            this.clientSecret = void 0;
        }
        if (this.callbackUrl) {
            this.authOptions.query.redirect_uri = this.callbackUrl;
            this.accessOptions.query.redirect_uri = this.callbackUrl;
        }
        this.initDebugLog(['clientSecret'], ['setup', 'svg']);
        this.initOAuthTwo();
    }
    initOAuthTwo() { }
    type(t) { return (!t) ? this._type : util_1.mixin(this, { _type: t }); }
    getAuthHeader(kwArgs) {
        if (typeof kwArgs === 'object' && kwArgs.hasOwnProperty(this.accessTokenName)) {
            const TOKEN = kwArgs[this.accessTokenName];
            if (typeof kwArgs.token_type === 'string' && kwArgs.token_type.length) {
                this._headerPrefix = string_1.capitalize(kwArgs.token_type);
            }
            return [this._headerPrefix, TOKEN].join(' ');
        }
        else {
            const TOKEN = (typeof kwArgs != 'string') ?
                [this.clientId, this.clientSecret].join(':') : kwArgs;
            return `${this._headerPrefix} ${string_1.base64Encode(TOKEN)}`;
        }
    }
    initOAuth2(o = {}) {
        if (!o.options.user && !this.user && !this.implicit && !!this.callbackUrl) {
            return o;
        }
        let _query = {};
        let _responseType = 'query';
        if ((typeof o.options.user === 'string' || typeof this.user === 'string') &&
            (typeof o.options.password === 'string' || typeof this.password === 'string')) {
            _query = {
                grant_type: 'password',
                user: (typeof o.options.user === 'string' && o.options.user) || this.user,
                password: (typeof o.options.password === 'string' && o.options.password) || this.password
            };
            _responseType = 'json';
        }
        else if (!this.callbackUrl && has_1.default('host-node')) {
            _query = { grant_type: 'client_credentials', client_secret: this.clientSecret };
            _responseType = 'json';
        }
        else if (this.implicit) {
            _query = { grant_type: 'implicit', response_type: 'token' };
            this.clientSecret = void 0;
        }
        util_1.deepMixin(o.options, { query: _query, responseType: _responseType });
        return o;
    }
    rewrite(o = {}) {
        const kw = o.options;
        if (!kw.set) {
            kw.set = {};
        }
        kw.set.json = (data, res = {}) => {
            try {
                res = JSON.parse(data);
            }
            catch (e) {
                res = url_1.default.parse(data, true).query;
            }
            return JSON.stringify(res);
        };
        if (this.isPutPost(kw) && !(kw.data)) {
            kw.data = this._fixEncode(url_1.default.parameters(url_1.default.withParameters('', kw.query)).toString());
            kw.query = {};
        }
        return o;
    }
    react(o) {
        if (!!(o.options.query.grant_type)) {
            this.debugLog({ neutral: 'Directly getting an accessToken ...' });
            return this.request(o);
        }
        this.debugLog({ neutral: `Redirecting to authUrl: ${this.authUrl}` });
        return this.redirect(o);
    }
    success(o = {}, req = {}, res = {}, finish = false) {
        util_1.mixin(o, { req: req, res: res, finish: finish });
        const tokenStr = finish ? 'access token' : 'code';
        if (this.debug) {
            const urlStr = finish ? '!' : ('and authUrl: ' + this.authUrl);
            this.debugLog([{ success: `Valid ${tokenStr} ${urlStr}` }, { list: o.data }]);
        }
        return this.state(o);
    }
    auth(req = {}, res = {}, kwArgs = {}) {
        return this.options({ id: 'auth', req: req, res: res, options: kwArgs })
            .then(o => this.initOAuth2(o))
            .then(o => this.forceHTTPS(o))
            .then(o => this.state(o))
            .then(o => this.react(o))
            .then(o => this.success(o, req, res), this.authError());
    }
    access(req = { url: window.location.href }, res = {}, kwArgs = {}) {
        this.debugLog([{ neutral: 'Getting an access token ...' }]);
        const optionArgs = { id: 'access', req: req, res: res, options: kwArgs };
        const accessArgs = { query: (req.url && url_1.default.parse(req.url, true).query) || {} };
        return this.options(optionArgs, accessArgs)
            .then(o => this.forceHTTPS(o))
            .then(o => this.state(o))
            .then(o => this.rewrite(o))
            .then(o => this.request(o))
            .then(o => this.success(o, req, res, true), this.authError('eAccess'));
    }
}
exports.default = OAuthTwoClient;
//# sourceMappingURL=two.js.map
"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const util_1 = require("@dojo/framework/core/util");
const date_1 = require("@dojo/framework/i18n/date");
const nodemailer = require("nodemailer");
const common_1 = require("./nls/common");
const tpl_1 = require("./tpl");
const __1 = require("../");
class MailAuth extends __1.default {
    constructor(email, name, host, port, user, pass, callbackUrl, clientSecret, apiKey, mailer = {}, xkcdCache = {}, validity = (5 * 60), _nonceSize = 32, renderForm = false, iss = 'IndieAuth', info = '', text = tpl_1.default.text, html = tpl_1.default.html) {
        super();
        this.email = email;
        this.name = name;
        this.host = host;
        this.port = port;
        this.user = user;
        this.pass = pass;
        this.callbackUrl = callbackUrl;
        this.clientSecret = clientSecret;
        this.apiKey = apiKey;
        this.mailer = mailer;
        this.xkcdCache = xkcdCache;
        this.validity = validity;
        this._nonceSize = _nonceSize;
        this.renderForm = renderForm;
        this.iss = iss;
        this.info = info;
        this.text = text;
        this.html = html;
        this.debug = false;
        this._protocol = 'MailAuth';
        this._version = '1.0';
        this._type = 'JWT';
        this.authOptions = {
            responseType: 'query',
            headers: { Sensitivity: 'private', Expires: 0 },
            to: '', from: '', subject: '', text: '', html: ''
        };
        this.isObject(email) && util_1.mixin(this, email);
        if (!this.name) {
            this.name = this.email;
        }
        if (!this.apiKey) {
            this.mailer = nodemailer.createTransport({
                host: this.host, port: this.port, auth: { user: this.user, pass: this.pass }
            });
        }
        else {
        }
        if (!this.clientSecret) {
            this.clientSecret = this._getNonce(this._nonceSize);
        }
        this.initDebugLog(['password', 'secret', 'clientSecret'], ['setup', 'svg', 'text', 'html']);
        this.initMailAuth();
    }
    initMailAuth() { }
    localOptions(o = {}) {
        const TO = ((!!o.req.query && o.req.query.authorize) || o.options.to);
        return util_1.deepMixin({}, this.authOptions, {
            headers: { Expires: this.expires() },
            to: (this._decode(TO).replace(/^((?:\s)*mailto[:])/i, '') || void 0),
            from: { name: (this.name || this.email), address: this.email },
            subject: this.iss,
            text: this.text, html: (this.html || this.text)
        }, o.options);
    }
    mailgunOptions(o = {}) { return {}; }
    options(o = {}) {
        if (o.options.to === '') {
            o.options.to = (!!o.req.query && o.req.query.authorize);
        }
        if (!o.options.to) {
            return Promise.reject(this.errLog(o.messages.missingTo));
        }
        o.options = (!this.apiKey) ? this.localOptions(o) : this.mailgunOptions(o);
        if (typeof o.options.iss !== 'string') {
            o.options.iss = this.iss;
        }
        if (typeof o.options.info !== 'string') {
            o.options.info = this.info;
        }
        return o;
    }
    _xkcd(o, xkcdData) {
        if (!!xkcdData) {
            this.xkcdCache = xkcdData;
        }
        o.options.xkcd = this.xkcdCache;
        return o;
    }
    xkcd(o) {
        if (!o.options || !o.options.xkcd) {
            return this._xkcd(o);
        }
        const c = this.xkcdCache;
        const d = new Date();
        return (`${d.getUTCMonth()}_${d.getUTCDate()}` === `${c.month || ''}_${c.day || ''}`) ?
            this._xkcd(o) :
            this.get('https://xkcd.com/info.0.json').then((xO) => {
                if (typeof xO.data === 'object' && !!(xO.data.img)) {
                    const x = { img: xO.data.img, a: xO.data.alt || '', ext: '.png' };
                    util_1.mixin(x, { base: x.img.slice(0, 0 - x.ext.length), l: x.img.lastIndexOf(x.ext) });
                    xO.data.srcset = (x.l + x.ext.length === x.img.length) ? (`${x.base}_2x.png 2x`) : '';
                    xO.data.$img = (!xO.data.srcset.length) ? (`<img src="${x.img}" title="${x.a}" />`) :
                        (`<img src="${x.img}" srcset="${xO.data.srcset}" title="${x.a}" />`);
                    return this._xkcd(o, xO.data);
                }
                return this._xkcd(o);
            }, (e) => this._xkcd(o));
    }
    challenge(o = {}) {
        const s = this.sessionOrCookie(o.req, { me: o.options.to });
        const token = this.setToken(o.req, { aud: o.options.to, code: o.options.code });
        o.options.code = token;
        return o;
    }
    verify(o = {}) {
        const s = this.sessionOrCookie(o.req);
        const token = this.getToken(o.req, null, 'code');
        if (token.aud !== s.me || !token.code) {
            return Promise.reject('Decrypt Problem with token: ' + token);
        }
        o.req.body.code = token.code;
        return o;
    }
    makeMessage(o) {
        const df = date_1.getDateFormatter({ datetime: 'medium' }, o.locale);
        const expO = {
            expRaw: (o.options.exp.toString() || ''),
            exp: !!(o.options.exp) ? df(new Date(o.options.exp)) : ''
        };
        const _html = (!!(o.options.html) && o.options.html) || o.options.text;
        const _data = util_1.mixin({}, o.options, o.messages || {}, expO);
        util_1.mixin(o.options.query, expO);
        util_1.mixin(o.options, {
            subject: this.msg(_data.messageSubject, _data),
            text: this.msg(o.options.text, _data),
            html: this.msg(_html, _data)
        });
        if (!!this.debug) {
            const debugOptions = util_1.mixin({}, o, { req: {}, res: {} });
            debugOptions.text = (o.text) || ''.slice(0, 128) + ' ...';
            debugOptions.html = (o.html) || ''.slice(0, 128) + ' ...';
            this.debugLog([{ neutral: 'Sending mail ...' }, { list: debugOptions }]);
        }
        return o;
    }
    sendMessage(o) {
        if (!this.apiKey) {
            return this.mailer.sendMail(o.options)
                .then((status) => util_1.mixin(o, { result: status }));
        }
    }
    success(o, cb = this.callbackUrl) {
        const _data = util_1.mixin({}, o.messages || {}, o.options.query || {}, { url: cb });
        console.log('b', _data);
        o.result.form = this.msg(tpl_1.default.form, _data);
        o.result.formLabel = this.msg(_data.messageForm, _data);
        if (!!o.res.send && !!this.renderForm) {
            o.res.send(o.result.form);
        }
        else if (!!o.res.status) {
            o.res.status(200).json(o.result);
        }
        return o.result;
    }
    auth(req = {}, res = {}, kwArgs = {}) {
        if (!!req.body && !!req.body.code) {
            return this.access(req, res);
        }
        if (kwArgs.html === true) {
            delete kwArgs.html;
        }
        return this.i18nOptions({ req: req, res: res, options: kwArgs, nls: common_1.default })
            .then(o => this.xkcd(o))
            .then(o => this.state(o))
            .then(o => this.oneTimePass(o))
            .then(o => this.challenge(o))
            .then(o => this.makeMessage(o))
            .then(o => this.sendMessage(o))
            .then(o => this.success(o));
    }
    access(req, res) {
        return Promise.resolve({ req: req, res: res })
            .then(o => this.verify(o))
            .then(o => this.oneTimePass(o, '/req/body/code'))
            .then(o => this.state(util_1.mixin(o, { finish: true })));
    }
}
exports.default = MailAuth;
//# sourceMappingURL=index.js.map
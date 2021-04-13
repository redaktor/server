"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const dom_1 = require("../../Template/dom");
const Projector_1 = require("@dojo/widget-core/mixins/Projector");
const has_1 = require("@dojo/has");
const Promise_1 = require("@dojo/shim/Promise");
const core_1 = require("@dojo/core");
const fs = require("fs");
const path = require("path");
const App_1 = require("./App");
const __1 = require("..");
const util_1 = require("../../util");
const helper_1 = require("./helper");
const config_1 = require("./config");
const Memory_1 = require("../../dstore/src/Memory");
const string_1 = require("../../util/string");
const Pointer_1 = require("../../JSON/Pointer");
const url_1 = require("../../url");
const CLI_1 = require("./CLI");
const AppMfTest_1 = require("./AppMfTest");
class IndieAuth extends __1.default {
    constructor(kwArgs = {}, kid, directory = '', user = '', salt, verifyTimeout = config_1.verifyTimeout, verifyStore = {}, providers = {}, subDir = '.IndieAuth') {
        super();
        this.kid = kid;
        this.directory = directory;
        this.user = user;
        this.salt = salt;
        this.verifyTimeout = verifyTimeout;
        this.verifyStore = verifyStore;
        this.providers = providers;
        this.subDir = subDir;
        this.debug = false;
        this._protocol = 'IndieAuth';
        this._version = '1.0.0';
        this._type = 'node';
        this._url = null;
        this._hasClients = false;
        this._sessionData = { date: (new Date()), urls: {}, locale: 'en', me: {}, client_id: {}, redirect_uri: '' };
        this._options = {
            followRedirects: true,
            method: 'GET',
            headers: {
                accept: 'text/html',
                connection: 'close',
                'Content-Type': 'text/html;charset=UTF-8',
                'User-Agent': 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_11_0) ' +
                    'AppleWebKit/537.36 (KHTML, like Gecko) Chrome/46.0.2490.86 Safari/537.36'
            },
            responseType: 'mf',
            query: {},
            timeout: 6000
        };
        this.user = path.basename(helper_1.userDir);
        if (this.directory !== '') {
            this.subDir = this.directory;
        }
        this.directory = path.resolve(helper_1.userDir, this.subDir);
        if (!has_1.default('host-node')) {
            throw new Error('This module requires node.js');
        }
        else if (!fs.existsSync(this.directory) ||
            typeof process.env.PW !== 'string' || !(process.env.PW.length)) {
            new CLI_1.CLI({ directory: this.subDir });
            return;
        }
        if (process.env.NODE_ENV === 'development') {
            this.debug = true;
        }
        const secrets = helper_1.checkPW(process.env.PW);
        if ((!secrets || secrets.statusCode !== 200) && core_1.lang.mixin(this, { debug: true })) {
            throw this.error('vWrongPw', 400).statusCode;
        }
        else {
            core_1.lang.mixin(this, secrets);
            this.isObject(kwArgs) && core_1.lang.mixin(this, kwArgs);
            this.verifyStore = new Memory_1.default({ data: [], idProperty: 'url' });
            this.providers = helper_1.getProviders();
            this.initDebugLog([], ['salt', 'providers', 'verifyStore']);
            this.initIndieAuth();
        }
    }
    initIndieAuth() { }
    test(data, res, returnFn) {
        const root = dom_1.default.createElement('div');
        const appNode = root.appendChild(dom_1.default.createElement('my-app'));
        const Projector = Projector_1.ProjectorMixin(AppMfTest_1.default);
        const projector = new Projector();
        projector.setProperties(data);
        projector.append(appNode);
    }
    render(data, res, returnFn) {
        const root = dom_1.default.createElement('div');
        const appNode = root.appendChild(dom_1.default.createElement('my-app'));
        const Projector = Projector_1.ProjectorMixin(App_1.default);
        const projector = new Projector();
        projector.setProperties(data);
        projector.append(appNode);
        res.locals.messages = JSON.stringify(res.locals);
        res.locals.IndieAuth = root.innerHTML;
        res.locals.icon = (!!data.me && !!data.me.data.best && data.me.data.best.icon);
        res.locals.providerCount = data.me.data.best.providerCount;
        if (!!res) {
            res.render('auth.html', res.locals);
        }
        return !!(returnFn) ? returnFn(data) : data;
    }
    meData(me) {
        if (typeof me !== 'object') {
            return me;
        }
        const my = me.data;
        my.best.providers = {};
        if (!!(my['rel-urls'])) {
            const isValid = (k) => {
                return (!!(my.best.providers[k].valid) && !!(my.best.providers[k].key));
            };
            let myEndpoints = helper_1.endpointLinks(my);
            let myProviders = [];
            if (my.rels.hasOwnProperty('me')) {
                myProviders = my.rels.me.map(helper_1.providerLinks(my, this.providers)).sort(helper_1.validFirst);
            }
            my.best.providers = myEndpoints.concat(myProviders).reduce(util_1.arrToObjByKey('url'), {});
            my.best.providerCount = Object.keys(my.best.providers).length;
            my.best.verifyCount = Object.keys(my.best.providers).filter(isValid).length;
        }
        return me;
    }
    getCachedParameters(req, res, urls, cacheBust) {
        let cache = { client_id: false, me: false };
        let rState = ((util_1.exists('query.state', req) && req.query.state));
        let state = (rState || `${urls.me[0]}#${res.locals.csrf}`);
        const session = this.sessionData(req, { urls: urls, state: state });
        if (!this.session(req, session)) {
            return {};
        }
        if (!(cacheBust)) {
            const s = this.session(req);
            if (s.state !== state) {
                s.state = state;
            }
            const _has = (k) => (s.urls[k].indexOf(urls[k][0]) > -1);
            for (var key in cache) {
                if (!_has(key) || !s[key].hasOwnProperty(urls[key][0])) {
                    continue;
                }
                cache[key] = Promise_1.default.resolve(s[key][urls[key][0]]);
            }
            cache.date = s.date;
        }
        return cache;
    }
    getCachedRequestOptions(type, urls, cache) {
        return (cache[type] || this.get({ url: urls[type][0], meta: { id: type } }));
    }
    auth(req, res, cacheBust = false) {
        if (!this._hasClients) {
            this._url = url_1.default.concat((config_1.baseUrl || '/'), req.route.path);
            this.providers = helper_1.getProviders.call(this, process.env.PW);
            this._hasClients = true;
        }
        const isCallback = (!!(req.query.state) || !!(req.body.state)) &&
            (!!(req.query.oauth_token) || !!(req.query.code) || !!(req.body.code));
        if (!isCallback) {
            res.set('IndieAuth', 'authorization_endpoint');
        }
        if (!!(req.query.authorize)) {
            return this.providerAuth(req, res);
        }
        else if (isCallback) {
            console.log('isCallback');
            return this.providerAccess(req, res);
        }
        if (!req || typeof req !== 'object' ||
            !(req.query) || typeof req.query.client_id !== 'string') {
            return this.render(this.error('client_id', 400), res);
        }
        if (typeof req.query.me !== 'string') {
            return this.render(this.error('me'), res);
        }
        if (!!(req.query.verify)) {
            return this.verify(req, res);
        }
        const urls = {
            me: [this.normalizeMe(this._decode(req.query.me))],
            client_id: [this._normalizeUrl(this._decode(req.query.client_id))]
        };
        if (typeof urls.me[0] !== 'string' || urls.me[0] === '/') {
            return this.render(this.error('meInvalid'), res);
        }
        let cache = this.getCachedParameters(req, res, urls, cacheBust);
        util_1.objectPromiseAll({
            client_id: this.getCachedRequestOptions('client_id', urls, cache),
            me: this.getCachedRequestOptions('me', urls, cache)
        }).then((results) => {
            if (!(cache.me)) {
                results.me = this.meData(results.me);
            }
            let s = this.session(req);
            if (s.redirect_uri === '') {
                s.redirect_uri = (req.query.redirect_uri || req.query.client_id);
            }
            const me = results.me;
            const cl = results.client_id;
            const data = {
                date: (!!(cache.date) ? cache.date : (new Date())),
                client_id: { statusCode: cl.statusCode, data: { best: cl.data.best, url: cl.data.url } },
                me: { statusCode: me.statusCode, data: { best: me.data.best, url: me.data.url } }
            };
            const toSession = (type) => {
                return (u) => {
                    (s.urls[type].indexOf(u) < 0 && s.urls[type].push(u));
                    s[type][u] = data[type];
                };
            };
            var key;
            for (key in urls) {
                if (!!cache[key]) {
                    continue;
                }
                (urls[key][0] !== data[key].data.url && urls[key].push(data[key].data.url));
                if (key === 'me' && !!(me.requestOptions.redirects)) {
                    me.requestOptions.redirects.forEach((rU) => {
                        (urls.me.indexOf(rU) === -1 && urls.me.push(rU));
                    });
                }
                urls[key].forEach(toSession(key));
            }
            this.session(req, s);
            const d = util_1.copy(data);
            for (key in d.me.data.best.providers) {
                if (!!d.me.data.best.providers[key].key) {
                    let p = this.providers[d.me.data.best.providers[key].key];
                    core_1.lang.mixin(d.me.data.best.providers[key], { id: p.id, svg: p.svg, title: (!!p.title) ? p.title : '' });
                }
            }
            return this.render(d, res);
        }, (errRes) => {
            let _id = null;
            if (!(errRes.meta.id) || (errRes['code'] && errRes['code'] === 'ENOTFOUND')) {
                const meHost = url_1.default.parse(urls.me[0]).host;
                _id = (meHost === errRes['host']) ? 'me' : 'client_id';
            }
            return this.render(this._reqError(errRes, _id), res);
        });
    }
    reqOptions(provider, verifyUrl, req) {
        const myData = (this.providers[provider.key].me || {});
        const _agent = (!!myData.agent) ? myData.agent :
            (!!req && req.get('User-Agent') || this._options.headers['User-Agent']);
        const headers = core_1.lang.mixin(this._options.headers, { Accept: '*/*', 'User-Agent': _agent });
        const options = core_1.lang.mixin({
            url: verifyUrl, headers: headers, timeout: this.verifyTimeout,
            meta: { id: 'verify', provider: provider.key }
        }, myData);
        if (!!myData.set && typeof myData.set.options === 'function') {
            core_1.lang.mixin(options, myData.set.options(provider));
        }
        return options;
    }
    verify(req, res) {
        const me = this.normalizeMe(this._decode(req.query.me));
        const verifyUrl = this._normalizeUrl(this._decode(req.query.verify));
        let s = this.session(req);
        if (!this.hasMe(req, me)) {
            return this.errJSON('verifyInsecure', res);
        }
        try {
            this.verifyStore.addSync({
                url: req.query.me, me: 'self', count: s.me[me].data.best.verifyCount,
                urls: [req.query.me], done: 0
            });
        }
        catch (e) { }
        const sProvider = s.me[me].data.best.providers[req.query.verify];
        const is = { authorization_endpoint: false, mail: false, sms: false, pgpkey: false };
        for (var key in is) {
            is[key] = (sProvider.key === key);
        }
        const options = this.reqOptions(sProvider, verifyUrl, req);
        const finish = (err) => {
            let s = this.session(req);
            const meObj = this.verifyStore.getSync(req.query.me);
            var i;
            for (i = 0; i < meObj.urls.length; i++) {
                if (s.urls.me.indexOf(meObj.urls[i]) === -1) {
                    s.urls.me.push(meObj.urls[i]);
                }
            }
            this.verifyStore.filter({ me: req.query.me }).forEach((_o) => {
                if (_o.verified === true) {
                    s.me[me].data.best.providers[_o.url].verified = true;
                    s.me[me].data.best.providers[_o.url].order = 2;
                }
                else if (!!(_o.key && this.providers[_o.key].setUrl)) {
                    s.me[me].data.best.providers[_o.url].order = 3;
                }
                this.verifyStore.remove(_o.url);
            }).then(() => {
                return this.resJSON(((!!err) ? this.error(err) : { verified: true }), res);
            });
        };
        const status = (err) => {
            if (!!err) {
                console.log(sProvider.key, 'RETURNED E', JSON.stringify(err));
            }
            let R = { key: sProvider.key, url: req.query.verify, me: req.query.me, verified: !(err) };
            return this.verifyStore.add(R).then(() => {
                this.verifyStore.get(req.query.me).then((_me) => {
                    _me.done++;
                    console.log('COUNT', _me.done, _me.count, sProvider.key, err);
                    if (_me.done === _me.count) {
                        finish(err);
                    }
                    else {
                        this.verifyStore.putSync(_me);
                        return this.resJSON(((!!err) ? this.error(err) : { verified: true }), res);
                    }
                });
            });
        };
        if (!(is.authorization_endpoint) && !(sProvider.valid)) {
            return status('verifyNoCred');
        }
        if (is.mail || is.sms || is.pgpkey) {
            return status();
        }
        const provider = (mfRes) => {
            let key;
            if (!(mfRes.data.rels) || !Array.isArray(mfRes.data.rels.me)) {
                return status('verifyNoMe');
            }
            if (string_1.startsWith(mfRes.requestOptions['url'], 'https://twitter.com')) {
                for (key in mfRes.data['rel-urls']) {
                    const o = mfRes.data['rel-urls'][key];
                    if (typeof o === 'object' && !!(o.title) && (o.rels.indexOf('me') > -1)) {
                        mfRes.data.rels.me.push(o.title);
                        break;
                    }
                }
                ;
            }
            if (this.hasMe(req, mfRes)) {
                return status();
            }
            const rM = mfRes.requestOptions['meta'];
            const rP = (rM && rM.provider && this.providers[rM.provider]);
            const e = (!!rP && !!(rP.setUrl)) ? 'verifyTmpInvalidMe' : 'verifyInvalidMe';
            let hasN = 0;
            mfRes.data.rels.me.forEach((meUrl) => {
                const redirectOptions = this.reqOptions(sProvider, meUrl, req);
                this.get(redirectOptions).then((redirectRes) => {
                    hasN++;
                    if (url_1.default.hasIdentical(s.urls.me, redirectRes.data.url) &&
                        !!(redirectRes.requestOptions.meta.url)) {
                        const redirected = redirectRes.requestOptions.meta.url;
                        const meObj = this.verifyStore.getSync(req.query.me);
                        if (meObj.urls.indexOf(redirected) === -1) {
                            meObj.urls.push(redirected);
                        }
                        return status();
                    }
                    if (hasN === mfRes.data.rels.me.length) {
                        status(e);
                    }
                }, (e) => {
                    hasN++;
                    if (hasN === mfRes.data.rels.me.length) {
                        status(e);
                    }
                });
            });
        };
        const endpoint = (epRes) => {
            const h = epRes.getHeader('indieauth');
            if (!(h) || h !== 'authorization_endpoint') {
                return status('verifyNoHeader');
            }
            const _v = this._decode(req.query.verify);
            const _urls = ((!!(epRes.url) && _v !== epRes.url) ? [epRes.url, _v] : [_v]);
            if (url_1.default.hasIdentical(_urls, this._url)) {
                return status('verifyNotSelf');
            }
            if (s.me[me].data.best.verifyCount === 1) {
                res.redirect(epRes.url);
            }
            return status();
        };
        const method = (!!(is.authorization_endpoint)) ? 'head' : 'get';
        return this[method](options).then(((!!(is.authorization_endpoint)) ? endpoint : provider), res.status(200).json);
    }
    getProvider(req, res) {
        let s = this.session(req);
        const hasUrl = (!!s && !!url_1.default.hasIdentical(s.urls.me, s.login.me));
        const _state = (!!(req.query) && req.query.state) || (!!(req.body) && req.body.state);
        if (!hasUrl || !_state) {
            return this.errJSON('accessInsecure', res);
        }
        let sProvider, authProvider;
        try {
            sProvider = s.me[s.login.me].data.best.providers[s.login.url];
            authProvider = this.providers[sProvider.key];
        }
        catch (e) {
            return this.errJSON('accessInvalid', res);
        }
        if (!authProvider || !authProvider.valid || (!sProvider.verified && !authProvider.setUrl)) {
            return this.errJSON('accessInvalid', res);
        }
        return authProvider;
    }
    providerAuth(req, res) {
        const me = this.normalizeMe(this._decode(req.query.me));
        let s = this.session(req);
        s.login = { me: me, url: req.query.authorize, created: (new Date()) };
        const provider = this.getProvider(req, res);
        if (!provider.valid) {
            throw ('no client found for ' + req.query.authorize);
        }
        return provider.auth(req, res, { state: s.state });
    }
    providerAccess(req, res) {
        const provider = this.getProvider(req, res);
        let s = this.session(req);
        provider.access(req, res, { state: s.state }).then((accessRes) => {
            const sProvider = s.me[s.login.me].data.best.providers[s.login.url];
            const v = provider.verify;
            const verify = (o) => {
                req.data = (o.data || {});
                s = this.session(req);
                let VERIFIED = {
                    userId: false,
                    userMe: (provider._protocol === 'MailAuth' || provider._protocol === 'GPGAuth')
                };
                if (typeof v.meta === 'object') {
                    if (!!v.meta.userId) {
                        const userId = Pointer_1.default(req.data, v.meta.userId);
                        if (!!userId && sProvider.userId === userId) {
                            VERIFIED.userId = true;
                        }
                    }
                    if (!!v.meta.userMe) {
                        const userMe = Pointer_1.default(req.data, v.meta.userMe);
                        if (!!userMe && url_1.default.hasIdentical(s.urls.me, userMe)) {
                            VERIFIED.userMe = true;
                        }
                    }
                }
                console.log('VERIFIED', VERIFIED);
                if (VERIFIED.userId === true && VERIFIED.userMe === true) {
                    this.access(req, res);
                }
                else if (VERIFIED.userMe !== true && !!(req.data.profileUrl)) {
                    const options = this.reqOptions(sProvider, req.data.profileUrl, req);
                    this.get(options).then((mfRes) => {
                        if (!(mfRes.data.rels) || !Array.isArray(mfRes.data.rels.me)) {
                            this.render(this.error('accessUserId'), res);
                        }
                        if (this.hasMe(req, mfRes)) {
                            console.log('OK');
                            this.access(req, res);
                        }
                        else {
                            console.log('ERR');
                            this.render(this.error('accessUserId'), res);
                        }
                    }, () => { this.render(this.error('accessUserId'), res); });
                }
                else if (VERIFIED.userMe !== true && !!(provider.setUrl)) {
                }
                else {
                    console.log('Not VERIFIED');
                    console.log(this.error(!(VERIFIED.userId) ? 'accessUserId' : 'accessUserMe'));
                    this.render(this.error(!(VERIFIED.userId) ? 'accessUserId' : 'accessUserMe'), res);
                }
                return o;
            };
            const setData = (!!v.set && typeof v.set.result === 'function') ?
                v.set.result(sProvider, accessRes) : ((res) => { return res; });
            let myOptions = core_1.lang.mixin({ responseType: 'json', oauth: accessRes }, v);
            if (!!v.set && typeof v.set.options === 'function') {
                core_1.lang.mixin(myOptions, v.set.options(provider, accessRes));
            }
            if (!!myOptions.url && typeof myOptions.url === 'string') {
                return provider.get(myOptions).then(setData).then(verify);
            }
            return Promise_1.default.resolve(setData({ data: accessRes })).then(verify);
        });
    }
    access(req, res) {
        let s = this.session(req);
        const ACCESSCODE = 'TODO';
        const redirect_uri = url_1.default.withParameters(s.redirect_uri, {
            code: ACCESSCODE, me: s.login.me, state: s.state
        });
        console.log('OK !!! data', req.data);
        console.log('OK !!! redirecting to redirect_uri', redirect_uri);
        return req.data;
    }
}
exports.default = IndieAuth;
//# sourceMappingURL=index.js.map
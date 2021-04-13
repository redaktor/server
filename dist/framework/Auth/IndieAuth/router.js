"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express = require("express");
const session = require("express-session");
const bodyParser = require("body-parser");
const helmet = require("helmet");
const csrf = require("csurf");
const main_1 = require("../../../dojo/core/main");
const promise_1 = require("../../util/promise");
const i18n_1 = require("../../util/i18n");
const _i18n_1 = require("./nls/_i18n");
const main_2 = require("./main");
const IndieAuth = new main_2.default({ debug: true });
function localizedRoute(routeStr) {
    if (routeStr === 'test') {
        const data = require('./test.json');
        return ((req, res) => { res.locals.languages = {}; IndieAuth.test(data, res); });
    }
    const view = (!routeStr.length || routeStr === 'home') ? 'index' : routeStr;
    return ((req, res) => {
        const _lang = (IndieAuth.session(req).locale || i18n_1.getLocaleObj(req).locale);
        const _locales = ['en'].concat(_i18n_1.default[view].locales || []);
        const _languages = _locales.reduce((o, locale) => {
            o[locale] = i18n_1.getLocalLangName(locale);
            return o;
        }, {});
        promise_1.objectPromiseAll({
            common: i18n_1.getCachedI18n(_lang, _i18n_1.default.common),
            page: i18n_1.getCachedI18n(_lang, _i18n_1.default[view])
        }).then((results) => {
            main_1.lang.mixin(res.locals, results.common.messages, results.page.messages, {
                language: _lang,
                languages: _languages,
                locales: _locales
            });
            (view === 'auth') ? IndieAuth.auth(req, res) : res.render(view + '.html');
        });
    });
}
function switchLanguage(req, res) {
    if (req.params.locale.match(/^[a-z]{2,3}(?:-[a-zA-Z]{4})?(?:-[A-Z]{2,3})?$/)) {
        const s = IndieAuth.session(req);
        IndieAuth.session(req, main_1.lang.mixin({}, s, i18n_1.getLocaleObj(req.params.locale, _i18n_1.default.common) || {}));
    }
    res.redirect('back');
}
const doInitialLanguage = (req, res, next) => {
    if (req.xhr || req.headers.accept.indexOf('json') > -1) {
        return next();
    }
    console.log(req.method, req.url, req.path);
    if (!IndieAuth.hasSession(req)) {
        const s = IndieAuth.session(req);
        IndieAuth.session(req, main_1.lang.mixin({}, s, i18n_1.getLocaleObj(req, _i18n_1.default.common) || {}));
    }
    console.log('initial lang session', IndieAuth.session(req));
    next();
};
const IndieAuthRouter = express.Router();
const doParseBody = [bodyParser.json(), bodyParser.urlencoded({ extended: true })];
const doSession = session({
    name: 'sessionId',
    secret: 'evtlEnterAnythingHER3_butSALTit:' + IndieAuth.salt,
    resave: false,
    saveUninitialized: false,
    cookie: {
        httpOnly: true
    }
});
const doCSRF = csrf({
    value: (req) => {
        const _state = (!!(req.query) && req.query.state) || (!!(req.body) && req.body.state);
        if (!!_state) {
            try {
                const _o = JSON.parse(_state);
                if (typeof _o === 'object' && _o._csrf) {
                    return _o._csrf;
                }
            }
            catch (e) { }
            return _state;
        }
        else {
            return (req.body && req.body._csrf) ||
                (req.query && req.query._csrf) ||
                (req.headers['csrf-token']) ||
                (req.headers['xsrf-token']) ||
                (req.headers['x-csrf-token']) ||
                (req.headers['x-xsrf-token']);
        }
    }
});
const doLocalsCSRF = (req, res, next) => {
    res.locals.csrf = req.csrfToken();
    next();
};
const doErrorCSRF = (err, req, res, next) => {
    if (err.code !== 'EBADCSRFTOKEN')
        return next(err);
    res.status(403).json({ "error": "Session has expired or tampered with" });
};
IndieAuthRouter.use(doParseBody, helmet(), doSession, doCSRF, doLocalsCSRF, doErrorCSRF, doInitialLanguage);
const autoauth = (req) => {
    console.log(req);
};
IndieAuthRouter.get('/language/:locale', switchLanguage);
['', 'home', 'setup', 'developers', 'faq', 'history', 'auth', 'test'].map((s) => {
    IndieAuthRouter.get('/' + s, localizedRoute(s));
});
IndieAuthRouter.post('/auth', localizedRoute('auth'));
IndieAuthRouter.get('/autoauth', autoauth);
exports.default = IndieAuthRouter;
//# sourceMappingURL=router.js.map
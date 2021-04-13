"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const two_1 = require("./OAuth/two");
const express = require("express");
const session = require("express-session");
const helmet = require("helmet");
var app = express();
app.use(helmet());
app.use(session({
    secret: 'evtlEnterAnythingHER3_butSALTit:',
    resave: false,
    saveUninitialized: false,
    cookie: {}
}));
var g = new two_1.default({
    debug: true,
    clientId: process.env.CLIENT_KEY,
    clientSecret: process.env.CLIENT_SECRET,
    authUrl: 'https://github.com/login/oauth/authorize',
    accessUrl: 'https://github.com/login/oauth/access_token',
    callbackUrl: 'https://redaktor.circinus.uberspace.de/redaktornode/auth?state=redaktorABCDEFGHIJKLMNOPQRZ12345',
    scope: 'user',
    verify: (oauthRes) => {
        console.log('oauthRes', oauthRes);
        return g.get({
            url: 'https://api.github.com/user',
            responseType: 'json',
            oauth: oauthRes
        });
    }
});
var testState = 'redaktorABCDEFGHIJKLMNOPQRZ12345';
app.get('/', function (req, res, next) {
    g.auth(req, res, { state: testState });
});
app.get('/auth', function (req, res) {
    g.access(req, res, { state: testState })
        .then(g.verify, (e) => { console.log('ACCESS ERR', e); })
        .then(function (gRes) {
        console.log('githubData', gRes.data);
        if (gRes.data.meta.status === 200) {
            res.status(200).send('OK! ' + gRes.data.name);
        }
        else {
            res.status(gRes.data.meta.status || 404).send('Sorry, we cannot find that!');
        }
    });
});
app.listen(5000);
//# sourceMappingURL=testGithub.js.map
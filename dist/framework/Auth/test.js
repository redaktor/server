"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const one_1 = require("./OAuth/one");
const express = require("express");
const session = require("express-session");
var app = express();
app.use(session({
    secret: 'evtlEnterAnythingHER3_butSALTit:',
    resave: false,
    saveUninitialized: false,
    cookie: {}
}));
const HOST = 'https://redaktor.circinus.uberspace.de/redaktornode/';
var twitter = new one_1.default({
    debug: true,
    consumerKey: process.env.CONSUMER_KEY,
    consumerSecret: process.env.CONSUMER_SECRET,
    requestUrl: 'https://api.twitter.com/oauth/request_token',
    authUrl: 'https://api.twitter.com/oauth/authenticate',
    accessUrl: 'https://api.twitter.com/oauth/access_token',
    callbackUrl: HOST + 'callback',
    verify: (oauthRes) => {
        console.log('oauthRes', oauthRes);
        return oauthRes;
    }
});
var testState = 'redaktorABCDEFGHIJKLMNOPQRZ12345';
app.get('/', (req, res) => {
    twitter.auth(req, res, { state: testState });
});
app.get('/callback', (req, res) => {
    twitter.access(req, res).then(twitter.verify, (e) => { console.log('ERROR.', e); })
        .then((verifyRes) => {
        console.log('twitter verifyRes', verifyRes);
        res.json(verifyRes.screen_name);
    });
});
app.listen(5000);
//# sourceMappingURL=test.js.map
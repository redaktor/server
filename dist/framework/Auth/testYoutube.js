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
    scope: 'https://www.googleapis.com/auth/youtube.readonly',
    authUrl: 'https://accounts.google.com/o/oauth2/auth',
    accessUrl: 'https://www.googleapis.com/oauth2/v4/token',
    verifyUrl: 'https://www.googleapis.com/oauth2/v1/userinfo',
    callbackUrl: 'https://redaktor.circinus.uberspace.de/redaktornode/auth',
    verify: (oauthRes) => {
        console.log('oauthRes', oauthRes);
        return g.get({
            url: 'https://www.googleapis.com/youtube/v3/channels',
            query: {
                mine: true,
                part: 'id,snippet'
            },
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
        .then(g.verify)
        .then(function (gRes) {
        console.log('googleData', gRes.data);
        if (gRes.data.meta.status === 200) {
            res.json(gRes.data);
        }
        else {
            res.status(gRes.data.meta.status || 404).send('Sorry, we cannot find that!');
        }
    });
});
app.listen(5000);
//# sourceMappingURL=testYoutube.js.map
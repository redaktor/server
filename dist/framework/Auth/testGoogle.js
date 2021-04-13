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
    authUrl: 'https://accounts.google.com/o/oauth2/auth',
    accessUrl: 'https://www.googleapis.com/oauth2/v4/token',
    callbackUrl: 'https://redaktor.circinus.uberspace.de/redaktornode/callback',
    scope: 'https://www.googleapis.com/auth/plus.me',
    verify: (oauthRes) => {
        console.log('oauthRes', oauthRes);
    }
});
var testState = 'redaktorABCDEFGHIJKLMNOPQRZ1234';
app.get('/', function (req, res, next) {
    g.auth(req, res, { state: testState });
});
app.get('/callback', function (req, res) {
    g.access(req, res)
        .then(g.verify)
        .then((gRes) => {
        console.log('googleData', gRes.data);
        if (gRes.data.meta.status === 200) {
            res.status(200).send('OK! ' + gRes.data.displayName);
        }
        else {
            res.status(gRes.data.meta.status || 404).send('Sorry, we cannot find that!');
        }
    });
});
app.listen(5000);
//# sourceMappingURL=testGoogle.js.map
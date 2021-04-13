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
    authUrl: 'https://api.instagram.com/oauth/authorize/',
    accessUrl: 'https://api.instagram.com/oauth/access_token',
    callbackUrl: 'https://redaktor.circinus.uberspace.de/redaktornode/auth',
    scope: 'basic',
    verify: (oauthRes) => {
        console.log('oauthRes', oauthRes);
    }
});
var testState = 'redaktorABCDEFGHIJKLMNOPQRZ12345';
app.get('/', function (req, res, next) {
    g.auth(req, res, { state: testState });
});
app.get('/auth', function (req, res) {
    g.access(req, res, { state: testState }).then(g.verify);
});
app.listen(5000);
//# sourceMappingURL=testInstagram.js.map
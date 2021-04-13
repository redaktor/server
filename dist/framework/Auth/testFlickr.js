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
var flickr = new one_1.default({
    debug: true,
    consumerKey: process.env.CONSUMER_KEY,
    consumerSecret: process.env.CONSUMER_SECRET,
    requestUrl: 'https://www.flickr.com/services/oauth/request_token',
    authUrl: 'https://www.flickr.com/services/oauth/authorize?perms=read',
    accessUrl: 'https://www.flickr.com/services/oauth/access_token',
    callbackUrl: HOST + 'callback',
    verify: (oauthRes) => {
        console.log('oauthRes', oauthRes);
        return { fullname: oauthRes.data.fullname };
    }
});
var testState = 'redaktorABCDEFGHIJKLMNOPQRZ12345';
app.get('/', (req, res) => {
    flickr.auth(req, res, { state: testState }).then((authRes) => {
        console.log('flickr authRes', authRes);
    });
});
app.get('/callback', (req, res) => {
    flickr.access(req, res)
        .then(flickr.verify)
        .then((verifyRes) => {
        console.log('flickr verifyRes', verifyRes);
        res.json(verifyRes);
    });
});
app.listen(5000);
//# sourceMappingURL=testFlickr.js.map
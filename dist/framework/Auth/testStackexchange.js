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
    id: 'stackexchange',
    debug: true,
    clientId: process.env.CLIENT_KEY,
    clientSecret: process.env.CLIENT_SECRET,
    authUrl: 'https://stackexchange.com/oauth',
    accessUrl: 'https://stackexchange.com/oauth/access_token',
    verifyUrl: 'https://api.stackexchange.com/2.2/me',
    callbackUrl: 'https://redaktor.circinus.uberspace.de/redaktornode/auth',
    scope: '',
    verify: (oauthRes) => {
        console.log('oauthRes', oauthRes);
        return g.get({
            url: 'https://api.stackexchange.com/2.2/me',
            responseType: 'json',
            oauth: oauthRes,
            query: {
                order: 'desc',
                site: 'gis.stackexchange.com',
                key: 'A08losWPtUdwPk95Zm47pw((',
                access_token: oauthRes.access_token,
                filter: 'withbody'
            }
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
        .then((gRes) => {
        console.log('stackexchangeData', gRes.data);
        if (gRes.data.meta.status === 200) {
            res.status(200).send('OK! ');
        }
        else {
            res.status(gRes.data.meta.status || 404).send('Sorry, we cannot find that!');
        }
    }, (e) => { console.log('VERIFY ERR', e); });
});
app.listen(5000);
//# sourceMappingURL=testStackexchange.js.map
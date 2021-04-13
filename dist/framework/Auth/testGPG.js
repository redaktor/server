"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const GPGAuth_1 = require("./GPGAuth");
const express = require("express");
const session = require("express-session");
const bodyParser = require("body-parser");
var app = express();
app.use(session({
    secret: 'evtlEnterAnythingHER3_butSALTit:',
    resave: false,
    saveUninitialized: false,
    cookie: {}
}));
app.use([bodyParser.json(), bodyParser.urlencoded({ extended: true })]);
const HOST = 'https://redaktor.circinus.uberspace.de/redaktornode/';
var m = new GPGAuth_1.default({
    debug: true,
    callbackUrl: HOST,
    renderForm: true
});
var testState = 'redaktorABCDEFGHIJKLMNOPQRZ12345';
app.get('/', (req, res) => {
    m.auth(req, res, { state: testState, publicKey: process.env.PUB });
});
app.post('/', (req, res) => {
    m.access(req, res).then((o) => { console.log('FINAL', o); });
});
app.listen(5000);
//# sourceMappingURL=testGPG.js.map
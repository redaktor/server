"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const MailAuth_1 = require("./MailAuth");
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
var m = new MailAuth_1.default({
    debug: true,
    callbackUrl: HOST,
    user: 'redaktor-mail',
    pass: process.env.SECRET,
    email: 'mail@redaktor.circinus.uberspace.de',
    name: 'IndieAuth',
    host: 'circinus.uberspace.de',
    port: 587,
    renderForm: true
});
var testState = 'redaktorABCDEFGHIJKLMNOPQRZ12345';
app.get('/', (req, res) => {
    m.auth(req, res, { state: testState, to: process.env.TO, html: true, xkcd: true });
});
app.post('/', (req, res) => {
    m.access(req, res).then((o) => { console.log('FINAL', o); });
});
app.listen(5000);
//# sourceMappingURL=testMail.js.map
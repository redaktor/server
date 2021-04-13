"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const _1 = require(".");
var basic = new _1.default({
    debug: true,
    authUrl: 'https://redaktor.circinus.uberspace.de/redaktornode/basic',
    test: 'https://redaktor.circinus.uberspace.de/redaktornode{/key}',
    key: 'sebi',
    secret: 'sebi'
});
basic.auth().then((verifyRes) => { console.log('auth verifyRes', verifyRes); });
//# sourceMappingURL=testBasic.js.map
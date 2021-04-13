"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const https = require("https");
const url_1 = require("../../framework/url");
async function checkHTTPS(url) {
    return new Promise((resolve) => {
        const req = https.get(url_1.default.normalizeUrl(url, false, 'https', true), (res) => {
            return resolve({
                authorized: res.socket.authorized,
                headers: res.headers,
                code: '200'
            });
        }).on('error', (e) => {
            return resolve(Object.assign({ authorized: false, headers: {} }, e));
        });
        req.end();
    });
}
exports.checkHTTPS = checkHTTPS;
async function check3() {
    const a = await checkHTTPS('heise.de');
    const b = await checkHTTPS('http://sebastianlasse.de');
    const c = await checkHTTPS('redaktor.me');
    console.log(a, b, c);
}
//# sourceMappingURL=server.install.js.map
"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const has_1 = require("@dojo/framework/has/has");
console.log('ready');
class Fetch {
    constructor(options = {}) {
        this.options = options;
        this._cache = {};
        this._queue = {};
        this._seen = new Map();
        this.fetchFn = null;
        this.isHeadless = false;
        options.method = typeof options.method === 'string' ?
            `${options.method.toUpperCase()}` : 'GET';
    }
    async fetch(url, options = this.options) {
        if (this.errors) {
            console.log('ERROR', this.errors);
        }
        console.log(url, options);
        if (!this.fetchFn) {
            if (has_1.default('host-node')) {
                this.fetchFn = await Promise.resolve().then(() => require('node-fetch'));
            }
            else if (has_1.default('host-browser')) {
                delete options.server;
                await require('whatwg-fetch');
                this.fetchFn = window.fetch;
            }
            else {
                throw new Error('This environment is not supported!');
            }
        }
        this.options = options;
        if (has_1.default('host-node')) {
            return this.fetchFn(url, this.options);
        }
        else {
            return this.clientFetch(url, this.options);
        }
    }
    clientFetch(url, options = {}) {
    }
}
exports.default = Fetch;
console.log('--- new:');
const F = new Fetch();
console.log('--- do .fetch:');
F.fetch('https://heise.de', {})
    .then(res => { console.log(res, res.socket); return res; });
//# sourceMappingURL=main.js.map
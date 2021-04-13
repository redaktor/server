"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const util_1 = require("@dojo/framework/core/util");
const __1 = require("../");
class SMSAuth extends __1.default {
    constructor(authUrl, callbackUrl, key, secret, scope, text = '') {
        super();
        this.authUrl = authUrl;
        this.callbackUrl = callbackUrl;
        this.key = key;
        this.secret = secret;
        this.scope = scope;
        this.text = text;
        this._E = {
            AUTH: 'Missing recipient: No "to" or "req.query.authorize" found',
            PROP: 'Missing property:'
        };
        this.debug = false;
        this._protocol = 'SMSAuth';
        this._version = '1.0';
        this._type = 'code';
        this.isObject(authUrl) && util_1.mixin(this, authUrl);
        this.initSMSAuth();
    }
    initSMSAuth() { }
    auth(req, res, kwArgs = {}) {
        if (!kwArgs.to && !req.query.authorize) {
            throw new TypeError(this.errLog(this._E.AUTH));
        }
        const options = {};
        if (!!this.debug) {
            const debugOptions = util_1.mixin({}, options, { text: (options.text || '').slice(0, 128) + ' ...' });
            this.debugLog([{ neutral: 'Sending SMS ...' }, { list: debugOptions }]);
        }
    }
    access(req, res) { return this.verifyToken(req); }
}
exports.default = SMSAuth;
//# sourceMappingURL=index.js.map
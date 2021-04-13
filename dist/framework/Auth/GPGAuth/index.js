"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const __1 = require("../");
const Promise_1 = require("@dojo/framework/shim/Promise");
const util_1 = require("@dojo/framework/core/util");
const nls_1 = require("./nls");
const tpl_1 = require("./tpl");
const kbpgp = require('kbpgp');
class GPGAuth extends __1.default {
    constructor(clientSecret, validity = (5 * 60 * 1000), _nonceSize = 32, renderForm = false, iss = 'IndieAuth') {
        super();
        this.clientSecret = clientSecret;
        this.validity = validity;
        this._nonceSize = _nonceSize;
        this.renderForm = renderForm;
        this.iss = iss;
        this.debug = false;
        this._protocol = 'GPGAuth';
        this._version = '1.0';
        this._type = 'JWT';
        this.isObject(clientSecret) && util_1.mixin(this, clientSecret);
        if (!this.clientSecret) {
            this.clientSecret = this._getNonce(this._nonceSize);
        }
        this.initDebugLog(['password', 'secret', 'clientSecret'], ['setup', 'svg']);
        this.initGPGAuth();
    }
    initGPGAuth() { }
    options(o = {}) {
        const keyURL = ((!!o.req.query && o.req.query.authorize) || o.options.publicKey);
        if (!keyURL) {
            return Promise_1.default.reject(this.errLog(o.messages.missingKey));
        }
        return o;
    }
    challenge(o = {}) {
        const keyURL = ((!!o.req.query && o.req.query.authorize) || o.options.publicKey);
        return this.get({ url: keyURL, responseType: 'text' }).then((res) => {
            const s = this.sessionOrCookie(o.req, { me: keyURL, pub: res.data });
            const token = this.setToken(o.req, { aud: keyURL, code: o.options.code });
            util_1.mixin(o.options.query, { pub: s.pub, code: token });
            return o;
        });
    }
    verify(o = {}) {
        return new Promise_1.default((resolve, reject) => {
            const s = this.sessionOrCookie(o.req);
            kbpgp.KeyManager.import_from_armored_pgp({ armored: s.pub }, (err, myGPG) => {
                if (!!err) {
                    return reject('Decrypt Problem with session: ' + err);
                }
                var ring = new kbpgp.keyring.KeyRing();
                ring.add_key_manager(myGPG);
                kbpgp.unbox({ keyfetch: ring, armored: o.req.body.code }, (err, myArr) => {
                    if (!!err) {
                        reject('Decrypt Problem: ' + err);
                    }
                    else {
                        var km, fingerprint;
                        var ds = myArr[0].get_data_signer();
                        if (!!ds && !!ds.get_key_manager) {
                            km = ds.get_key_manager();
                        }
                        if (!!km && !!km.get_pgp_fingerprint) {
                            fingerprint = km.get_pgp_fingerprint().toString('hex');
                        }
                        if (!fingerprint) {
                            return reject('Decrypt Problem with fingerprint');
                        }
                        o.req.body.code = myArr[0].toString();
                        const token = this.getToken(o.req, null, 'code');
                        if (token.aud !== s.me || !token.code) {
                            return reject('Decrypt Problem with token: ' + token);
                        }
                        o.req.body.code = token.code;
                        o.result = { code: fingerprint };
                        return resolve(o);
                    }
                });
            });
        });
    }
    success(o, cb = this.callbackUrl) {
        const _data = util_1.mixin({}, o.messages || {}, o.options.query || {}, { url: cb });
        util_1.mixin(o, { result: {
                form: this.msg(tpl_1.default.form, _data),
                formLabel: this.msg(_data.messageForm, _data)
            } });
        if (!!o.res.send && !!this.renderForm) {
            o.res.send(o.result.form);
        }
        else if (!!o.res.status) {
            o.res.status(200).json(o.result);
        }
        return o.result;
    }
    auth(req = {}, res = {}, kwArgs = {}) {
        return this.i18nOptions({ req: req, res: res, options: kwArgs, nls: nls_1.default })
            .then(o => this.state(o))
            .then(o => this.oneTimePass(o))
            .then(o => this.challenge(o))
            .then(o => this.success(o));
    }
    access(req = {}, res = {}, kwArgs = {}) {
        return Promise_1.default.resolve({ req: req, res: res })
            .then(o => this.verify(o))
            .then(o => this.oneTimePass(o, '/req/body/code'))
            .then(o => this.state(util_1.mixin(o, { finish: true })));
    }
}
exports.default = GPGAuth;
//# sourceMappingURL=index.js.map
(function(f){if(typeof exports==="object"&&typeof module!=="undefined"){module.exports=f()}else if(typeof define==="function"&&define.amd){define([],f)}else{var g;if(typeof window!=="undefined"){g=window}else if(typeof global!=="undefined"){g=global}else if(typeof self!=="undefined"){g=self}else{g=this}g.SRP = f()}})(function(){var define,module,exports;return (function(){function r(e,n,t){function o(i,f){if(!n[i]){if(!e[i]){var c="function"==typeof require&&require;if(!f&&c)return c(i,!0);if(u)return u(i,!0);var a=new Error("Cannot find module '"+i+"'");throw a.code="MODULE_NOT_FOUND",a}var p=n[i]={exports:{}};e[i][0].call(p.exports,function(r){var n=e[i][1][r];return o(n||r)},p,p.exports,r,e,n,t)}return n[i].exports}for(var u="function"==typeof require&&require,i=0;i<t.length;i++)o(t[i]);return o}return r})()({"/../../dist/framework/PAKE/SRP/Browser.js":[function(require,module,exports){
"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const tslib_1 = require("tslib");
const url_1 = require("../../url");
const Base_1 = require("./Base");
class Browser extends Base_1.Base {
    constructor(_SRP = 4096) {
        super(_SRP);
        this.a = null;
        this.u = null;
        this.M1 = null;
        this.s = null;
    }
    static status(s) { console.log(s); }
    static register(form, publicRsaKey, SRPgroup = 4096) {
        const { shared, secret } = Browser.formResult(form);
        if (!shared.hasOwnProperty('_key') || !shared._key) {
            throw new Error(Base_1.Errors.FormAttributes);
        }
        const Client = new Browser(SRPgroup);
        const rData = Client.register(shared.identity, secret.password, publicRsaKey);
        Browser.send(form.action, rData, shared, ((r) => r), function (res) {
            if (!res.href) {
                throw new Error(Base_1.Errors.SRP6ExceptionCredentials);
            }
            if (typeof window !== 'undefined') {
                window.location.href = res.href;
            }
        });
    }
    static login(form, publicRsaKey, statusFn = Browser.status) {
        const { shared, secret } = Browser.formResult(form);
        const status = (s, percent) => {
            try {
                statusFn(s, percent);
            }
            catch (e) {
                throw new Error(`${Base_1.Errors.StatusFnException}: ${JSON.stringify(e)}`);
            }
        };
        try {
            status('Trust: Got Token. Received JWT.', 10);
            const I = this.encryptRSA(shared.identity, publicRsaKey);
            const resI = { I: shared.identity };
            const cData = { I, action: Base_1.Base.ACTION.R_SRP_AUTH };
            status('Authentication: Starting an anonymous challenge.', 20);
            Browser.send(form.action, cData, shared, status, function (res) {
                const client = new Browser(res.group);
                const lData = Object.assign(Object.assign({}, client.login(Object.assign(Object.assign({}, res), resI), secret.password)), { I });
                status('Sending anonymous credentials & public key.', 32);
                Browser.send(form.action, lData, shared, status, function (res) {
                    const vData = Object.assign(Object.assign({}, client.evidence(Object.assign(Object.assign({}, res), resI))), { I });
                    status('Evidence: Starting shared key proof.', 48);
                    Browser.send(form.action, vData, shared, status, function (res) {
                        status('Verified the key proof. Got a shared secret key.', 64);
                        const _a = Object.assign(Object.assign({}, client.verify(Object.assign(Object.assign({}, res), resI))), { I }), { U } = _a, idData = tslib_1.__rest(_a, ["U"]);
                        status('LogIn: Exchanging encrypted messages now.', 80);
                        Browser.send(U, idData, shared, status, function (res) {
                            if (!res.href) {
                                throw new Error(Base_1.Errors.SRP6ExceptionCredentials);
                            }
                            status('Decryption OK: You are logged in!', 100);
                            if (typeof window !== 'undefined') {
                                window.location.href = res.href;
                            }
                        });
                    });
                });
            });
        }
        catch (e) {
            status(e, -1);
        }
    }
    register(identity, P, publicRsaKey) {
        if (!!this.state) {
            throw new Error(Base_1.Errors.IllegalStateException);
        }
        const action = Base_1.Base.ACTION.R_REGISTER;
        const I = this.encryptRSA(identity, publicRsaKey);
        this.put({ s: this.generateRandomSalt(), state: action });
        const { s, group } = this;
        return this.registerResult({ I, group, action, s, v: this.makeV(identity, P) });
    }
    login(res, P) {
        const { I } = res;
        if (!!this.state) {
            throw new Error(Base_1.Errors.IllegalStateException);
        }
        this.checks({ I, P }, true) && this.put({ I, P, state: Base_1.Base.ACTION.R_SRP_AUTH });
        const result = this.crypto(res);
        return this.loginResult(result);
    }
    registerResult(res) { return res; }
    loginResult(res) { return res; }
    crypto(res) {
        if (this.state !== Base_1.Base.ACTION.R_SRP_AUTH) {
            throw new Error(Base_1.Errors.IllegalStateException);
        }
        const action = Base_1.Base.ACTION.R_SRP_EVIDENCE;
        const { B, s } = res;
        this.checks({ s, B });
        this.put({ s, B: Base_1.Base.fromHex(B), a: this.randomA(s), state: action });
        this.checkAB('B');
        const x = this.generateX(this.I, this.P);
        this.put({ P: null, A: this.g.modPow(this.a, this.N) });
        this.checkAB('A');
        this.u = this.computeU(this.A.toString(16), B);
        this.S = this.setSessionKey(x);
        this.check(this.S, 'S');
        const [A, S] = [Base_1.Base.toHex(this.A), Base_1.Base.toHex(this.S)];
        let M1 = Base_1.Base.trimLeadingZeros(this.H(A + B + S));
        this.check(M1, 'M1');
        this.M1 = M1;
        return this.cryptoResult({ I: this.I, A, M1, action, t: res.t });
    }
    cryptoResult(res) { return res; }
    evidence(res) {
        let { M2, t } = res;
        this.check(M2, 'M2');
        if (this.state !== Base_1.Base.ACTION.R_SRP_EVIDENCE) {
            throw new Error(Base_1.Errors.IllegalStateException);
        }
        t = this.encrypt(t, this.getSessionSecret(this.s));
        const action = Base_1.Base.ACTION.R_SRP_VERIFY;
        const computedM2 = this.H(Base_1.Base.toHex(this.A) + this.M1 + Base_1.Base.toHex(this.S));
        if (`${Base_1.Base.trimLeadingZeros(computedM2)}` !== M2) {
            throw new Error(Base_1.Errors.SRP6ExceptionCredentials);
        }
        this.put({ M2, state: action });
        return { I: this.I, action, t };
    }
    verify(res) {
        if (res.action !== Base_1.Base.ACTION.R_ID_TOKEN) {
            throw new Error(Base_1.Errors.IllegalStateException);
        }
        const key = this.getSessionSecret(this.s);
        console.log(key);
        const idURL = this.decrypt(res.id, key);
        const u = url_1.default.parse(idURL);
        if (u.origin !== 'id://') {
            throw new Error(Base_1.Errors.SRP6ExceptionCredentials);
        }
        let [U, I, t] = [u.searchParams.get('u'), u.searchParams.get('I'), u.searchParams.get('t')];
        t = this.encrypt(t, key);
        return { U, action: Base_1.Base.ACTION.R_ID_TOKEN, I, t };
    }
    generateRandomSalt(optionalServerSalt = 's') {
        return this.H(`${new Date()}:${optionalServerSalt}:${Base_1.Base.randomByteHex()}`);
    }
    makeV(I, P) {
        const x = this.generateX(I, P);
        this.v = this.g.modPow(x, this.N);
        return Base_1.Base.toHex(this.v);
    }
    generateX(I, P) {
        this.checks({ I, P }, true);
        const _h = Base_1.Base.trimLeadingZeros(this.H(`${I}:${P}`));
        const hash = Base_1.Base.trimLeadingZeros(this.H(`${this.s}${_h}`.toUpperCase()));
        return Base_1.Base.fromHex(hash).mod(this.N);
    }
    setSessionKey(x, k = this.k, u = this.u, a = this.a, B = this.B) {
        this.checks({ k, x, u, a, B });
        const exp = u.multiply(x).add(a);
        const tmp = this.g.modPow(x, this.N).multiply(k);
        return B.subtract(tmp).modPow(exp, this.N);
    }
    randomA(s) {
        const numBits = Math.max(256, this.N.bitLength() + 8);
        const r = `${Base_1.Base.randomByteHex(numBits)}${s}${(new Date()).getTime()}`;
        const Bi = Base_1.Base.BigInteger(Base_1.Base.randomByteHex(numBits), 16);
        const rBi = Base_1.Base.BigInteger(this.H(r), 16);
        return (rBi.add(Bi)).mod(this.N);
    }
    static send(path, data, pub, errCB, cb) {
        const { _csrf = '' } = pub;
        try {
            const req = new XMLHttpRequest();
            req.addEventListener('load', function () {
                if (this.readyState !== 4 || this.status !== 200) {
                    return;
                }
                cb.call(this, JSON.parse(this.responseText));
            });
            req.addEventListener("error", function (e) {
                const err = `${path} - Request ${e.type}: ${e.loaded} bytes transferred\n`;
                errCB(err, -1);
                throw new Error(`${Base_1.Errors.RequestException} ${err}`);
            });
            req.open('POST', path, true);
            req.setRequestHeader('Content-type', 'application/x-www-form-urlencoded');
            req.setRequestHeader('CSRF-Token', typeof _csrf !== 'undefined' ? _csrf : '');
            req.send(`credentials=${JSON.stringify(data)}`);
        }
        catch (err) {
            errCB(err, -1);
            throw new Error(Base_1.Errors.RequestException);
        }
    }
}
exports.Browser = Browser;
Browser.addEventListeners = true;
if (typeof window !== 'undefined' && Browser.addEventListeners === true) {
    function getBtn(action) {
        return document.querySelector(`form[data-action="${action}"] button[type="submit"]`) ||
            {};
    }
    function getPublicKey(action) {
        return Browser.forge.pki.publicKeyFromPem(document.querySelector(`form[data-action="${action}"] *[name="_key"]`).value);
    }
    window.addEventListener("load", function addListener() {
        window.removeEventListener("load", addListener, false);
        const register = document.querySelector('form[data-action="REGISTER"]');
        const login = document.querySelector('form[data-action="LOGIN"]');
        if (!!register) {
            register.addEventListener('submit', function srpRegisterSubmit(evt) {
                evt.preventDefault();
                window.removeEventListener("submit", srpRegisterSubmit, false);
                getBtn('REGISTER').disabled = true;
                Browser.register(register, getPublicKey('REGISTER'));
            });
        }
        if (!!login) {
            login.addEventListener('submit', function srpLoginSubmit(evt) {
                evt.preventDefault();
                window.removeEventListener("submit", srpLoginSubmit, false);
                getBtn('LOGIN').disabled = true;
                Browser.login(login, getPublicKey('LOGIN'));
            });
        }
    }, false);
}

},{"../../url":9,"./Base":2,"tslib":14}],1:[function(require,module,exports){
"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const jsbn_1 = require("jsbn");
class PakeBase {
    constructor() {
        this.I = null;
        this.P = null;
        this.s = null;
        this._state = 0;
    }
    get state() { return this._state; }
    set state(s) { this._state = s; }
    get UserID() { return this.I; }
    check(v, name, isString = false) {
        if (typeof v === 'undefined' || v === null || v === "" || v === "0") {
            throw new Error(`${name} must not be null, empty or zero`);
        }
        if (isString && typeof v !== 'string') {
            throw new Error(`${name} must be a String`);
        }
    }
    checks(o, areStrings = false) {
        for (let name in o) {
            this.check(o[name], name, areStrings);
        }
        return true;
    }
    put(o) {
        for (let k in o) {
            if (this.hasOwnProperty(k) || k === 'state') {
                this[k] = o[k];
            }
        }
        return o;
    }
    static trimLeadingZeros(s) {
        while (s.substring(0, 1) === '0') {
            s = s.substring(1);
        }
        return s;
    }
    static randomBytes(byteLength = 16) {
        return window.crypto.getRandomValues(new Uint8Array(byteLength));
    }
    static randomByteHex(hexLength = 16) {
        if (!window.crypto || typeof window.crypto.getRandomValues !== 'function') {
            throw new Error(`Your browser does not support window.crypto`);
        }
        const bytesSync = window.crypto.getRandomValues(new Uint8Array(hexLength));
        return Array.prototype.map.call(bytesSync, function (byte) {
            return ('0' + (byte & 0xFF).toString(16)).slice(-2);
        }).join('');
    }
    static toHex(n) {
        "use strict";
        return n.toString(16);
    }
    static fromHex(s) {
        "use strict";
        return new jsbn_1.BigInteger(`${s}`, 16);
    }
    static BigInteger(s, radix) {
        "use strict";
        return new jsbn_1.BigInteger(`${s}`, radix);
    }
}
exports.PakeBase = PakeBase;
PakeBase.ZERO = PakeBase.BigInteger('0', 10);
PakeBase.ONE = PakeBase.BigInteger('1', 10);

},{"jsbn":13}],2:[function(require,module,exports){
"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const tslib_1 = require("tslib");
const SHA512_1 = require("../../SHA512");
const Base_1 = require("../Base");
const constants_1 = require("./constants");
const clientForge = require("./forge.pki.aes.min");
exports.Errors = {
    Param1: `Parameter 1 'group' is not supported.
Possible values: 1024 | 1536 | 2048 | 3072 | 4096 (default value)`,
    Param2: `Parameter 2 'hash' is not supported.
Possible values: SHA256 | SHA384 | SHA512 (default value)`,
    uIsZero: ``,
    FormAttributes: `Your form must have inputs with the name attributes
'identity' and 'password' and for register a hidden input with the name attribute 'key'`,
    NotForm: `Parameter form is not a HTMLFormElement.`,
    NoAction: `Your form is missing the action attribute (path to login).`,
    StatusFnException: `Your status function failed.`,
    IllegalStateException: `IllegalStateException, wrong browser state`,
    IllegalActionException: `IllegalActionException, wrong browser action`,
    SRP6ExceptionB: `SRP6Exception Bad server public value 'B' as B === 0 (mod N)`,
    SRP6ExceptionCredentials: `SRP6Exception Bad server credentials`,
    RequestException: `XMLHttpRequestException`
};
class Base extends Base_1.PakeBase {
    constructor(group = 4096, hash = 'SHA512') {
        super();
        this.group = group;
        this.hash = hash;
        this.randomFn = Base_1.PakeBase.randomByteHex;
        this.randomBytes = Base_1.PakeBase.randomBytes;
        this.x = null;
        this.v = null;
        this.A = null;
        this.B = null;
        this.S = null;
        this.K = null;
        this.M2 = null;
        const _group = constants_1.SRP[`${group}`];
        const _hash = constants_1.HASH[`${hash}`];
        if (!_group) {
            throw new Error(exports.Errors.Param1);
        }
        if (!_hash) {
            throw new Error(exports.Errors.Param2);
        }
        this.group = `${group}`;
        this.g = Base_1.PakeBase.BigInteger(_group.g, 10);
        this.N = Base_1.PakeBase.BigInteger(_group.N, 16);
        this.k = Base_1.PakeBase.BigInteger(this.H(_group.N, _group.g), 16);
    }
    static hash(...strings) {
        const hash = new SHA512_1.SHA512();
        strings.forEach(s => hash.update(`${s}`));
        return SHA512_1.codecHex.fromBits(hash.finalize());
    }
    getSessionSecret(deriveKeySalt = null) {
        if (typeof this.S === 'undefined' || this.S === null) {
            return null;
        }
        const hexedS = Base.toHex(this.S);
        if (!deriveKeySalt) {
            return hexedS;
        }
        if (this.K === null) {
            this.K = Base.forge.pbkdf2(hexedS, deriveKeySalt, 8, 32, 'sha256');
        }
        return this.K;
    }
    static encryptRSA(message, publicKey) {
        const { md, util } = Base.forge;
        message = util.encodeUtf8(message);
        return encodeURIComponent(util.encode64(publicKey.encrypt(message, 'RSA-OAEP', {
            md: md.sha256.create(),
            mgf1: { md: md.sha1.create() }
        })));
    }
    encryptRSA(message, publicKey) {
        return Base.encryptRSA(message, publicKey);
    }
    static decryptRSA(message, privateKey) {
        const { md, util } = Base.forge;
        message = decodeURIComponent(message);
        return util.decodeUtf8(privateKey.decrypt(util.decode64(message), 'RSA-OAEP', {
            md: md.sha256.create(),
            mgf1: { md: md.sha1.create() }
        }));
    }
    decryptRSA(message, privateKey) {
        return Base.decryptRSA(message, privateKey);
    }
    encrypt(message, key) {
        const { cipher, util } = Base.forge;
        const iv = util.createBuffer(this.randomBytes(12));
        const c = cipher.createCipher("AES-GCM", key);
        c.start({ iv });
        c.update(util.createBuffer(util.encode64(message)));
        c.finish();
        return encodeURIComponent([iv, c.output, c.mode.tag].map((b) => util.encode64(b.getBytes())).join(''));
    }
    decrypt(data, key) {
        data = decodeURIComponent(data);
        const { cipher, util } = Base.forge;
        const dc = cipher.createDecipher("AES-GCM", key);
        const end = data.length - 24;
        let [iv, msg, tag] = [[0, 16], [16, end], [end]].map((a) => util.decode64(data.slice(...a)));
        dc.start({ iv, tag: util.createBuffer(tag) });
        dc.update(util.createBuffer(msg));
        dc.finish();
        return util.decode64(dc.output.toString());
    }
    H(...strings) {
        return Base.hash(...strings);
    }
    checkAB(key) {
        if (this[key].equals(Base.ZERO) || this[key].mod(this.N).equals(Base.ZERO)) {
            throw new Error(`SRP6Exception bad server public value '${key}' as ${key} === 0 (mod N)`);
        }
    }
    computeU(Astr, Bstr) {
        this.checks({ Astr, Bstr }, true);
        var output = this.H(`${Astr}${Bstr}`);
        var u = Base_1.PakeBase.BigInteger(`${output}`, 16);
        if (Base_1.PakeBase.ZERO.equals(u)) {
            throw new Error(`SRP6Exception bad shared public value 'u' as u===0`);
        }
        return u;
    }
    static checkForm(form) {
        if (!(form instanceof HTMLFormElement)) {
            throw new Error(exports.Errors.NotForm);
        }
        else if (!form.action || typeof form.action !== 'string') {
            throw new Error(exports.Errors.NoAction);
        }
        if (!form.method || typeof form.method !== 'string') {
            form.method = 'post';
        }
        return form;
    }
    static formResult(form, delPW = true) {
        const formArr = new FormData(Base.checkForm(form));
        const formRes = {};
        for (let pair of formArr) {
            formRes[pair[0]] = pair[1];
        }
        const { password } = formRes, shared = tslib_1.__rest(formRes, ["password"]);
        if (delPW) {
            form.querySelector('[name="password"]')['value'] = '';
        }
        if (!shared.identity || shared.identity.length < 2 ||
            shared.identity.length > 64 || !password) {
            throw new Error(exports.Errors.FormAttributes);
        }
        return { shared, secret: { password }, toJSON: () => JSON.stringify(shared) };
    }
}
exports.Base = Base;
Base.ACTION = constants_1.ACTION;
Base.forge = clientForge;

},{"../../SHA512":6,"../Base":1,"./constants":3,"./forge.pki.aes.min":4,"tslib":14}],3:[function(require,module,exports){
"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const rfc5054groups_1 = require("./rfc5054groups");
var ACTION;
(function (ACTION) {
    ACTION[ACTION["R_REGISTER"] = 0] = "R_REGISTER";
    ACTION[ACTION["R_SRP_AUTH"] = 1] = "R_SRP_AUTH";
    ACTION[ACTION["R_SRP_EVIDENCE"] = 2] = "R_SRP_EVIDENCE";
    ACTION[ACTION["R_SRP_VERIFY"] = 3] = "R_SRP_VERIFY";
    ACTION[ACTION["R_ID_TOKEN"] = 4] = "R_ID_TOKEN";
    ACTION[ACTION["R_LOGGED_IN"] = 5] = "R_LOGGED_IN";
})(ACTION = exports.ACTION || (exports.ACTION = {}));
exports.SRP = rfc5054groups_1.SRP;
exports.HASH = { SHA256: 'sha256', SHA384: 'sha384', SHA512: 'sha512' };

},{"./rfc5054groups":5}],4:[function(require,module,exports){
(function (process,Buffer,setImmediate){
"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.forge = !function (t, e) { "object" == typeof exports && "object" == typeof module ? module.exports = e() : "function" == typeof define && define.amd ? define([], e) : "object" == typeof exports ? exports.forge = e() : t.forge = e(); }("undefined" != typeof self ? self : this, function () { return function (t) { function e(a) { if (r[a])
    return r[a].exports; var i = r[a] = { i: a, l: !1, exports: {} }; return t[a].call(i.exports, i, i.exports, e), i.l = !0, i.exports; } var r = {}; return e.m = t, e.c = r, e.d = function (t, r, a) { e.o(t, r) || Object.defineProperty(t, r, { configurable: !1, enumerable: !0, get: a }); }, e.n = function (t) { var r = t && t.__esModule ? function () { return t.default; } : function () { return t; }; return e.d(r, "a", r), r; }, e.o = function (t, e) { return Object.prototype.hasOwnProperty.call(t, e); }, e.p = "", e(e.s = 21); }([function (t, e) { t.exports = { options: { usePureJavaScript: !1 } }; }, function (t, e, r) { (function (e) { function a(t) { if (8 !== t && 16 !== t && 24 !== t && 32 !== t)
        throw new Error("Only 8, 16, 24, or 32 bits supported: " + t); } function i(t) { if (this.data = "", this.read = 0, "string" == typeof t)
        this.data = t;
    else if (u.isArrayBuffer(t) || u.isArrayBufferView(t))
        if ("undefined" != typeof Buffer && t instanceof Buffer)
            this.data = t.toString("binary");
        else {
            var e = new Uint8Array(t);
            try {
                this.data = String.fromCharCode.apply(null, e);
            }
            catch (t) {
                for (var r = 0; r < e.length; ++r)
                    this.putByte(e[r]);
            }
        }
    else
        (t instanceof i || "object" == typeof t && "string" == typeof t.data && "number" == typeof t.read) && (this.data = t.data, this.read = t.read); this._constructedStringLength = 0; } function n(t, e) { e = e || {}, this.read = e.readOffset || 0, this.growSize = e.growSize || 1024; var r = u.isArrayBuffer(t), a = u.isArrayBufferView(t); if (r || a)
        return this.data = r ? new DataView(t) : new DataView(t.buffer, t.byteOffset, t.byteLength), void (this.write = "writeOffset" in e ? e.writeOffset : this.data.byteLength); this.data = new DataView(new ArrayBuffer(0)), this.write = 0, null !== t && void 0 !== t && this.putBytes(t), "writeOffset" in e && (this.write = e.writeOffset); } var s = r(0), o = r(24), u = t.exports = s.util = s.util || {}; !function () { function t(t) { if (t.source === window && t.data === e) {
        t.stopPropagation();
        var a = r.slice();
        r.length = 0, a.forEach(function (t) { t(); });
    } } if ("undefined" != typeof process && process.nextTick && !process.browser)
        return u.nextTick = process.nextTick, void ("function" == typeof setImmediate ? u.setImmediate = setImmediate : u.setImmediate = u.nextTick); if ("function" == typeof setImmediate)
        return u.setImmediate = function () { return setImmediate.apply(void 0, arguments); }, void (u.nextTick = function (t) { return setImmediate(t); }); if (u.setImmediate = function (t) { setTimeout(t, 0); }, "undefined" != typeof window && "function" == typeof window.postMessage) {
        var e = "forge.setImmediate", r = [];
        u.setImmediate = function (t) { r.push(t), 1 === r.length && window.postMessage(e, "*"); }, window.addEventListener("message", t, !0);
    } if ("undefined" != typeof MutationObserver) {
        var a = Date.now(), i = !0, n = document.createElement("div"), r = [];
        new MutationObserver(function () { var t = r.slice(); r.length = 0, t.forEach(function (t) { t(); }); }).observe(n, { attributes: !0 });
        var s = u.setImmediate;
        u.setImmediate = function (t) { Date.now() - a > 15 ? (a = Date.now(), s(t)) : (r.push(t), 1 === r.length && n.setAttribute("a", i = !i)); };
    } u.nextTick = u.setImmediate; }(), u.isNodejs = "undefined" != typeof process && process.versions && process.versions.node, u.globalScope = function () { return u.isNodejs ? e : "undefined" == typeof self ? window : self; }(), u.isArray = Array.isArray || function (t) { return "[object Array]" === Object.prototype.toString.call(t); }, u.isArrayBuffer = function (t) { return "undefined" != typeof ArrayBuffer && t instanceof ArrayBuffer; }, u.isArrayBufferView = function (t) { return t && u.isArrayBuffer(t.buffer) && void 0 !== t.byteLength; }, u.ByteBuffer = i, u.ByteStringBuffer = i; u.ByteStringBuffer.prototype._optimizeConstructedString = function (t) { this._constructedStringLength += t, this._constructedStringLength > 4096 && (this.data.substr(0, 1), this._constructedStringLength = 0); }, u.ByteStringBuffer.prototype.length = function () { return this.data.length - this.read; }, u.ByteStringBuffer.prototype.isEmpty = function () { return this.length() <= 0; }, u.ByteStringBuffer.prototype.putByte = function (t) { return this.putBytes(String.fromCharCode(t)); }, u.ByteStringBuffer.prototype.fillWithByte = function (t, e) { t = String.fromCharCode(t); for (var r = this.data; e > 0;)
        1 & e && (r += t), (e >>>= 1) > 0 && (t += t); return this.data = r, this._optimizeConstructedString(e), this; }, u.ByteStringBuffer.prototype.putBytes = function (t) { return this.data += t, this._optimizeConstructedString(t.length), this; }, u.ByteStringBuffer.prototype.putString = function (t) { return this.putBytes(u.encodeUtf8(t)); }, u.ByteStringBuffer.prototype.putInt16 = function (t) { return this.putBytes(String.fromCharCode(t >> 8 & 255) + String.fromCharCode(255 & t)); }, u.ByteStringBuffer.prototype.putInt24 = function (t) { return this.putBytes(String.fromCharCode(t >> 16 & 255) + String.fromCharCode(t >> 8 & 255) + String.fromCharCode(255 & t)); }, u.ByteStringBuffer.prototype.putInt32 = function (t) { return this.putBytes(String.fromCharCode(t >> 24 & 255) + String.fromCharCode(t >> 16 & 255) + String.fromCharCode(t >> 8 & 255) + String.fromCharCode(255 & t)); }, u.ByteStringBuffer.prototype.putInt16Le = function (t) { return this.putBytes(String.fromCharCode(255 & t) + String.fromCharCode(t >> 8 & 255)); }, u.ByteStringBuffer.prototype.putInt24Le = function (t) { return this.putBytes(String.fromCharCode(255 & t) + String.fromCharCode(t >> 8 & 255) + String.fromCharCode(t >> 16 & 255)); }, u.ByteStringBuffer.prototype.putInt32Le = function (t) { return this.putBytes(String.fromCharCode(255 & t) + String.fromCharCode(t >> 8 & 255) + String.fromCharCode(t >> 16 & 255) + String.fromCharCode(t >> 24 & 255)); }, u.ByteStringBuffer.prototype.putInt = function (t, e) { a(e); var r = ""; do {
        e -= 8, r += String.fromCharCode(t >> e & 255);
    } while (e > 0); return this.putBytes(r); }, u.ByteStringBuffer.prototype.putSignedInt = function (t, e) { return t < 0 && (t += 2 << e - 1), this.putInt(t, e); }, u.ByteStringBuffer.prototype.putBuffer = function (t) { return this.putBytes(t.getBytes()); }, u.ByteStringBuffer.prototype.getByte = function () { return this.data.charCodeAt(this.read++); }, u.ByteStringBuffer.prototype.getInt16 = function () { var t = this.data.charCodeAt(this.read) << 8 ^ this.data.charCodeAt(this.read + 1); return this.read += 2, t; }, u.ByteStringBuffer.prototype.getInt24 = function () { var t = this.data.charCodeAt(this.read) << 16 ^ this.data.charCodeAt(this.read + 1) << 8 ^ this.data.charCodeAt(this.read + 2); return this.read += 3, t; }, u.ByteStringBuffer.prototype.getInt32 = function () { var t = this.data.charCodeAt(this.read) << 24 ^ this.data.charCodeAt(this.read + 1) << 16 ^ this.data.charCodeAt(this.read + 2) << 8 ^ this.data.charCodeAt(this.read + 3); return this.read += 4, t; }, u.ByteStringBuffer.prototype.getInt16Le = function () { var t = this.data.charCodeAt(this.read) ^ this.data.charCodeAt(this.read + 1) << 8; return this.read += 2, t; }, u.ByteStringBuffer.prototype.getInt24Le = function () { var t = this.data.charCodeAt(this.read) ^ this.data.charCodeAt(this.read + 1) << 8 ^ this.data.charCodeAt(this.read + 2) << 16; return this.read += 3, t; }, u.ByteStringBuffer.prototype.getInt32Le = function () { var t = this.data.charCodeAt(this.read) ^ this.data.charCodeAt(this.read + 1) << 8 ^ this.data.charCodeAt(this.read + 2) << 16 ^ this.data.charCodeAt(this.read + 3) << 24; return this.read += 4, t; }, u.ByteStringBuffer.prototype.getInt = function (t) { a(t); var e = 0; do {
        e = (e << 8) + this.data.charCodeAt(this.read++), t -= 8;
    } while (t > 0); return e; }, u.ByteStringBuffer.prototype.getSignedInt = function (t) { var e = this.getInt(t), r = 2 << t - 2; return e >= r && (e -= r << 1), e; }, u.ByteStringBuffer.prototype.getBytes = function (t) { var e; return t ? (t = Math.min(this.length(), t), e = this.data.slice(this.read, this.read + t), this.read += t) : 0 === t ? e = "" : (e = 0 === this.read ? this.data : this.data.slice(this.read), this.clear()), e; }, u.ByteStringBuffer.prototype.bytes = function (t) { return void 0 === t ? this.data.slice(this.read) : this.data.slice(this.read, this.read + t); }, u.ByteStringBuffer.prototype.at = function (t) { return this.data.charCodeAt(this.read + t); }, u.ByteStringBuffer.prototype.setAt = function (t, e) { return this.data = this.data.substr(0, this.read + t) + String.fromCharCode(e) + this.data.substr(this.read + t + 1), this; }, u.ByteStringBuffer.prototype.last = function () { return this.data.charCodeAt(this.data.length - 1); }, u.ByteStringBuffer.prototype.copy = function () { var t = u.createBuffer(this.data); return t.read = this.read, t; }, u.ByteStringBuffer.prototype.compact = function () { return this.read > 0 && (this.data = this.data.slice(this.read), this.read = 0), this; }, u.ByteStringBuffer.prototype.clear = function () { return this.data = "", this.read = 0, this; }, u.ByteStringBuffer.prototype.truncate = function (t) { var e = Math.max(0, this.length() - t); return this.data = this.data.substr(this.read, e), this.read = 0, this; }, u.ByteStringBuffer.prototype.toHex = function () { for (var t = "", e = this.read; e < this.data.length; ++e) {
        var r = this.data.charCodeAt(e);
        r < 16 && (t += "0"), t += r.toString(16);
    } return t; }, u.ByteStringBuffer.prototype.toString = function () { return u.decodeUtf8(this.bytes()); }, u.DataBuffer = n, u.DataBuffer.prototype.length = function () { return this.write - this.read; }, u.DataBuffer.prototype.isEmpty = function () { return this.length() <= 0; }, u.DataBuffer.prototype.accommodate = function (t, e) { if (this.length() >= t)
        return this; e = Math.max(e || this.growSize, t); var r = new Uint8Array(this.data.buffer, this.data.byteOffset, this.data.byteLength), a = new Uint8Array(this.length() + e); return a.set(r), this.data = new DataView(a.buffer), this; }, u.DataBuffer.prototype.putByte = function (t) { return this.accommodate(1), this.data.setUint8(this.write++, t), this; }, u.DataBuffer.prototype.fillWithByte = function (t, e) { this.accommodate(e); for (var r = 0; r < e; ++r)
        this.data.setUint8(t); return this; }, u.DataBuffer.prototype.putBytes = function (t, e) { if (u.isArrayBufferView(t)) {
        var r = new Uint8Array(t.buffer, t.byteOffset, t.byteLength), a = r.byteLength - r.byteOffset;
        this.accommodate(a);
        var i = new Uint8Array(this.data.buffer, this.write);
        return i.set(r), this.write += a, this;
    } if (u.isArrayBuffer(t)) {
        var r = new Uint8Array(t);
        this.accommodate(r.byteLength);
        var i = new Uint8Array(this.data.buffer);
        return i.set(r, this.write), this.write += r.byteLength, this;
    } if (t instanceof u.DataBuffer || "object" == typeof t && "number" == typeof t.read && "number" == typeof t.write && u.isArrayBufferView(t.data)) {
        var r = new Uint8Array(t.data.byteLength, t.read, t.length());
        this.accommodate(r.byteLength);
        var i = new Uint8Array(t.data.byteLength, this.write);
        return i.set(r), this.write += r.byteLength, this;
    } if (t instanceof u.ByteStringBuffer && (t = t.data, e = "binary"), e = e || "binary", "string" == typeof t) {
        var n;
        if ("hex" === e)
            return this.accommodate(Math.ceil(t.length / 2)), n = new Uint8Array(this.data.buffer, this.write), this.write += u.binary.hex.decode(t, n, this.write), this;
        if ("base64" === e)
            return this.accommodate(3 * Math.ceil(t.length / 4)), n = new Uint8Array(this.data.buffer, this.write), this.write += u.binary.base64.decode(t, n, this.write), this;
        if ("utf8" === e && (t = u.encodeUtf8(t), e = "binary"), "binary" === e || "raw" === e)
            return this.accommodate(t.length), n = new Uint8Array(this.data.buffer, this.write), this.write += u.binary.raw.decode(n), this;
        if ("utf16" === e)
            return this.accommodate(2 * t.length), n = new Uint16Array(this.data.buffer, this.write), this.write += u.text.utf16.encode(n), this;
        throw new Error("Invalid encoding: " + e);
    } throw Error("Invalid parameter: " + t); }, u.DataBuffer.prototype.putBuffer = function (t) { return this.putBytes(t), t.clear(), this; }, u.DataBuffer.prototype.putString = function (t) { return this.putBytes(t, "utf16"); }, u.DataBuffer.prototype.putInt16 = function (t) { return this.accommodate(2), this.data.setInt16(this.write, t), this.write += 2, this; }, u.DataBuffer.prototype.putInt24 = function (t) { return this.accommodate(3), this.data.setInt16(this.write, t >> 8 & 65535), this.data.setInt8(this.write, t >> 16 & 255), this.write += 3, this; }, u.DataBuffer.prototype.putInt32 = function (t) { return this.accommodate(4), this.data.setInt32(this.write, t), this.write += 4, this; }, u.DataBuffer.prototype.putInt16Le = function (t) { return this.accommodate(2), this.data.setInt16(this.write, t, !0), this.write += 2, this; }, u.DataBuffer.prototype.putInt24Le = function (t) { return this.accommodate(3), this.data.setInt8(this.write, t >> 16 & 255), this.data.setInt16(this.write, t >> 8 & 65535, !0), this.write += 3, this; }, u.DataBuffer.prototype.putInt32Le = function (t) { return this.accommodate(4), this.data.setInt32(this.write, t, !0), this.write += 4, this; }, u.DataBuffer.prototype.putInt = function (t, e) { a(e), this.accommodate(e / 8); do {
        e -= 8, this.data.setInt8(this.write++, t >> e & 255);
    } while (e > 0); return this; }, u.DataBuffer.prototype.putSignedInt = function (t, e) { return a(e), this.accommodate(e / 8), t < 0 && (t += 2 << e - 1), this.putInt(t, e); }, u.DataBuffer.prototype.getByte = function () { return this.data.getInt8(this.read++); }, u.DataBuffer.prototype.getInt16 = function () { var t = this.data.getInt16(this.read); return this.read += 2, t; }, u.DataBuffer.prototype.getInt24 = function () { var t = this.data.getInt16(this.read) << 8 ^ this.data.getInt8(this.read + 2); return this.read += 3, t; }, u.DataBuffer.prototype.getInt32 = function () { var t = this.data.getInt32(this.read); return this.read += 4, t; }, u.DataBuffer.prototype.getInt16Le = function () { var t = this.data.getInt16(this.read, !0); return this.read += 2, t; }, u.DataBuffer.prototype.getInt24Le = function () { var t = this.data.getInt8(this.read) ^ this.data.getInt16(this.read + 1, !0) << 8; return this.read += 3, t; }, u.DataBuffer.prototype.getInt32Le = function () { var t = this.data.getInt32(this.read, !0); return this.read += 4, t; }, u.DataBuffer.prototype.getInt = function (t) { a(t); var e = 0; do {
        e = (e << 8) + this.data.getInt8(this.read++), t -= 8;
    } while (t > 0); return e; }, u.DataBuffer.prototype.getSignedInt = function (t) { var e = this.getInt(t), r = 2 << t - 2; return e >= r && (e -= r << 1), e; }, u.DataBuffer.prototype.getBytes = function (t) { var e; return t ? (t = Math.min(this.length(), t), e = this.data.slice(this.read, this.read + t), this.read += t) : 0 === t ? e = "" : (e = 0 === this.read ? this.data : this.data.slice(this.read), this.clear()), e; }, u.DataBuffer.prototype.bytes = function (t) { return void 0 === t ? this.data.slice(this.read) : this.data.slice(this.read, this.read + t); }, u.DataBuffer.prototype.at = function (t) { return this.data.getUint8(this.read + t); }, u.DataBuffer.prototype.setAt = function (t, e) { return this.data.setUint8(t, e), this; }, u.DataBuffer.prototype.last = function () { return this.data.getUint8(this.write - 1); }, u.DataBuffer.prototype.copy = function () { return new u.DataBuffer(this); }, u.DataBuffer.prototype.compact = function () { if (this.read > 0) {
        var t = new Uint8Array(this.data.buffer, this.read), e = new Uint8Array(t.byteLength);
        e.set(t), this.data = new DataView(e), this.write -= this.read, this.read = 0;
    } return this; }, u.DataBuffer.prototype.clear = function () { return this.data = new DataView(new ArrayBuffer(0)), this.read = this.write = 0, this; }, u.DataBuffer.prototype.truncate = function (t) { return this.write = Math.max(0, this.length() - t), this.read = Math.min(this.read, this.write), this; }, u.DataBuffer.prototype.toHex = function () { for (var t = "", e = this.read; e < this.data.byteLength; ++e) {
        var r = this.data.getUint8(e);
        r < 16 && (t += "0"), t += r.toString(16);
    } return t; }, u.DataBuffer.prototype.toString = function (t) { var e = new Uint8Array(this.data, this.read, this.length()); if ("binary" === (t = t || "utf8") || "raw" === t)
        return u.binary.raw.encode(e); if ("hex" === t)
        return u.binary.hex.encode(e); if ("base64" === t)
        return u.binary.base64.encode(e); if ("utf8" === t)
        return u.text.utf8.decode(e); if ("utf16" === t)
        return u.text.utf16.decode(e); throw new Error("Invalid encoding: " + t); }, u.createBuffer = function (t, e) { return e = e || "raw", void 0 !== t && "utf8" === e && (t = u.encodeUtf8(t)), new u.ByteBuffer(t); }, u.fillString = function (t, e) { for (var r = ""; e > 0;)
        1 & e && (r += t), (e >>>= 1) > 0 && (t += t); return r; }, u.xorBytes = function (t, e, r) { for (var a = "", i = "", n = "", s = 0, o = 0; r > 0; --r, ++s)
        i = t.charCodeAt(s) ^ e.charCodeAt(s), o >= 10 && (a += n, n = "", o = 0), n += String.fromCharCode(i), ++o; return a += n; }, u.hexToBytes = function (t) { var e = "", r = 0; for (!0 & t.length && (r = 1, e += String.fromCharCode(parseInt(t[0], 16))); r < t.length; r += 2)
        e += String.fromCharCode(parseInt(t.substr(r, 2), 16)); return e; }, u.bytesToHex = function (t) { return u.createBuffer(t).toHex(); }, u.int32ToBytes = function (t) { return String.fromCharCode(t >> 24 & 255) + String.fromCharCode(t >> 16 & 255) + String.fromCharCode(t >> 8 & 255) + String.fromCharCode(255 & t); }; var c = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789+/=", l = [62, -1, -1, -1, 63, 52, 53, 54, 55, 56, 57, 58, 59, 60, 61, -1, -1, -1, 64, -1, -1, -1, 0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14, 15, 16, 17, 18, 19, 20, 21, 22, 23, 24, 25, -1, -1, -1, -1, -1, -1, 26, 27, 28, 29, 30, 31, 32, 33, 34, 35, 36, 37, 38, 39, 40, 41, 42, 43, 44, 45, 46, 47, 48, 49, 50, 51], h = "123456789ABCDEFGHJKLMNPQRSTUVWXYZabcdefghijkmnopqrstuvwxyz"; u.encode64 = function (t, e) { for (var r, a, i, n = "", s = "", o = 0; o < t.length;)
        r = t.charCodeAt(o++), a = t.charCodeAt(o++), i = t.charCodeAt(o++), n += c.charAt(r >> 2), n += c.charAt((3 & r) << 4 | a >> 4), isNaN(a) ? n += "==" : (n += c.charAt((15 & a) << 2 | i >> 6), n += isNaN(i) ? "=" : c.charAt(63 & i)), e && n.length > e && (s += n.substr(0, e) + "\r\n", n = n.substr(e)); return s += n; }, u.decode64 = function (t) { t = t.replace(/[^A-Za-z0-9\+\/\=]/g, ""); for (var e, r, a, i, n = "", s = 0; s < t.length;)
        e = l[t.charCodeAt(s++) - 43], r = l[t.charCodeAt(s++) - 43], a = l[t.charCodeAt(s++) - 43], i = l[t.charCodeAt(s++) - 43], n += String.fromCharCode(e << 2 | r >> 4), 64 !== a && (n += String.fromCharCode((15 & r) << 4 | a >> 2), 64 !== i && (n += String.fromCharCode((3 & a) << 6 | i))); return n; }, u.encodeUtf8 = function (t) { return unescape(encodeURIComponent(t)); }, u.decodeUtf8 = function (t) { return decodeURIComponent(escape(t)); }, u.binary = { raw: {}, hex: {}, base64: {}, base58: {}, baseN: { encode: o.encode, decode: o.decode } }, u.binary.raw.encode = function (t) { return String.fromCharCode.apply(null, t); }, u.binary.raw.decode = function (t, e, r) { var a = e; a || (a = new Uint8Array(t.length)), r = r || 0; for (var i = r, n = 0; n < t.length; ++n)
        a[i++] = t.charCodeAt(n); return e ? i - r : a; }, u.binary.hex.encode = u.bytesToHex, u.binary.hex.decode = function (t, e, r) { var a = e; a || (a = new Uint8Array(Math.ceil(t.length / 2))), r = r || 0; var i = 0, n = r; for (1 & t.length && (i = 1, a[n++] = parseInt(t[0], 16)); i < t.length; i += 2)
        a[n++] = parseInt(t.substr(i, 2), 16); return e ? n - r : a; }, u.binary.base64.encode = function (t, e) { for (var r, a, i, n = "", s = "", o = 0; o < t.byteLength;)
        r = t[o++], a = t[o++], i = t[o++], n += c.charAt(r >> 2), n += c.charAt((3 & r) << 4 | a >> 4), isNaN(a) ? n += "==" : (n += c.charAt((15 & a) << 2 | i >> 6), n += isNaN(i) ? "=" : c.charAt(63 & i)), e && n.length > e && (s += n.substr(0, e) + "\r\n", n = n.substr(e)); return s += n; }, u.binary.base64.decode = function (t, e, r) { var a = e; a || (a = new Uint8Array(3 * Math.ceil(t.length / 4))), t = t.replace(/[^A-Za-z0-9\+\/\=]/g, ""), r = r || 0; for (var i, n, s, o, u = 0, c = r; u < t.length;)
        i = l[t.charCodeAt(u++) - 43], n = l[t.charCodeAt(u++) - 43], s = l[t.charCodeAt(u++) - 43], o = l[t.charCodeAt(u++) - 43], a[c++] = i << 2 | n >> 4, 64 !== s && (a[c++] = (15 & n) << 4 | s >> 2, 64 !== o && (a[c++] = (3 & s) << 6 | o)); return e ? c - r : a.subarray(0, c); }, u.binary.base58.encode = function (t, e) { return u.binary.baseN.encode(t, h, e); }, u.binary.base58.decode = function (t, e) { return u.binary.baseN.decode(t, h, e); }, u.text = { utf8: {}, utf16: {} }, u.text.utf8.encode = function (t, e, r) { t = u.encodeUtf8(t); var a = e; a || (a = new Uint8Array(t.length)), r = r || 0; for (var i = r, n = 0; n < t.length; ++n)
        a[i++] = t.charCodeAt(n); return e ? i - r : a; }, u.text.utf8.decode = function (t) { return u.decodeUtf8(String.fromCharCode.apply(null, t)); }, u.text.utf16.encode = function (t, e, r) { var a = e; a || (a = new Uint8Array(2 * t.length)); var i = new Uint16Array(a.buffer); r = r || 0; for (var n = r, s = r, o = 0; o < t.length; ++o)
        i[s++] = t.charCodeAt(o), n += 2; return e ? n - r : a; }, u.text.utf16.decode = function (t) { return String.fromCharCode.apply(null, new Uint16Array(t.buffer)); }, u.deflate = function (t, e, r) { if (e = u.decode64(t.deflate(u.encode64(e)).rval), r) {
        var a = 2;
        32 & e.charCodeAt(1) && (a = 6), e = e.substring(a, e.length - 4);
    } return e; }, u.inflate = function (t, e, r) { var a = t.inflate(u.encode64(e)).rval; return null === a ? null : u.decode64(a); }; var p = function (t, e, r) { if (!t)
        throw new Error("WebStorage not available."); var a; if (null === r ? a = t.removeItem(e) : (r = u.encode64(JSON.stringify(r)), a = t.setItem(e, r)), void 0 !== a && !0 !== a.rval) {
        var i = new Error(a.error.message);
        throw i.id = a.error.id, i.name = a.error.name, i;
    } }, f = function (t, e) { if (!t)
        throw new Error("WebStorage not available."); var r = t.getItem(e); if (t.init)
        if (null === r.rval) {
            if (r.error) {
                var a = new Error(r.error.message);
                throw a.id = r.error.id, a.name = r.error.name, a;
            }
            r = null;
        }
        else
            r = r.rval; return null !== r && (r = JSON.parse(u.decode64(r))), r; }, d = function (t, e, r, a) { var i = f(t, e); null === i && (i = {}), i[r] = a, p(t, e, i); }, y = function (t, e, r) { var a = f(t, e); return null !== a && (a = r in a ? a[r] : null), a; }, g = function (t, e, r) { var a = f(t, e); if (null !== a && r in a) {
        delete a[r];
        var i = !0;
        for (var n in a) {
            i = !1;
            break;
        }
        i && (a = null), p(t, e, a);
    } }, m = function (t, e) { p(t, e, null); }, v = function (t, e, r) { var a = null; void 0 === r && (r = ["web", "flash"]); var i, n = !1, s = null; for (var o in r) {
        i = r[o];
        try {
            if ("flash" === i || "both" === i) {
                if (null === e[0])
                    throw new Error("Flash local storage not available.");
                a = t.apply(this, e), n = "flash" === i;
            }
            "web" !== i && "both" !== i || (e[0] = localStorage, a = t.apply(this, e), n = !0);
        }
        catch (t) {
            s = t;
        }
        if (n)
            break;
    } if (!n)
        throw s; return a; }; u.setItem = function (t, e, r, a, i) { v(d, arguments, i); }, u.getItem = function (t, e, r, a) { return v(y, arguments, a); }, u.removeItem = function (t, e, r, a) { v(g, arguments, a); }, u.clearItems = function (t, e, r) { v(m, arguments, r); }, u.parseUrl = function (t) { var e = /^(https?):\/\/([^:&^\/]*):?(\d*)(.*)$/g; e.lastIndex = 0; var r = e.exec(t), a = null === r ? null : { full: t, scheme: r[1], host: r[2], port: r[3], path: r[4] }; return a && (a.fullHost = a.host, a.port ? 80 !== a.port && "http" === a.scheme ? a.fullHost += ":" + a.port : 443 !== a.port && "https" === a.scheme && (a.fullHost += ":" + a.port) : "http" === a.scheme ? a.port = 80 : "https" === a.scheme && (a.port = 443), a.full = a.scheme + "://" + a.fullHost), a; }; var C = null; u.getQueryVariables = function (t) { var e, r = function (t) { for (var e = {}, r = t.split("&"), a = 0; a < r.length; a++) {
        var i, n, s = r[a].indexOf("=");
        s > 0 ? (i = r[a].substring(0, s), n = r[a].substring(s + 1)) : (i = r[a], n = null), i in e || (e[i] = []), i in Object.prototype || null === n || e[i].push(unescape(n));
    } return e; }; return void 0 === t ? (null === C && (C = "undefined" != typeof window && window.location && window.location.search ? r(window.location.search.substring(1)) : {}), e = C) : e = r(t), e; }, u.parseFragment = function (t) { var e = t, r = "", a = t.indexOf("?"); a > 0 && (e = t.substring(0, a), r = t.substring(a + 1)); var i = e.split("/"); return i.length > 0 && "" === i[0] && i.shift(), { pathString: e, queryString: r, path: i, query: "" === r ? {} : u.getQueryVariables(r) }; }, u.makeRequest = function (t) { var e = u.parseFragment(t), r = { path: e.pathString, query: e.queryString, getPath: function (t) { return void 0 === t ? e.path : e.path[t]; }, getQuery: function (t, r) { var a; return void 0 === t ? a = e.query : (a = e.query[t]) && void 0 !== r && (a = a[r]), a; }, getQueryLast: function (t, e) { var a = r.getQuery(t); return a ? a[a.length - 1] : e; } }; return r; }, u.makeLink = function (t, e, r) { t = jQuery.isArray(t) ? t.join("/") : t; var a = jQuery.param(e || {}); return r = r || "", t + (a.length > 0 ? "?" + a : "") + (r.length > 0 ? "#" + r : ""); }, u.setPath = function (t, e, r) { if ("object" == typeof t && null !== t)
        for (var a = 0, i = e.length; a < i;) {
            var n = e[a++];
            if (a == i)
                t[n] = r;
            else {
                var s = n in t;
                (!s || s && "object" != typeof t[n] || s && null === t[n]) && (t[n] = {}), t = t[n];
            }
        } }, u.getPath = function (t, e, r) { for (var a = 0, i = e.length, n = !0; n && a < i && "object" == typeof t && null !== t;) {
        var s = e[a++];
        n = s in t, n && (t = t[s]);
    } return n ? t : r; }, u.deletePath = function (t, e) { if ("object" == typeof t && null !== t)
        for (var r = 0, a = e.length; r < a;) {
            var i = e[r++];
            if (r == a)
                delete t[i];
            else {
                if (!(i in t) || "object" != typeof t[i] || null === t[i])
                    break;
                t = t[i];
            }
        } }, u.isEmpty = function (t) { for (var e in t)
        if (t.hasOwnProperty(e))
            return !1; return !0; }, u.format = function (t) { for (var e, r, a = /%./g, i = 0, n = [], s = 0; e = a.exec(t);) {
        r = t.substring(s, a.lastIndex - 2), r.length > 0 && n.push(r), s = a.lastIndex;
        var o = e[0][1];
        switch (o) {
            case "s":
            case "o":
                i < arguments.length ? n.push(arguments[1 + i++]) : n.push("<?>");
                break;
            case "%":
                n.push("%");
                break;
            default: n.push("<%" + o + "?>");
        }
    } return n.push(t.substring(s)), n.join(""); }, u.formatNumber = function (t, e, r, a) { var i = t, n = isNaN(e = Math.abs(e)) ? 2 : e, s = void 0 === r ? "," : r, o = void 0 === a ? "." : a, u = i < 0 ? "-" : "", c = parseInt(i = Math.abs(+i || 0).toFixed(n), 10) + "", l = c.length > 3 ? c.length % 3 : 0; return u + (l ? c.substr(0, l) + o : "") + c.substr(l).replace(/(\d{3})(?=\d)/g, "$1" + o) + (n ? s + Math.abs(i - c).toFixed(n).slice(2) : ""); }, u.formatSize = function (t) { return t = t >= 1073741824 ? u.formatNumber(t / 1073741824, 2, ".", "") + " GiB" : t >= 1048576 ? u.formatNumber(t / 1048576, 2, ".", "") + " MiB" : t >= 1024 ? u.formatNumber(t / 1024, 0) + " KiB" : u.formatNumber(t, 0) + " bytes"; }, u.bytesFromIP = function (t) { return -1 !== t.indexOf(".") ? u.bytesFromIPv4(t) : -1 !== t.indexOf(":") ? u.bytesFromIPv6(t) : null; }, u.bytesFromIPv4 = function (t) { if (t = t.split("."), 4 !== t.length)
        return null; for (var e = u.createBuffer(), r = 0; r < t.length; ++r) {
        var a = parseInt(t[r], 10);
        if (isNaN(a))
            return null;
        e.putByte(a);
    } return e.getBytes(); }, u.bytesFromIPv6 = function (t) { var e = 0; t = t.split(":").filter(function (t) { return 0 === t.length && ++e, !0; }); for (var r = 2 * (8 - t.length + e), a = u.createBuffer(), i = 0; i < 8; ++i)
        if (t[i] && 0 !== t[i].length) {
            var n = u.hexToBytes(t[i]);
            n.length < 2 && a.putByte(0), a.putBytes(n);
        }
        else
            a.fillWithByte(0, r), r = 0; return a.getBytes(); }, u.bytesToIP = function (t) { return 4 === t.length ? u.bytesToIPv4(t) : 16 === t.length ? u.bytesToIPv6(t) : null; }, u.bytesToIPv4 = function (t) { if (4 !== t.length)
        return null; for (var e = [], r = 0; r < t.length; ++r)
        e.push(t.charCodeAt(r)); return e.join("."); }, u.bytesToIPv6 = function (t) { if (16 !== t.length)
        return null; for (var e = [], r = [], a = 0, i = 0; i < t.length; i += 2) {
        for (var n = u.bytesToHex(t[i] + t[i + 1]); "0" === n[0] && "0" !== n;)
            n = n.substr(1);
        if ("0" === n) {
            var s = r[r.length - 1], o = e.length;
            s && o === s.end + 1 ? (s.end = o, s.end - s.start > r[a].end - r[a].start && (a = r.length - 1)) : r.push({ start: o, end: o });
        }
        e.push(n);
    } if (r.length > 0) {
        var c = r[a];
        c.end - c.start > 0 && (e.splice(c.start, c.end - c.start + 1, ""), 0 === c.start && e.unshift(""), 7 === c.end && e.push(""));
    } return e.join(":"); }, u.estimateCores = function (t, e) { function r(t, s, o) { if (0 === s) {
        var c = Math.floor(t.reduce(function (t, e) { return t + e; }, 0) / t.length);
        return u.cores = Math.max(1, c), URL.revokeObjectURL(n), e(null, u.cores);
    } a(o, function (e, a) { t.push(i(o, a)), r(t, s - 1, o); }); } function a(t, e) { for (var r = [], a = [], i = 0; i < t; ++i) {
        var s = new Worker(n);
        s.addEventListener("message", function (i) { if (a.push(i.data), a.length === t) {
            for (var n = 0; n < t; ++n)
                r[n].terminate();
            e(null, a);
        } }), r.push(s);
    } for (var i = 0; i < t; ++i)
        r[i].postMessage(i); } function i(t, e) { for (var r = [], a = 0; a < t; ++a)
        for (var i = e[a], n = r[a] = [], s = 0; s < t; ++s)
            if (a !== s) {
                var o = e[s];
                (i.st > o.st && i.st < o.et || o.st > i.st && o.st < i.et) && n.push(s);
            } return r.reduce(function (t, e) { return Math.max(t, e.length); }, 0); } if ("function" == typeof t && (e = t, t = {}), t = t || {}, "cores" in u && !t.update)
        return e(null, u.cores); if ("undefined" != typeof navigator && "hardwareConcurrency" in navigator && navigator.hardwareConcurrency > 0)
        return u.cores = navigator.hardwareConcurrency, e(null, u.cores); if ("undefined" == typeof Worker)
        return u.cores = 1, e(null, u.cores); if ("undefined" == typeof Blob)
        return u.cores = 2, e(null, u.cores); var n = URL.createObjectURL(new Blob(["(", function () { self.addEventListener("message", function (t) { for (var e = Date.now(), r = e + 4; Date.now() < r;)
            ; self.postMessage({ st: e, et: r }); }); }.toString(), ")()"], { type: "application/javascript" })); r([], 5, 16); }; }).call(e, r(23)); }, function (t, e, r) { function a(t, e, r) { if (r > e) {
        var a = new Error("Too few bytes to parse DER.");
        throw a.available = t.length(), a.remaining = e, a.requested = r, a;
    } } function i(t, e, r, n) { var u; a(t, e, 2); var c = t.getByte(); e--; var l = 192 & c, h = 31 & c; u = t.length(); var p = o(t, e); if (e -= u - t.length(), void 0 !== p && p > e) {
        if (n.strict) {
            var f = new Error("Too few bytes to read ASN.1 value.");
            throw f.available = t.length(), f.remaining = e, f.requested = p, f;
        }
        p = e;
    } var d, y, g = 32 == (32 & c); if (g)
        if (d = [], void 0 === p)
            for (;;) {
                if (a(t, e, 2), t.bytes(2) === String.fromCharCode(0, 0)) {
                    t.getBytes(2), e -= 2;
                    break;
                }
                u = t.length(), d.push(i(t, e, r + 1, n)), e -= u - t.length();
            }
        else
            for (; p > 0;)
                u = t.length(), d.push(i(t, p, r + 1, n)), e -= u - t.length(), p -= u - t.length(); if (void 0 === d && l === s.Class.UNIVERSAL && h === s.Type.BITSTRING && (y = t.bytes(p)), void 0 === d && n.decodeBitStrings && l === s.Class.UNIVERSAL && h === s.Type.BITSTRING && p > 1) {
        var m = t.read, v = e, C = 0;
        if (h === s.Type.BITSTRING && (a(t, e, 1), C = t.getByte(), e--), 0 === C)
            try {
                u = t.length();
                var E = { verbose: n.verbose, strict: !0, decodeBitStrings: !0 }, S = i(t, e, r + 1, E), T = u - t.length();
                e -= T, h == s.Type.BITSTRING && T++;
                var I = S.tagClass;
                T !== p || I !== s.Class.UNIVERSAL && I !== s.Class.CONTEXT_SPECIFIC || (d = [S]);
            }
            catch (t) { }
        void 0 === d && (t.read = m, e = v);
    } if (void 0 === d) {
        if (void 0 === p) {
            if (n.strict)
                throw new Error("Non-constructed ASN.1 object of indefinite length.");
            p = e;
        }
        if (h === s.Type.BMPSTRING)
            for (d = ""; p > 0; p -= 2)
                a(t, e, 2), d += String.fromCharCode(t.getInt16()), e -= 2;
        else
            d = t.getBytes(p);
    } var b = void 0 === y ? null : { bitStringContents: y }; return s.create(l, h, g, d, b); } var n = r(0); r(1), r(3); var s = t.exports = n.asn1 = n.asn1 || {}; s.Class = { UNIVERSAL: 0, APPLICATION: 64, CONTEXT_SPECIFIC: 128, PRIVATE: 192 }, s.Type = { NONE: 0, BOOLEAN: 1, INTEGER: 2, BITSTRING: 3, OCTETSTRING: 4, NULL: 5, OID: 6, ODESC: 7, EXTERNAL: 8, REAL: 9, ENUMERATED: 10, EMBEDDED: 11, UTF8: 12, ROID: 13, SEQUENCE: 16, SET: 17, PRINTABLESTRING: 19, IA5STRING: 22, UTCTIME: 23, GENERALIZEDTIME: 24, BMPSTRING: 30 }, s.create = function (t, e, r, a, i) { if (n.util.isArray(a)) {
        for (var o = [], u = 0; u < a.length; ++u)
            void 0 !== a[u] && o.push(a[u]);
        a = o;
    } var c = { tagClass: t, type: e, constructed: r, composed: r || n.util.isArray(a), value: a }; return i && "bitStringContents" in i && (c.bitStringContents = i.bitStringContents, c.original = s.copy(c)), c; }, s.copy = function (t, e) { var r; if (n.util.isArray(t)) {
        r = [];
        for (var a = 0; a < t.length; ++a)
            r.push(s.copy(t[a], e));
        return r;
    } return "string" == typeof t ? t : (r = { tagClass: t.tagClass, type: t.type, constructed: t.constructed, composed: t.composed, value: s.copy(t.value, e) }, e && !e.excludeBitStringContents && (r.bitStringContents = t.bitStringContents), r); }, s.equals = function (t, e, r) { if (n.util.isArray(t)) {
        if (!n.util.isArray(e))
            return !1;
        if (t.length !== e.length)
            return !1;
        for (var a = 0; a < t.length; ++a)
            if (!s.equals(t[a], e[a]))
                return !1;
        return !0;
    } if (typeof t != typeof e)
        return !1; if ("string" == typeof t)
        return t === e; var i = t.tagClass === e.tagClass && t.type === e.type && t.constructed === e.constructed && t.composed === e.composed && s.equals(t.value, e.value); return r && r.includeBitStringContents && (i = i && t.bitStringContents === e.bitStringContents), i; }, s.getBerValueLength = function (t) { var e = t.getByte(); if (128 !== e) {
        return 128 & e ? t.getInt((127 & e) << 3) : e;
    } }; var o = function (t, e) { var r = t.getByte(); if (e--, 128 !== r) {
        var i;
        if (128 & r) {
            var n = 127 & r;
            a(t, e, n), i = t.getInt(n << 3);
        }
        else
            i = r;
        if (i < 0)
            throw new Error("Negative length: " + i);
        return i;
    } }; s.fromDer = function (t, e) { return void 0 === e && (e = { strict: !0, decodeBitStrings: !0 }), "boolean" == typeof e && (e = { strict: e, decodeBitStrings: !0 }), "strict" in e || (e.strict = !0), "decodeBitStrings" in e || (e.decodeBitStrings = !0), "string" == typeof t && (t = n.util.createBuffer(t)), i(t, t.length(), 0, e); }, s.toDer = function (t) { var e = n.util.createBuffer(), r = t.tagClass | t.type, a = n.util.createBuffer(), i = !1; if ("bitStringContents" in t && (i = !0, t.original && (i = s.equals(t, t.original))), i)
        a.putBytes(t.bitStringContents);
    else if (t.composed) {
        t.constructed ? r |= 32 : a.putByte(0);
        for (var o = 0; o < t.value.length; ++o)
            void 0 !== t.value[o] && a.putBuffer(s.toDer(t.value[o]));
    }
    else if (t.type === s.Type.BMPSTRING)
        for (var o = 0; o < t.value.length; ++o)
            a.putInt16(t.value.charCodeAt(o));
    else
        t.type === s.Type.INTEGER && t.value.length > 1 && (0 === t.value.charCodeAt(0) && 0 == (128 & t.value.charCodeAt(1)) || 255 === t.value.charCodeAt(0) && 128 == (128 & t.value.charCodeAt(1))) ? a.putBytes(t.value.substr(1)) : a.putBytes(t.value); if (e.putByte(r), a.length() <= 127)
        e.putByte(127 & a.length());
    else {
        var u = a.length(), c = "";
        do {
            c += String.fromCharCode(255 & u), u >>>= 8;
        } while (u > 0);
        e.putByte(128 | c.length);
        for (var o = c.length - 1; o >= 0; --o)
            e.putByte(c.charCodeAt(o));
    } return e.putBuffer(a), e; }, s.oidToDer = function (t) { var e = t.split("."), r = n.util.createBuffer(); r.putByte(40 * parseInt(e[0], 10) + parseInt(e[1], 10)); for (var a, i, s, o, u = 2; u < e.length; ++u) {
        a = !0, i = [], s = parseInt(e[u], 10);
        do {
            o = 127 & s, s >>>= 7, a || (o |= 128), i.push(o), a = !1;
        } while (s > 0);
        for (var c = i.length - 1; c >= 0; --c)
            r.putByte(i[c]);
    } return r; }, s.derToOid = function (t) { var e; "string" == typeof t && (t = n.util.createBuffer(t)); var r = t.getByte(); e = Math.floor(r / 40) + "." + r % 40; for (var a = 0; t.length() > 0;)
        r = t.getByte(), a <<= 7, 128 & r ? a += 127 & r : (e += "." + (a + r), a = 0); return e; }, s.utcTimeToDate = function (t) { var e = new Date, r = parseInt(t.substr(0, 2), 10); r = r >= 50 ? 1900 + r : 2e3 + r; var a = parseInt(t.substr(2, 2), 10) - 1, i = parseInt(t.substr(4, 2), 10), n = parseInt(t.substr(6, 2), 10), s = parseInt(t.substr(8, 2), 10), o = 0; if (t.length > 11) {
        var u = t.charAt(10), c = 10;
        "+" !== u && "-" !== u && (o = parseInt(t.substr(10, 2), 10), c += 2);
    } if (e.setUTCFullYear(r, a, i), e.setUTCHours(n, s, o, 0), c && ("+" === (u = t.charAt(c)) || "-" === u)) {
        var l = parseInt(t.substr(c + 1, 2), 10), h = parseInt(t.substr(c + 4, 2), 10), p = 60 * l + h;
        p *= 6e4, "+" === u ? e.setTime(+e - p) : e.setTime(+e + p);
    } return e; }, s.generalizedTimeToDate = function (t) { var e = new Date, r = parseInt(t.substr(0, 4), 10), a = parseInt(t.substr(4, 2), 10) - 1, i = parseInt(t.substr(6, 2), 10), n = parseInt(t.substr(8, 2), 10), s = parseInt(t.substr(10, 2), 10), o = parseInt(t.substr(12, 2), 10), u = 0, c = 0, l = !1; "Z" === t.charAt(t.length - 1) && (l = !0); var h = t.length - 5, p = t.charAt(h); if ("+" === p || "-" === p) {
        c = 60 * parseInt(t.substr(h + 1, 2), 10) + parseInt(t.substr(h + 4, 2), 10), c *= 6e4, "+" === p && (c *= -1), l = !0;
    } return "." === t.charAt(14) && (u = 1e3 * parseFloat(t.substr(14), 10)), l ? (e.setUTCFullYear(r, a, i), e.setUTCHours(n, s, o, u), e.setTime(+e + c)) : (e.setFullYear(r, a, i), e.setHours(n, s, o, u)), e; }, s.dateToUtcTime = function (t) { if ("string" == typeof t)
        return t; var e = "", r = []; r.push(("" + t.getUTCFullYear()).substr(2)), r.push("" + (t.getUTCMonth() + 1)), r.push("" + t.getUTCDate()), r.push("" + t.getUTCHours()), r.push("" + t.getUTCMinutes()), r.push("" + t.getUTCSeconds()); for (var a = 0; a < r.length; ++a)
        r[a].length < 2 && (e += "0"), e += r[a]; return e += "Z"; }, s.dateToGeneralizedTime = function (t) { if ("string" == typeof t)
        return t; var e = "", r = []; r.push("" + t.getUTCFullYear()), r.push("" + (t.getUTCMonth() + 1)), r.push("" + t.getUTCDate()), r.push("" + t.getUTCHours()), r.push("" + t.getUTCMinutes()), r.push("" + t.getUTCSeconds()); for (var a = 0; a < r.length; ++a)
        r[a].length < 2 && (e += "0"), e += r[a]; return e += "Z"; }, s.integerToDer = function (t) { var e = n.util.createBuffer(); if (t >= -128 && t < 128)
        return e.putSignedInt(t, 8); if (t >= -32768 && t < 32768)
        return e.putSignedInt(t, 16); if (t >= -8388608 && t < 8388608)
        return e.putSignedInt(t, 24); if (t >= -2147483648 && t < 2147483648)
        return e.putSignedInt(t, 32); var r = new Error("Integer too large; max is 32-bits."); throw r.integer = t, r; }, s.derToInteger = function (t) { "string" == typeof t && (t = n.util.createBuffer(t)); var e = 8 * t.length(); if (e > 32)
        throw new Error("Integer too large; max is 32-bits."); return t.getSignedInt(e); }, s.validate = function (t, e, r, a) { var i = !1; if (t.tagClass !== e.tagClass && void 0 !== e.tagClass || t.type !== e.type && void 0 !== e.type)
        a && (t.tagClass !== e.tagClass && a.push("[" + e.name + '] Expected tag class "' + e.tagClass + '", got "' + t.tagClass + '"'), t.type !== e.type && a.push("[" + e.name + '] Expected type "' + e.type + '", got "' + t.type + '"'));
    else if (t.constructed === e.constructed || void 0 === e.constructed) {
        if (i = !0, e.value && n.util.isArray(e.value))
            for (var o = 0, u = 0; i && u < e.value.length; ++u)
                i = e.value[u].optional || !1, t.value[o] && (i = s.validate(t.value[o], e.value[u], r, a), i ? ++o : e.value[u].optional && (i = !0)), !i && a && a.push("[" + e.name + '] Tag class "' + e.tagClass + '", type "' + e.type + '" expected value length "' + e.value.length + '", got "' + t.value.length + '"');
        if (i && r && (e.capture && (r[e.capture] = t.value), e.captureAsn1 && (r[e.captureAsn1] = t), e.captureBitStringContents && "bitStringContents" in t && (r[e.captureBitStringContents] = t.bitStringContents), e.captureBitStringValue && "bitStringContents" in t)) {
            if (t.bitStringContents.length < 2)
                r[e.captureBitStringValue] = "";
            else {
                var c = t.bitStringContents.charCodeAt(0);
                if (0 !== c)
                    throw new Error("captureBitStringValue only supported for zero unused bits");
                r[e.captureBitStringValue] = t.bitStringContents.slice(1);
            }
        }
    }
    else
        a && a.push("[" + e.name + '] Expected constructed "' + e.constructed + '", got "' + t.constructed + '"'); return i; }; var u = /[^\\u0000-\\u00ff]/; s.prettyPrint = function (t, e, r) { var a = ""; e = e || 0, r = r || 2, e > 0 && (a += "\n"); for (var i = "", o = 0; o < e * r; ++o)
        i += " "; switch (a += i + "Tag: ", t.tagClass) {
        case s.Class.UNIVERSAL:
            a += "Universal:";
            break;
        case s.Class.APPLICATION:
            a += "Application:";
            break;
        case s.Class.CONTEXT_SPECIFIC:
            a += "Context-Specific:";
            break;
        case s.Class.PRIVATE: a += "Private:";
    } if (t.tagClass === s.Class.UNIVERSAL)
        switch (a += t.type, t.type) {
            case s.Type.NONE:
                a += " (None)";
                break;
            case s.Type.BOOLEAN:
                a += " (Boolean)";
                break;
            case s.Type.INTEGER:
                a += " (Integer)";
                break;
            case s.Type.BITSTRING:
                a += " (Bit string)";
                break;
            case s.Type.OCTETSTRING:
                a += " (Octet string)";
                break;
            case s.Type.NULL:
                a += " (Null)";
                break;
            case s.Type.OID:
                a += " (Object Identifier)";
                break;
            case s.Type.ODESC:
                a += " (Object Descriptor)";
                break;
            case s.Type.EXTERNAL:
                a += " (External or Instance of)";
                break;
            case s.Type.REAL:
                a += " (Real)";
                break;
            case s.Type.ENUMERATED:
                a += " (Enumerated)";
                break;
            case s.Type.EMBEDDED:
                a += " (Embedded PDV)";
                break;
            case s.Type.UTF8:
                a += " (UTF8)";
                break;
            case s.Type.ROID:
                a += " (Relative Object Identifier)";
                break;
            case s.Type.SEQUENCE:
                a += " (Sequence)";
                break;
            case s.Type.SET:
                a += " (Set)";
                break;
            case s.Type.PRINTABLESTRING:
                a += " (Printable String)";
                break;
            case s.Type.IA5String:
                a += " (IA5String (ASCII))";
                break;
            case s.Type.UTCTIME:
                a += " (UTC time)";
                break;
            case s.Type.GENERALIZEDTIME:
                a += " (Generalized time)";
                break;
            case s.Type.BMPSTRING: a += " (BMP String)";
        }
    else
        a += t.type; if (a += "\n", a += i + "Constructed: " + t.constructed + "\n", t.composed) {
        for (var c = 0, l = "", o = 0; o < t.value.length; ++o)
            void 0 !== t.value[o] && (c += 1, l += s.prettyPrint(t.value[o], e + 1, r), o + 1 < t.value.length && (l += ","));
        a += i + "Sub values: " + c + l;
    }
    else {
        if (a += i + "Value: ", t.type === s.Type.OID) {
            var h = s.derToOid(t.value);
            a += h, n.pki && n.pki.oids && h in n.pki.oids && (a += " (" + n.pki.oids[h] + ") ");
        }
        if (t.type === s.Type.INTEGER)
            try {
                a += s.derToInteger(t.value);
            }
            catch (e) {
                a += "0x" + n.util.bytesToHex(t.value);
            }
        else if (t.type === s.Type.BITSTRING) {
            if (t.value.length > 1 ? a += "0x" + n.util.bytesToHex(t.value.slice(1)) : a += "(none)", t.value.length > 0) {
                var p = t.value.charCodeAt(0);
                1 == p ? a += " (1 unused bit shown)" : p > 1 && (a += " (" + p + " unused bits shown)");
            }
        }
        else
            t.type === s.Type.OCTETSTRING ? (u.test(t.value) || (a += "(" + t.value + ") "), a += "0x" + n.util.bytesToHex(t.value)) : t.type === s.Type.UTF8 ? a += n.util.decodeUtf8(t.value) : t.type === s.Type.PRINTABLESTRING || t.type === s.Type.IA5String ? a += t.value : u.test(t.value) ? a += "0x" + n.util.bytesToHex(t.value) : 0 === t.value.length ? a += "[null]" : a += t.value;
    } return a; }; }, function (t, e, r) { function a(t, e) { s[t] = e, s[e] = t; } function i(t, e) { s[t] = e; } var n = r(0); n.pki = n.pki || {}; var s = t.exports = n.pki.oids = n.oids = n.oids || {}; a("1.2.840.113549.1.1.1", "rsaEncryption"), a("1.2.840.113549.1.1.4", "md5WithRSAEncryption"), a("1.2.840.113549.1.1.5", "sha1WithRSAEncryption"), a("1.2.840.113549.1.1.7", "RSAES-OAEP"), a("1.2.840.113549.1.1.8", "mgf1"), a("1.2.840.113549.1.1.9", "pSpecified"), a("1.2.840.113549.1.1.10", "RSASSA-PSS"), a("1.2.840.113549.1.1.11", "sha256WithRSAEncryption"), a("1.2.840.113549.1.1.12", "sha384WithRSAEncryption"), a("1.2.840.113549.1.1.13", "sha512WithRSAEncryption"), a("1.3.101.112", "EdDSA25519"), a("1.2.840.10040.4.3", "dsa-with-sha1"), a("1.3.14.3.2.7", "desCBC"), a("1.3.14.3.2.26", "sha1"), a("2.16.840.1.101.3.4.2.1", "sha256"), a("2.16.840.1.101.3.4.2.2", "sha384"), a("2.16.840.1.101.3.4.2.3", "sha512"), a("1.2.840.113549.2.5", "md5"), a("1.2.840.113549.1.7.1", "data"), a("1.2.840.113549.1.7.2", "signedData"), a("1.2.840.113549.1.7.3", "envelopedData"), a("1.2.840.113549.1.7.4", "signedAndEnvelopedData"), a("1.2.840.113549.1.7.5", "digestedData"), a("1.2.840.113549.1.7.6", "encryptedData"), a("1.2.840.113549.1.9.1", "emailAddress"), a("1.2.840.113549.1.9.2", "unstructuredName"), a("1.2.840.113549.1.9.3", "contentType"), a("1.2.840.113549.1.9.4", "messageDigest"), a("1.2.840.113549.1.9.5", "signingTime"), a("1.2.840.113549.1.9.6", "counterSignature"), a("1.2.840.113549.1.9.7", "challengePassword"), a("1.2.840.113549.1.9.8", "unstructuredAddress"), a("1.2.840.113549.1.9.14", "extensionRequest"), a("1.2.840.113549.1.9.20", "friendlyName"), a("1.2.840.113549.1.9.21", "localKeyId"), a("1.2.840.113549.1.9.22.1", "x509Certificate"), a("1.2.840.113549.1.12.10.1.1", "keyBag"), a("1.2.840.113549.1.12.10.1.2", "pkcs8ShroudedKeyBag"), a("1.2.840.113549.1.12.10.1.3", "certBag"), a("1.2.840.113549.1.12.10.1.4", "crlBag"), a("1.2.840.113549.1.12.10.1.5", "secretBag"), a("1.2.840.113549.1.12.10.1.6", "safeContentsBag"), a("1.2.840.113549.1.5.13", "pkcs5PBES2"), a("1.2.840.113549.1.5.12", "pkcs5PBKDF2"), a("1.2.840.113549.1.12.1.1", "pbeWithSHAAnd128BitRC4"), a("1.2.840.113549.1.12.1.2", "pbeWithSHAAnd40BitRC4"), a("1.2.840.113549.1.12.1.3", "pbeWithSHAAnd3-KeyTripleDES-CBC"), a("1.2.840.113549.1.12.1.4", "pbeWithSHAAnd2-KeyTripleDES-CBC"), a("1.2.840.113549.1.12.1.5", "pbeWithSHAAnd128BitRC2-CBC"), a("1.2.840.113549.1.12.1.6", "pbewithSHAAnd40BitRC2-CBC"), a("1.2.840.113549.2.7", "hmacWithSHA1"), a("1.2.840.113549.2.8", "hmacWithSHA224"), a("1.2.840.113549.2.9", "hmacWithSHA256"), a("1.2.840.113549.2.10", "hmacWithSHA384"), a("1.2.840.113549.2.11", "hmacWithSHA512"), a("1.2.840.113549.3.7", "des-EDE3-CBC"), a("2.16.840.1.101.3.4.1.2", "aes128-CBC"), a("2.16.840.1.101.3.4.1.22", "aes192-CBC"), a("2.16.840.1.101.3.4.1.42", "aes256-CBC"), a("2.5.4.3", "commonName"), a("2.5.4.5", "serialName"), a("2.5.4.6", "countryName"), a("2.5.4.7", "localityName"), a("2.5.4.8", "stateOrProvinceName"), a("2.5.4.9", "streetAddress"), a("2.5.4.10", "organizationName"), a("2.5.4.11", "organizationalUnitName"), a("2.5.4.13", "description"), a("2.5.4.15", "businessCategory"), a("2.5.4.17", "postalCode"), a("1.3.6.1.4.1.311.60.2.1.2", "jurisdictionOfIncorporationStateOrProvinceName"), a("1.3.6.1.4.1.311.60.2.1.3", "jurisdictionOfIncorporationCountryName"), a("2.16.840.1.113730.1.1", "nsCertType"), a("2.16.840.1.113730.1.13", "nsComment"), i("2.5.29.1", "authorityKeyIdentifier"), i("2.5.29.2", "keyAttributes"), i("2.5.29.3", "certificatePolicies"), i("2.5.29.4", "keyUsageRestriction"), i("2.5.29.5", "policyMapping"), i("2.5.29.6", "subtreesConstraint"), i("2.5.29.7", "subjectAltName"), i("2.5.29.8", "issuerAltName"), i("2.5.29.9", "subjectDirectoryAttributes"), i("2.5.29.10", "basicConstraints"), i("2.5.29.11", "nameConstraints"), i("2.5.29.12", "policyConstraints"), i("2.5.29.13", "basicConstraints"), a("2.5.29.14", "subjectKeyIdentifier"), a("2.5.29.15", "keyUsage"), i("2.5.29.16", "privateKeyUsagePeriod"), a("2.5.29.17", "subjectAltName"), a("2.5.29.18", "issuerAltName"), a("2.5.29.19", "basicConstraints"), i("2.5.29.20", "cRLNumber"), i("2.5.29.21", "cRLReason"), i("2.5.29.22", "expirationDate"), i("2.5.29.23", "instructionCode"), i("2.5.29.24", "invalidityDate"), i("2.5.29.25", "cRLDistributionPoints"), i("2.5.29.26", "issuingDistributionPoint"), i("2.5.29.27", "deltaCRLIndicator"), i("2.5.29.28", "issuingDistributionPoint"), i("2.5.29.29", "certificateIssuer"), i("2.5.29.30", "nameConstraints"), a("2.5.29.31", "cRLDistributionPoints"), a("2.5.29.32", "certificatePolicies"), i("2.5.29.33", "policyMappings"), i("2.5.29.34", "policyConstraints"), a("2.5.29.35", "authorityKeyIdentifier"), i("2.5.29.36", "policyConstraints"), a("2.5.29.37", "extKeyUsage"), i("2.5.29.46", "freshestCRL"), i("2.5.29.54", "inhibitAnyPolicy"), a("1.3.6.1.4.1.11129.2.4.2", "timestampList"), a("1.3.6.1.5.5.7.1.1", "authorityInfoAccess"), a("1.3.6.1.5.5.7.3.1", "serverAuth"), a("1.3.6.1.5.5.7.3.2", "clientAuth"), a("1.3.6.1.5.5.7.3.3", "codeSigning"), a("1.3.6.1.5.5.7.3.4", "emailProtection"), a("1.3.6.1.5.5.7.3.8", "timeStamping"); }, function (t, e, r) { var a = r(0); t.exports = a.md = a.md || {}, a.md.algorithms = a.md.algorithms || {}; }, function (t, e, r) { var a = r(0); r(6), r(16), r(25), r(1), function () { if (a.random && a.random.getBytes)
        return void (t.exports = a.random); !function (e) { function r() { var t = a.prng.create(i); return t.getBytes = function (e, r) { return t.generate(e, r); }, t.getBytesSync = function (e) { return t.generate(e); }, t; } var i = {}, n = new Array(4), s = a.util.createBuffer(); i.formatKey = function (t) { var e = a.util.createBuffer(t); return t = new Array(4), t[0] = e.getInt32(), t[1] = e.getInt32(), t[2] = e.getInt32(), t[3] = e.getInt32(), a.aes._expandKey(t, !1); }, i.formatSeed = function (t) { var e = a.util.createBuffer(t); return t = new Array(4), t[0] = e.getInt32(), t[1] = e.getInt32(), t[2] = e.getInt32(), t[3] = e.getInt32(), t; }, i.cipher = function (t, e) { return a.aes._updateBlock(t, e, n, !1), s.putInt32(n[0]), s.putInt32(n[1]), s.putInt32(n[2]), s.putInt32(n[3]), s.getBytes(); }, i.increment = function (t) { return ++t[3], t; }, i.md = a.md.sha256; var o = r(), u = null, c = a.util.globalScope, l = c.crypto || c.msCrypto; if (l && l.getRandomValues && (u = function (t) { return l.getRandomValues(t); }), a.options.usePureJavaScript || !a.util.isNodejs && !u) {
        if ("undefined" == typeof window || window.document, o.collectInt(+new Date, 32), "undefined" != typeof navigator) {
            var h = "";
            for (var p in navigator)
                try {
                    "string" == typeof navigator[p] && (h += navigator[p]);
                }
                catch (t) { }
            o.collect(h), h = null;
        }
        e && (e().mousemove(function (t) { o.collectInt(t.clientX, 16), o.collectInt(t.clientY, 16); }), e().keypress(function (t) { o.collectInt(t.charCode, 8); }));
    } if (a.random)
        for (var p in o)
            a.random[p] = o[p];
    else
        a.random = o; a.random.createInstance = r, t.exports = a.random; }("undefined" != typeof jQuery ? jQuery : null); }(); }, function (t, e, r) { function a(t, e) { var r = function () { return new u.aes.Algorithm(t, e); }; u.cipher.registerAlgorithm(t, r); } function i() { d = !0, h = [0, 1, 2, 4, 8, 16, 32, 64, 128, 27, 54]; for (var t = new Array(256), e = 0; e < 128; ++e)
        t[e] = e << 1, t[e + 128] = e + 128 << 1 ^ 283; c = new Array(256), l = new Array(256), p = new Array(4), f = new Array(4); for (var e = 0; e < 4; ++e)
        p[e] = new Array(256), f[e] = new Array(256); for (var r, a, i, n, s, o, u, y = 0, g = 0, e = 0; e < 256; ++e) {
        n = g ^ g << 1 ^ g << 2 ^ g << 3 ^ g << 4, n = n >> 8 ^ 255 & n ^ 99, c[y] = n, l[n] = y, s = t[n], r = t[y], a = t[r], i = t[a], o = s << 24 ^ n << 16 ^ n << 8 ^ n ^ s, u = (r ^ a ^ i) << 24 ^ (y ^ i) << 16 ^ (y ^ a ^ i) << 8 ^ y ^ r ^ i;
        for (var m = 0; m < 4; ++m)
            p[m][y] = o, f[m][n] = u, o = o << 24 | o >>> 8, u = u << 24 | u >>> 8;
        0 === y ? y = g = 1 : (y = r ^ t[t[t[r ^ i]]], g ^= t[t[g]]);
    } } function n(t, e) { for (var r, a = t.slice(0), i = 1, n = a.length, s = n + 6 + 1, o = y * s, u = n; u < o; ++u)
        r = a[u - 1], u % n == 0 ? (r = c[r >>> 16 & 255] << 24 ^ c[r >>> 8 & 255] << 16 ^ c[255 & r] << 8 ^ c[r >>> 24] ^ h[i] << 24, i++) : n > 6 && u % n == 4 && (r = c[r >>> 24] << 24 ^ c[r >>> 16 & 255] << 16 ^ c[r >>> 8 & 255] << 8 ^ c[255 & r]), a[u] = a[u - n] ^ r; if (e) {
        var l, p = f[0], d = f[1], g = f[2], m = f[3], v = a.slice(0);
        o = a.length;
        for (var u = 0, C = o - y; u < o; u += y, C -= y)
            if (0 === u || u === o - y)
                v[u] = a[C], v[u + 1] = a[C + 3], v[u + 2] = a[C + 2], v[u + 3] = a[C + 1];
            else
                for (var E = 0; E < y; ++E)
                    l = a[C + E], v[u + (3 & -E)] = p[c[l >>> 24]] ^ d[c[l >>> 16 & 255]] ^ g[c[l >>> 8 & 255]] ^ m[c[255 & l]];
        a = v;
    } return a; } function s(t, e, r, a) { var i, n, s, o, u, h = t.length / 4 - 1; a ? (i = f[0], n = f[1], s = f[2], o = f[3], u = l) : (i = p[0], n = p[1], s = p[2], o = p[3], u = c); var d, y, g, m, v, C, E; d = e[0] ^ t[0], y = e[a ? 3 : 1] ^ t[1], g = e[2] ^ t[2], m = e[a ? 1 : 3] ^ t[3]; for (var S = 3, T = 1; T < h; ++T)
        v = i[d >>> 24] ^ n[y >>> 16 & 255] ^ s[g >>> 8 & 255] ^ o[255 & m] ^ t[++S], C = i[y >>> 24] ^ n[g >>> 16 & 255] ^ s[m >>> 8 & 255] ^ o[255 & d] ^ t[++S], E = i[g >>> 24] ^ n[m >>> 16 & 255] ^ s[d >>> 8 & 255] ^ o[255 & y] ^ t[++S], m = i[m >>> 24] ^ n[d >>> 16 & 255] ^ s[y >>> 8 & 255] ^ o[255 & g] ^ t[++S], d = v, y = C, g = E; r[0] = u[d >>> 24] << 24 ^ u[y >>> 16 & 255] << 16 ^ u[g >>> 8 & 255] << 8 ^ u[255 & m] ^ t[++S], r[a ? 3 : 1] = u[y >>> 24] << 24 ^ u[g >>> 16 & 255] << 16 ^ u[m >>> 8 & 255] << 8 ^ u[255 & d] ^ t[++S], r[2] = u[g >>> 24] << 24 ^ u[m >>> 16 & 255] << 16 ^ u[d >>> 8 & 255] << 8 ^ u[255 & y] ^ t[++S], r[a ? 1 : 3] = u[m >>> 24] << 24 ^ u[d >>> 16 & 255] << 16 ^ u[y >>> 8 & 255] << 8 ^ u[255 & g] ^ t[++S]; } function o(t) { t = t || {}; var e, r = (t.mode || "CBC").toUpperCase(), a = "AES-" + r; e = t.decrypt ? u.cipher.createDecipher(a, t.key) : u.cipher.createCipher(a, t.key); var i = e.start; return e.start = function (t, r) { var a = null; r instanceof u.util.ByteBuffer && (a = r, r = {}), r = r || {}, r.output = a, r.iv = t, i.call(e, r); }, e; } var u = r(0); r(8), r(9), r(1), t.exports = u.aes = u.aes || {}, u.aes.startEncrypting = function (t, e, r, a) { var i = o({ key: t, output: r, decrypt: !1, mode: a }); return i.start(e), i; }, u.aes.createEncryptionCipher = function (t, e) { return o({ key: t, output: null, decrypt: !1, mode: e }); }, u.aes.startDecrypting = function (t, e, r, a) { var i = o({ key: t, output: r, decrypt: !0, mode: a }); return i.start(e), i; }, u.aes.createDecryptionCipher = function (t, e) { return o({ key: t, output: null, decrypt: !0, mode: e }); }, u.aes.Algorithm = function (t, e) { d || i(); var r = this; r.name = t, r.mode = new e({ blockSize: 16, cipher: { encrypt: function (t, e) { return s(r._w, t, e, !1); }, decrypt: function (t, e) { return s(r._w, t, e, !0); } } }), r._init = !1; }, u.aes.Algorithm.prototype.initialize = function (t) { if (!this._init) {
        var e, r = t.key;
        if ("string" != typeof r || 16 !== r.length && 24 !== r.length && 32 !== r.length) {
            if (u.util.isArray(r) && (16 === r.length || 24 === r.length || 32 === r.length)) {
                e = r, r = u.util.createBuffer();
                for (var a = 0; a < e.length; ++a)
                    r.putByte(e[a]);
            }
        }
        else
            r = u.util.createBuffer(r);
        if (!u.util.isArray(r)) {
            e = r, r = [];
            var i = e.length();
            if (16 === i || 24 === i || 32 === i) {
                i >>>= 2;
                for (var a = 0; a < i; ++a)
                    r.push(e.getInt32());
            }
        }
        if (!u.util.isArray(r) || 4 !== r.length && 6 !== r.length && 8 !== r.length)
            throw new Error("Invalid key parameter.");
        var s = this.mode.name, o = -1 !== ["CFB", "OFB", "CTR", "GCM"].indexOf(s);
        this._w = n(r, t.decrypt && !o), this._init = !0;
    } }, u.aes._expandKey = function (t, e) { return d || i(), n(t, e); }, u.aes._updateBlock = s, a("AES-ECB", u.cipher.modes.ecb), a("AES-CBC", u.cipher.modes.cbc), a("AES-CFB", u.cipher.modes.cfb), a("AES-OFB", u.cipher.modes.ofb), a("AES-CTR", u.cipher.modes.ctr), a("AES-GCM", u.cipher.modes.gcm); var c, l, h, p, f, d = !1, y = 4; }, function (t, e, r) { function a(t, e, r) { var a = p.util.createBuffer(), i = Math.ceil(e.n.bitLength() / 8); if (t.length > i - 11) {
        var n = new Error("Message is too long for PKCS#1 v1.5 padding.");
        throw n.length = t.length, n.max = i - 11, n;
    } a.putByte(0), a.putByte(r); var s, o = i - 3 - t.length; if (0 === r || 1 === r) {
        s = 0 === r ? 0 : 255;
        for (var u = 0; u < o; ++u)
            a.putByte(s);
    }
    else
        for (; o > 0;) {
            for (var c = 0, l = p.random.getBytes(o), u = 0; u < o; ++u)
                s = l.charCodeAt(u), 0 === s ? ++c : a.putByte(s);
            o = c;
        } return a.putByte(0), a.putBytes(t), a; } function i(t, e, r, a) { var i = Math.ceil(e.n.bitLength() / 8), n = p.util.createBuffer(t), s = n.getByte(), o = n.getByte(); if (0 !== s || r && 0 !== o && 1 !== o || !r && 2 != o || r && 0 === o && void 0 === a)
        throw new Error("Encryption block is invalid."); var u = 0; if (0 === o) {
        u = i - 3 - a;
        for (var c = 0; c < u; ++c)
            if (0 !== n.getByte())
                throw new Error("Encryption block is invalid.");
    }
    else if (1 === o)
        for (u = 0; n.length() > 1;) {
            if (255 !== n.getByte()) {
                --n.read;
                break;
            }
            ++u;
        }
    else if (2 === o)
        for (u = 0; n.length() > 1;) {
            if (0 === n.getByte()) {
                --n.read;
                break;
            }
            ++u;
        } if (0 !== n.getByte() || u !== i - 3 - n.length())
        throw new Error("Encryption block is invalid."); return n.getBytes(); } function n(t, e, r) { function a() { i(t.pBits, function (e, a) { return e ? r(e) : (t.p = a, null !== t.q ? n(e, t.q) : void i(t.qBits, n)); }); } function i(t, e) { p.prime.generateProbablePrime(t, s, e); } function n(e, s) { if (e)
        return r(e); if (t.q = s, t.p.compareTo(t.q) < 0) {
        var o = t.p;
        t.p = t.q, t.q = o;
    } if (0 !== t.p.subtract(f.ONE).gcd(t.e).compareTo(f.ONE))
        return t.p = null, void a(); if (0 !== t.q.subtract(f.ONE).gcd(t.e).compareTo(f.ONE))
        return t.q = null, void i(t.qBits, n); if (t.p1 = t.p.subtract(f.ONE), t.q1 = t.q.subtract(f.ONE), t.phi = t.p1.multiply(t.q1), 0 !== t.phi.gcd(t.e).compareTo(f.ONE))
        return t.p = t.q = null, void a(); if (t.n = t.p.multiply(t.q), t.n.bitLength() !== t.bits)
        return t.q = null, void i(t.qBits, n); var u = t.e.modInverse(t.phi); t.keys = { privateKey: m.rsa.setPrivateKey(t.n, t.e, u, t.p, t.q, u.mod(t.p1), u.mod(t.q1), t.q.modInverse(t.p)), publicKey: m.rsa.setPublicKey(t.n, t.e) }, r(null, t.keys); } "function" == typeof e && (r = e, e = {}), e = e || {}; var s = { algorithm: { name: e.algorithm || "PRIMEINC", options: { workers: e.workers || 2, workLoad: e.workLoad || 100, workerScript: e.workerScript } } }; "prng" in e && (s.prng = e.prng), a(); } function s(t) { var e = t.toString(16); e[0] >= "8" && (e = "00" + e); var r = p.util.hexToBytes(e); return r.length > 1 && (0 === r.charCodeAt(0) && 0 == (128 & r.charCodeAt(1)) || 255 === r.charCodeAt(0) && 128 == (128 & r.charCodeAt(1))) ? r.substr(1) : r; } function o(t) { return t <= 100 ? 27 : t <= 150 ? 18 : t <= 200 ? 15 : t <= 250 ? 12 : t <= 300 ? 9 : t <= 350 ? 8 : t <= 400 ? 7 : t <= 500 ? 6 : t <= 600 ? 5 : t <= 800 ? 4 : t <= 1250 ? 3 : 2; } function u(t) { return p.util.isNodejs && "function" == typeof d[t]; } function c(t) { return void 0 !== g.globalScope && "object" == typeof g.globalScope.crypto && "object" == typeof g.globalScope.crypto.subtle && "function" == typeof g.globalScope.crypto.subtle[t]; } function l(t) { return void 0 !== g.globalScope && "object" == typeof g.globalScope.msCrypto && "object" == typeof g.globalScope.msCrypto.subtle && "function" == typeof g.globalScope.msCrypto.subtle[t]; } function h(t) { for (var e = p.util.hexToBytes(t.toString(16)), r = new Uint8Array(e.length), a = 0; a < e.length; ++a)
        r[a] = e.charCodeAt(a); return r; } var p = r(0); if (r(2), r(17), r(3), r(27), r(28), r(5), r(1), void 0 === f)
        var f = p.jsbn.BigInteger; var d = p.util.isNodejs ? r(11) : null, y = p.asn1, g = p.util; p.pki = p.pki || {}, t.exports = p.pki.rsa = p.rsa = p.rsa || {}; var m = p.pki, v = [6, 4, 2, 4, 2, 4, 6, 2], C = { name: "PrivateKeyInfo", tagClass: y.Class.UNIVERSAL, type: y.Type.SEQUENCE, constructed: !0, value: [{ name: "PrivateKeyInfo.version", tagClass: y.Class.UNIVERSAL, type: y.Type.INTEGER, constructed: !1, capture: "privateKeyVersion" }, { name: "PrivateKeyInfo.privateKeyAlgorithm", tagClass: y.Class.UNIVERSAL, type: y.Type.SEQUENCE, constructed: !0, value: [{ name: "AlgorithmIdentifier.algorithm", tagClass: y.Class.UNIVERSAL, type: y.Type.OID, constructed: !1, capture: "privateKeyOid" }] }, { name: "PrivateKeyInfo", tagClass: y.Class.UNIVERSAL, type: y.Type.OCTETSTRING, constructed: !1, capture: "privateKey" }] }, E = { name: "RSAPrivateKey", tagClass: y.Class.UNIVERSAL, type: y.Type.SEQUENCE, constructed: !0, value: [{ name: "RSAPrivateKey.version", tagClass: y.Class.UNIVERSAL, type: y.Type.INTEGER, constructed: !1, capture: "privateKeyVersion" }, { name: "RSAPrivateKey.modulus", tagClass: y.Class.UNIVERSAL, type: y.Type.INTEGER, constructed: !1, capture: "privateKeyModulus" }, { name: "RSAPrivateKey.publicExponent", tagClass: y.Class.UNIVERSAL, type: y.Type.INTEGER, constructed: !1, capture: "privateKeyPublicExponent" }, { name: "RSAPrivateKey.privateExponent", tagClass: y.Class.UNIVERSAL, type: y.Type.INTEGER, constructed: !1, capture: "privateKeyPrivateExponent" }, { name: "RSAPrivateKey.prime1", tagClass: y.Class.UNIVERSAL, type: y.Type.INTEGER, constructed: !1, capture: "privateKeyPrime1" }, { name: "RSAPrivateKey.prime2", tagClass: y.Class.UNIVERSAL, type: y.Type.INTEGER, constructed: !1, capture: "privateKeyPrime2" }, { name: "RSAPrivateKey.exponent1", tagClass: y.Class.UNIVERSAL, type: y.Type.INTEGER, constructed: !1, capture: "privateKeyExponent1" }, { name: "RSAPrivateKey.exponent2", tagClass: y.Class.UNIVERSAL, type: y.Type.INTEGER, constructed: !1, capture: "privateKeyExponent2" }, { name: "RSAPrivateKey.coefficient", tagClass: y.Class.UNIVERSAL, type: y.Type.INTEGER, constructed: !1, capture: "privateKeyCoefficient" }] }, S = { name: "RSAPublicKey", tagClass: y.Class.UNIVERSAL, type: y.Type.SEQUENCE, constructed: !0, value: [{ name: "RSAPublicKey.modulus", tagClass: y.Class.UNIVERSAL, type: y.Type.INTEGER, constructed: !1, capture: "publicKeyModulus" }, { name: "RSAPublicKey.exponent", tagClass: y.Class.UNIVERSAL, type: y.Type.INTEGER, constructed: !1, capture: "publicKeyExponent" }] }, T = p.pki.rsa.publicKeyValidator = { name: "SubjectPublicKeyInfo", tagClass: y.Class.UNIVERSAL, type: y.Type.SEQUENCE, constructed: !0, captureAsn1: "subjectPublicKeyInfo", value: [{ name: "SubjectPublicKeyInfo.AlgorithmIdentifier", tagClass: y.Class.UNIVERSAL, type: y.Type.SEQUENCE, constructed: !0, value: [{ name: "AlgorithmIdentifier.algorithm", tagClass: y.Class.UNIVERSAL, type: y.Type.OID, constructed: !1, capture: "publicKeyOid" }] }, { name: "SubjectPublicKeyInfo.subjectPublicKey", tagClass: y.Class.UNIVERSAL, type: y.Type.BITSTRING, constructed: !1, value: [{ name: "SubjectPublicKeyInfo.subjectPublicKey.RSAPublicKey", tagClass: y.Class.UNIVERSAL, type: y.Type.SEQUENCE, constructed: !0, optional: !0, captureAsn1: "rsaPublicKey" }] }] }, I = function (t) { var e; if (!(t.algorithm in m.oids)) {
        var r = new Error("Unknown message digest algorithm.");
        throw r.algorithm = t.algorithm, r;
    } e = m.oids[t.algorithm]; var a = y.oidToDer(e).getBytes(), i = y.create(y.Class.UNIVERSAL, y.Type.SEQUENCE, !0, []), n = y.create(y.Class.UNIVERSAL, y.Type.SEQUENCE, !0, []); n.value.push(y.create(y.Class.UNIVERSAL, y.Type.OID, !1, a)), n.value.push(y.create(y.Class.UNIVERSAL, y.Type.NULL, !1, "")); var s = y.create(y.Class.UNIVERSAL, y.Type.OCTETSTRING, !1, t.digest().getBytes()); return i.value.push(n), i.value.push(s), y.toDer(i).getBytes(); }, b = function (t, e, r) { if (r)
        return t.modPow(e.e, e.n); if (!e.p || !e.q)
        return t.modPow(e.d, e.n); e.dP || (e.dP = e.d.mod(e.p.subtract(f.ONE))), e.dQ || (e.dQ = e.d.mod(e.q.subtract(f.ONE))), e.qInv || (e.qInv = e.q.modInverse(e.p)); var a; do {
        a = new f(p.util.bytesToHex(p.random.getBytes(e.n.bitLength() / 8)), 16);
    } while (a.compareTo(e.n) >= 0 || !a.gcd(e.n).equals(f.ONE)); t = t.multiply(a.modPow(e.e, e.n)).mod(e.n); for (var i = t.mod(e.p).modPow(e.dP, e.p), n = t.mod(e.q).modPow(e.dQ, e.q); i.compareTo(n) < 0;)
        i = i.add(e.p); var s = i.subtract(n).multiply(e.qInv).mod(e.p).multiply(e.q).add(n); return s = s.multiply(a.modInverse(e.n)).mod(e.n); }; m.rsa.encrypt = function (t, e, r) { var i, n = r, s = Math.ceil(e.n.bitLength() / 8); !1 !== r && !0 !== r ? (n = 2 === r, i = a(t, e, r)) : (i = p.util.createBuffer(), i.putBytes(t)); for (var o = new f(i.toHex(), 16), u = b(o, e, n), c = u.toString(16), l = p.util.createBuffer(), h = s - Math.ceil(c.length / 2); h > 0;)
        l.putByte(0), --h; return l.putBytes(p.util.hexToBytes(c)), l.getBytes(); }, m.rsa.decrypt = function (t, e, r, a) { var n = Math.ceil(e.n.bitLength() / 8); if (t.length !== n) {
        var s = new Error("Encrypted message length is invalid.");
        throw s.length = t.length, s.expected = n, s;
    } var o = new f(p.util.createBuffer(t).toHex(), 16); if (o.compareTo(e.n) >= 0)
        throw new Error("Encrypted message is invalid."); for (var u = b(o, e, r), c = u.toString(16), l = p.util.createBuffer(), h = n - Math.ceil(c.length / 2); h > 0;)
        l.putByte(0), --h; return l.putBytes(p.util.hexToBytes(c)), !1 !== a ? i(l.getBytes(), e, r) : l.getBytes(); }, m.rsa.createKeyPairGenerationState = function (t, e, r) { "string" == typeof t && (t = parseInt(t, 10)), t = t || 2048, r = r || {}; var a, i = r.prng || p.random, n = { nextBytes: function (t) { for (var e = i.getBytesSync(t.length), r = 0; r < t.length; ++r)
            t[r] = e.charCodeAt(r); } }, s = r.algorithm || "PRIMEINC"; if ("PRIMEINC" !== s)
        throw new Error("Invalid key generation algorithm: " + s); return a = { algorithm: s, state: 0, bits: t, rng: n, eInt: e || 65537, e: new f(null), p: null, q: null, qBits: t >> 1, pBits: t - (t >> 1), pqState: 0, num: null, keys: null }, a.e.fromInt(a.eInt), a; }, m.rsa.stepKeyPairGenerationState = function (t, e) { "algorithm" in t || (t.algorithm = "PRIMEINC"); var r = new f(null); r.fromInt(30); for (var a, i = 0, n = function (t, e) { return t | e; }, s = +new Date, u = 0; null === t.keys && (e <= 0 || u < e);) {
        if (0 === t.state) {
            var c = null === t.p ? t.pBits : t.qBits, l = c - 1;
            0 === t.pqState ? (t.num = new f(c, t.rng), t.num.testBit(l) || t.num.bitwiseTo(f.ONE.shiftLeft(l), n, t.num), t.num.dAddOffset(31 - t.num.mod(r).byteValue(), 0), i = 0, ++t.pqState) : 1 === t.pqState ? t.num.bitLength() > c ? t.pqState = 0 : t.num.isProbablePrime(o(t.num.bitLength())) ? ++t.pqState : t.num.dAddOffset(v[i++ % 8], 0) : 2 === t.pqState ? t.pqState = 0 === t.num.subtract(f.ONE).gcd(t.e).compareTo(f.ONE) ? 3 : 0 : 3 === t.pqState && (t.pqState = 0, null === t.p ? t.p = t.num : t.q = t.num, null !== t.p && null !== t.q && ++t.state, t.num = null);
        }
        else if (1 === t.state)
            t.p.compareTo(t.q) < 0 && (t.num = t.p, t.p = t.q, t.q = t.num), ++t.state;
        else if (2 === t.state)
            t.p1 = t.p.subtract(f.ONE), t.q1 = t.q.subtract(f.ONE), t.phi = t.p1.multiply(t.q1), ++t.state;
        else if (3 === t.state)
            0 === t.phi.gcd(t.e).compareTo(f.ONE) ? ++t.state : (t.p = null, t.q = null, t.state = 0);
        else if (4 === t.state)
            t.n = t.p.multiply(t.q), t.n.bitLength() === t.bits ? ++t.state : (t.q = null, t.state = 0);
        else if (5 === t.state) {
            var h = t.e.modInverse(t.phi);
            t.keys = { privateKey: m.rsa.setPrivateKey(t.n, t.e, h, t.p, t.q, h.mod(t.p1), h.mod(t.q1), t.q.modInverse(t.p)), publicKey: m.rsa.setPublicKey(t.n, t.e) };
        }
        a = +new Date, u += a - s, s = a;
    } return null !== t.keys; }, m.rsa.generateKeyPair = function (t, e, r, a) { if (1 === arguments.length ? "object" == typeof t ? (r = t, t = void 0) : "function" == typeof t && (a = t, t = void 0) : 2 === arguments.length ? "number" == typeof t ? "function" == typeof e ? (a = e, e = void 0) : "number" != typeof e && (r = e, e = void 0) : (r = t, a = e, t = void 0, e = void 0) : 3 === arguments.length && ("number" == typeof e ? "function" == typeof r && (a = r, r = void 0) : (a = r, r = e, e = void 0)), r = r || {}, void 0 === t && (t = r.bits || 2048), void 0 === e && (e = r.e || 65537), !p.options.usePureJavaScript && !r.prng && t >= 256 && t <= 16384 && (65537 === e || 3 === e))
        if (a) {
            if (u("generateKeyPair"))
                return d.generateKeyPair("rsa", { modulusLength: t, publicExponent: e, publicKeyEncoding: { type: "spki", format: "pem" }, privateKeyEncoding: { type: "pkcs8", format: "pem" } }, function (t, e, r) { if (t)
                    return a(t); a(null, { privateKey: m.privateKeyFromPem(r), publicKey: m.publicKeyFromPem(e) }); });
            if (c("generateKey") && c("exportKey"))
                return g.globalScope.crypto.subtle.generateKey({ name: "RSASSA-PKCS1-v1_5", modulusLength: t, publicExponent: h(e), hash: { name: "SHA-256" } }, !0, ["sign", "verify"]).then(function (t) { return g.globalScope.crypto.subtle.exportKey("pkcs8", t.privateKey); }).then(void 0, function (t) { a(t); }).then(function (t) { if (t) {
                    var e = m.privateKeyFromAsn1(y.fromDer(p.util.createBuffer(t)));
                    a(null, { privateKey: e, publicKey: m.setRsaPublicKey(e.n, e.e) });
                } });
            if (l("generateKey") && l("exportKey")) {
                var i = g.globalScope.msCrypto.subtle.generateKey({ name: "RSASSA-PKCS1-v1_5", modulusLength: t, publicExponent: h(e), hash: { name: "SHA-256" } }, !0, ["sign", "verify"]);
                return i.oncomplete = function (t) { var e = t.target.result, r = g.globalScope.msCrypto.subtle.exportKey("pkcs8", e.privateKey); r.oncomplete = function (t) { var e = t.target.result, r = m.privateKeyFromAsn1(y.fromDer(p.util.createBuffer(e))); a(null, { privateKey: r, publicKey: m.setRsaPublicKey(r.n, r.e) }); }, r.onerror = function (t) { a(t); }; }, void (i.onerror = function (t) { a(t); });
            }
        }
        else if (u("generateKeyPairSync")) {
            var s = d.generateKeyPairSync("rsa", { modulusLength: t, publicExponent: e, publicKeyEncoding: { type: "spki", format: "pem" }, privateKeyEncoding: { type: "pkcs8", format: "pem" } });
            return { privateKey: m.privateKeyFromPem(s.privateKey), publicKey: m.publicKeyFromPem(s.publicKey) };
        } var o = m.rsa.createKeyPairGenerationState(t, e, r); if (!a)
        return m.rsa.stepKeyPairGenerationState(o, 0), o.keys; n(o, r, a); }, m.setRsaPublicKey = m.rsa.setPublicKey = function (t, e) { var r = { n: t, e: e }; return r.encrypt = function (t, e, i) { if ("string" == typeof e ? e = e.toUpperCase() : void 0 === e && (e = "RSAES-PKCS1-V1_5"), "RSAES-PKCS1-V1_5" === e)
        e = { encode: function (t, e, r) { return a(t, e, 2).getBytes(); } };
    else if ("RSA-OAEP" === e || "RSAES-OAEP" === e)
        e = { encode: function (t, e) { return p.pkcs1.encode_rsa_oaep(e, t, i); } };
    else if (-1 !== ["RAW", "NONE", "NULL", null].indexOf(e))
        e = { encode: function (t) { return t; } };
    else if ("string" == typeof e)
        throw new Error('Unsupported encryption scheme: "' + e + '".'); var n = e.encode(t, r, !0); return m.rsa.encrypt(n, r, !0); }, r.verify = function (t, e, a) { "string" == typeof a ? a = a.toUpperCase() : void 0 === a && (a = "RSASSA-PKCS1-V1_5"), "RSASSA-PKCS1-V1_5" === a ? a = { verify: function (t, e) { return e = i(e, r, !0), t === y.fromDer(e).value[1].value; } } : "NONE" !== a && "NULL" !== a && null !== a || (a = { verify: function (t, e) { return e = i(e, r, !0), t === e; } }); var n = m.rsa.decrypt(e, r, !0, !1); return a.verify(t, n, r.n.bitLength()); }, r; }, m.setRsaPrivateKey = m.rsa.setPrivateKey = function (t, e, r, a, n, s, o, u) { var c = { n: t, e: e, d: r, p: a, q: n, dP: s, dQ: o, qInv: u }; return c.decrypt = function (t, e, r) { "string" == typeof e ? e = e.toUpperCase() : void 0 === e && (e = "RSAES-PKCS1-V1_5"); var a = m.rsa.decrypt(t, c, !1, !1); if ("RSAES-PKCS1-V1_5" === e)
        e = { decode: i };
    else if ("RSA-OAEP" === e || "RSAES-OAEP" === e)
        e = { decode: function (t, e) { return p.pkcs1.decode_rsa_oaep(e, t, r); } };
    else {
        if (-1 === ["RAW", "NONE", "NULL", null].indexOf(e))
            throw new Error('Unsupported encryption scheme: "' + e + '".');
        e = { decode: function (t) { return t; } };
    } return e.decode(a, c, !1); }, c.sign = function (t, e) { var r = !1; "string" == typeof e && (e = e.toUpperCase()), void 0 === e || "RSASSA-PKCS1-V1_5" === e ? (e = { encode: I }, r = 1) : "NONE" !== e && "NULL" !== e && null !== e || (e = { encode: function () { return t; } }, r = 1); var a = e.encode(t, c.n.bitLength()); return m.rsa.encrypt(a, c, r); }, c; }, m.wrapRsaPrivateKey = function (t) { return y.create(y.Class.UNIVERSAL, y.Type.SEQUENCE, !0, [y.create(y.Class.UNIVERSAL, y.Type.INTEGER, !1, y.integerToDer(0).getBytes()), y.create(y.Class.UNIVERSAL, y.Type.SEQUENCE, !0, [y.create(y.Class.UNIVERSAL, y.Type.OID, !1, y.oidToDer(m.oids.rsaEncryption).getBytes()), y.create(y.Class.UNIVERSAL, y.Type.NULL, !1, "")]), y.create(y.Class.UNIVERSAL, y.Type.OCTETSTRING, !1, y.toDer(t).getBytes())]); }, m.privateKeyFromAsn1 = function (t) { var e = {}, r = []; if (y.validate(t, C, e, r) && (t = y.fromDer(p.util.createBuffer(e.privateKey))), e = {}, r = [], !y.validate(t, E, e, r)) {
        var a = new Error("Cannot read private key. ASN.1 object does not contain an RSAPrivateKey.");
        throw a.errors = r, a;
    } var i, n, s, o, u, c, l, h; return i = p.util.createBuffer(e.privateKeyModulus).toHex(), n = p.util.createBuffer(e.privateKeyPublicExponent).toHex(), s = p.util.createBuffer(e.privateKeyPrivateExponent).toHex(), o = p.util.createBuffer(e.privateKeyPrime1).toHex(), u = p.util.createBuffer(e.privateKeyPrime2).toHex(), c = p.util.createBuffer(e.privateKeyExponent1).toHex(), l = p.util.createBuffer(e.privateKeyExponent2).toHex(), h = p.util.createBuffer(e.privateKeyCoefficient).toHex(), m.setRsaPrivateKey(new f(i, 16), new f(n, 16), new f(s, 16), new f(o, 16), new f(u, 16), new f(c, 16), new f(l, 16), new f(h, 16)); }, m.privateKeyToAsn1 = m.privateKeyToRSAPrivateKey = function (t) { return y.create(y.Class.UNIVERSAL, y.Type.SEQUENCE, !0, [y.create(y.Class.UNIVERSAL, y.Type.INTEGER, !1, y.integerToDer(0).getBytes()), y.create(y.Class.UNIVERSAL, y.Type.INTEGER, !1, s(t.n)), y.create(y.Class.UNIVERSAL, y.Type.INTEGER, !1, s(t.e)), y.create(y.Class.UNIVERSAL, y.Type.INTEGER, !1, s(t.d)), y.create(y.Class.UNIVERSAL, y.Type.INTEGER, !1, s(t.p)), y.create(y.Class.UNIVERSAL, y.Type.INTEGER, !1, s(t.q)), y.create(y.Class.UNIVERSAL, y.Type.INTEGER, !1, s(t.dP)), y.create(y.Class.UNIVERSAL, y.Type.INTEGER, !1, s(t.dQ)), y.create(y.Class.UNIVERSAL, y.Type.INTEGER, !1, s(t.qInv))]); }, m.publicKeyFromAsn1 = function (t) { var e = {}, r = []; if (y.validate(t, T, e, r)) {
        var a = y.derToOid(e.publicKeyOid);
        if (a !== m.oids.rsaEncryption) {
            var i = new Error("Cannot read public key. Unknown OID.");
            throw i.oid = a, i;
        }
        t = e.rsaPublicKey;
    } if (r = [], !y.validate(t, S, e, r)) {
        var i = new Error("Cannot read public key. ASN.1 object does not contain an RSAPublicKey.");
        throw i.errors = r, i;
    } var n = p.util.createBuffer(e.publicKeyModulus).toHex(), s = p.util.createBuffer(e.publicKeyExponent).toHex(); return m.setRsaPublicKey(new f(n, 16), new f(s, 16)); }, m.publicKeyToAsn1 = m.publicKeyToSubjectPublicKeyInfo = function (t) { return y.create(y.Class.UNIVERSAL, y.Type.SEQUENCE, !0, [y.create(y.Class.UNIVERSAL, y.Type.SEQUENCE, !0, [y.create(y.Class.UNIVERSAL, y.Type.OID, !1, y.oidToDer(m.oids.rsaEncryption).getBytes()), y.create(y.Class.UNIVERSAL, y.Type.NULL, !1, "")]), y.create(y.Class.UNIVERSAL, y.Type.BITSTRING, !1, [m.publicKeyToRSAPublicKey(t)])]); }, m.publicKeyToRSAPublicKey = function (t) { return y.create(y.Class.UNIVERSAL, y.Type.SEQUENCE, !0, [y.create(y.Class.UNIVERSAL, y.Type.INTEGER, !1, s(t.n)), y.create(y.Class.UNIVERSAL, y.Type.INTEGER, !1, s(t.e))]); }; }, function (t, e, r) { var a = r(0); r(1), t.exports = a.cipher = a.cipher || {}, a.cipher.algorithms = a.cipher.algorithms || {}, a.cipher.createCipher = function (t, e) { var r = t; if ("string" == typeof r && (r = a.cipher.getAlgorithm(r)) && (r = r()), !r)
        throw new Error("Unsupported algorithm: " + t); return new a.cipher.BlockCipher({ algorithm: r, key: e, decrypt: !1 }); }, a.cipher.createDecipher = function (t, e) { var r = t; if ("string" == typeof r && (r = a.cipher.getAlgorithm(r)) && (r = r()), !r)
        throw new Error("Unsupported algorithm: " + t); return new a.cipher.BlockCipher({ algorithm: r, key: e, decrypt: !0 }); }, a.cipher.registerAlgorithm = function (t, e) { t = t.toUpperCase(), a.cipher.algorithms[t] = e; }, a.cipher.getAlgorithm = function (t) { return t = t.toUpperCase(), t in a.cipher.algorithms ? a.cipher.algorithms[t] : null; }; var i = a.cipher.BlockCipher = function (t) { this.algorithm = t.algorithm, this.mode = this.algorithm.mode, this.blockSize = this.mode.blockSize, this._finish = !1, this._input = null, this.output = null, this._op = t.decrypt ? this.mode.decrypt : this.mode.encrypt, this._decrypt = t.decrypt, this.algorithm.initialize(t); }; i.prototype.start = function (t) { t = t || {}; var e = {}; for (var r in t)
        e[r] = t[r]; e.decrypt = this._decrypt, this._finish = !1, this._input = a.util.createBuffer(), this.output = t.output || a.util.createBuffer(), this.mode.start(e); }, i.prototype.update = function (t) { for (t && this._input.putBuffer(t); !this._op.call(this.mode, this._input, this.output, this._finish) && !this._finish;)
        ; this._input.compact(); }, i.prototype.finish = function (t) { !t || "ECB" !== this.mode.name && "CBC" !== this.mode.name || (this.mode.pad = function (e) { return t(this.blockSize, e, !1); }, this.mode.unpad = function (e) { return t(this.blockSize, e, !0); }); var e = {}; return e.decrypt = this._decrypt, e.overflow = this._input.length() % this.blockSize, !(!this._decrypt && this.mode.pad && !this.mode.pad(this._input, e)) && (this._finish = !0, this.update(), !(this._decrypt && this.mode.unpad && !this.mode.unpad(this.output, e)) && !(this.mode.afterFinish && !this.mode.afterFinish(this.output, e))); }; }, function (t, e, r) { function a(t, e) { if ("string" == typeof t && (t = s.util.createBuffer(t)), s.util.isArray(t) && t.length > 4) {
        var r = t;
        t = s.util.createBuffer();
        for (var a = 0; a < r.length; ++a)
            t.putByte(r[a]);
    } if (t.length() < e)
        throw new Error("Invalid IV length; got " + t.length() + " bytes and expected " + e + " bytes."); if (!s.util.isArray(t)) {
        for (var i = [], n = e / 4, a = 0; a < n; ++a)
            i.push(t.getInt32());
        t = i;
    } return t; } function i(t) { t[t.length - 1] = t[t.length - 1] + 1 & 4294967295; } function n(t) { return [t / 4294967296 | 0, 4294967295 & t]; } var s = r(0); r(1), s.cipher = s.cipher || {}; var o = t.exports = s.cipher.modes = s.cipher.modes || {}; o.ecb = function (t) { t = t || {}, this.name = "ECB", this.cipher = t.cipher, this.blockSize = t.blockSize || 16, this._ints = this.blockSize / 4, this._inBlock = new Array(this._ints), this._outBlock = new Array(this._ints); }, o.ecb.prototype.start = function (t) { }, o.ecb.prototype.encrypt = function (t, e, r) { if (t.length() < this.blockSize && !(r && t.length() > 0))
        return !0; for (var a = 0; a < this._ints; ++a)
        this._inBlock[a] = t.getInt32(); this.cipher.encrypt(this._inBlock, this._outBlock); for (var a = 0; a < this._ints; ++a)
        e.putInt32(this._outBlock[a]); }, o.ecb.prototype.decrypt = function (t, e, r) { if (t.length() < this.blockSize && !(r && t.length() > 0))
        return !0; for (var a = 0; a < this._ints; ++a)
        this._inBlock[a] = t.getInt32(); this.cipher.decrypt(this._inBlock, this._outBlock); for (var a = 0; a < this._ints; ++a)
        e.putInt32(this._outBlock[a]); }, o.ecb.prototype.pad = function (t, e) { var r = t.length() === this.blockSize ? this.blockSize : this.blockSize - t.length(); return t.fillWithByte(r, r), !0; }, o.ecb.prototype.unpad = function (t, e) { if (e.overflow > 0)
        return !1; var r = t.length(), a = t.at(r - 1); return !(a > this.blockSize << 2) && (t.truncate(a), !0); }, o.cbc = function (t) { t = t || {}, this.name = "CBC", this.cipher = t.cipher, this.blockSize = t.blockSize || 16, this._ints = this.blockSize / 4, this._inBlock = new Array(this._ints), this._outBlock = new Array(this._ints); }, o.cbc.prototype.start = function (t) { if (null === t.iv) {
        if (!this._prev)
            throw new Error("Invalid IV parameter.");
        this._iv = this._prev.slice(0);
    }
    else {
        if (!("iv" in t))
            throw new Error("Invalid IV parameter.");
        this._iv = a(t.iv, this.blockSize), this._prev = this._iv.slice(0);
    } }, o.cbc.prototype.encrypt = function (t, e, r) { if (t.length() < this.blockSize && !(r && t.length() > 0))
        return !0; for (var a = 0; a < this._ints; ++a)
        this._inBlock[a] = this._prev[a] ^ t.getInt32(); this.cipher.encrypt(this._inBlock, this._outBlock); for (var a = 0; a < this._ints; ++a)
        e.putInt32(this._outBlock[a]); this._prev = this._outBlock; }, o.cbc.prototype.decrypt = function (t, e, r) { if (t.length() < this.blockSize && !(r && t.length() > 0))
        return !0; for (var a = 0; a < this._ints; ++a)
        this._inBlock[a] = t.getInt32(); this.cipher.decrypt(this._inBlock, this._outBlock); for (var a = 0; a < this._ints; ++a)
        e.putInt32(this._prev[a] ^ this._outBlock[a]); this._prev = this._inBlock.slice(0); }, o.cbc.prototype.pad = function (t, e) { var r = t.length() === this.blockSize ? this.blockSize : this.blockSize - t.length(); return t.fillWithByte(r, r), !0; }, o.cbc.prototype.unpad = function (t, e) { if (e.overflow > 0)
        return !1; var r = t.length(), a = t.at(r - 1); return !(a > this.blockSize << 2) && (t.truncate(a), !0); }, o.cfb = function (t) { t = t || {}, this.name = "CFB", this.cipher = t.cipher, this.blockSize = t.blockSize || 16, this._ints = this.blockSize / 4, this._inBlock = null, this._outBlock = new Array(this._ints), this._partialBlock = new Array(this._ints), this._partialOutput = s.util.createBuffer(), this._partialBytes = 0; }, o.cfb.prototype.start = function (t) { if (!("iv" in t))
        throw new Error("Invalid IV parameter."); this._iv = a(t.iv, this.blockSize), this._inBlock = this._iv.slice(0), this._partialBytes = 0; }, o.cfb.prototype.encrypt = function (t, e, r) { var a = t.length(); if (0 === a)
        return !0; if (this.cipher.encrypt(this._inBlock, this._outBlock), 0 === this._partialBytes && a >= this.blockSize)
        for (var i = 0; i < this._ints; ++i)
            this._inBlock[i] = t.getInt32() ^ this._outBlock[i], e.putInt32(this._inBlock[i]);
    else {
        var n = (this.blockSize - a) % this.blockSize;
        n > 0 && (n = this.blockSize - n), this._partialOutput.clear();
        for (var i = 0; i < this._ints; ++i)
            this._partialBlock[i] = t.getInt32() ^ this._outBlock[i], this._partialOutput.putInt32(this._partialBlock[i]);
        if (n > 0)
            t.read -= this.blockSize;
        else
            for (var i = 0; i < this._ints; ++i)
                this._inBlock[i] = this._partialBlock[i];
        if (this._partialBytes > 0 && this._partialOutput.getBytes(this._partialBytes), n > 0 && !r)
            return e.putBytes(this._partialOutput.getBytes(n - this._partialBytes)), this._partialBytes = n, !0;
        e.putBytes(this._partialOutput.getBytes(a - this._partialBytes)), this._partialBytes = 0;
    } }, o.cfb.prototype.decrypt = function (t, e, r) { var a = t.length(); if (0 === a)
        return !0; if (this.cipher.encrypt(this._inBlock, this._outBlock), 0 === this._partialBytes && a >= this.blockSize)
        for (var i = 0; i < this._ints; ++i)
            this._inBlock[i] = t.getInt32(), e.putInt32(this._inBlock[i] ^ this._outBlock[i]);
    else {
        var n = (this.blockSize - a) % this.blockSize;
        n > 0 && (n = this.blockSize - n), this._partialOutput.clear();
        for (var i = 0; i < this._ints; ++i)
            this._partialBlock[i] = t.getInt32(), this._partialOutput.putInt32(this._partialBlock[i] ^ this._outBlock[i]);
        if (n > 0)
            t.read -= this.blockSize;
        else
            for (var i = 0; i < this._ints; ++i)
                this._inBlock[i] = this._partialBlock[i];
        if (this._partialBytes > 0 && this._partialOutput.getBytes(this._partialBytes), n > 0 && !r)
            return e.putBytes(this._partialOutput.getBytes(n - this._partialBytes)), this._partialBytes = n, !0;
        e.putBytes(this._partialOutput.getBytes(a - this._partialBytes)), this._partialBytes = 0;
    } }, o.ofb = function (t) { t = t || {}, this.name = "OFB", this.cipher = t.cipher, this.blockSize = t.blockSize || 16, this._ints = this.blockSize / 4, this._inBlock = null, this._outBlock = new Array(this._ints), this._partialOutput = s.util.createBuffer(), this._partialBytes = 0; }, o.ofb.prototype.start = function (t) { if (!("iv" in t))
        throw new Error("Invalid IV parameter."); this._iv = a(t.iv, this.blockSize), this._inBlock = this._iv.slice(0), this._partialBytes = 0; }, o.ofb.prototype.encrypt = function (t, e, r) { var a = t.length(); if (0 === t.length())
        return !0; if (this.cipher.encrypt(this._inBlock, this._outBlock), 0 === this._partialBytes && a >= this.blockSize)
        for (var i = 0; i < this._ints; ++i)
            e.putInt32(t.getInt32() ^ this._outBlock[i]), this._inBlock[i] = this._outBlock[i];
    else {
        var n = (this.blockSize - a) % this.blockSize;
        n > 0 && (n = this.blockSize - n), this._partialOutput.clear();
        for (var i = 0; i < this._ints; ++i)
            this._partialOutput.putInt32(t.getInt32() ^ this._outBlock[i]);
        if (n > 0)
            t.read -= this.blockSize;
        else
            for (var i = 0; i < this._ints; ++i)
                this._inBlock[i] = this._outBlock[i];
        if (this._partialBytes > 0 && this._partialOutput.getBytes(this._partialBytes), n > 0 && !r)
            return e.putBytes(this._partialOutput.getBytes(n - this._partialBytes)), this._partialBytes = n, !0;
        e.putBytes(this._partialOutput.getBytes(a - this._partialBytes)), this._partialBytes = 0;
    } }, o.ofb.prototype.decrypt = o.ofb.prototype.encrypt, o.ctr = function (t) { t = t || {}, this.name = "CTR", this.cipher = t.cipher, this.blockSize = t.blockSize || 16, this._ints = this.blockSize / 4, this._inBlock = null, this._outBlock = new Array(this._ints), this._partialOutput = s.util.createBuffer(), this._partialBytes = 0; }, o.ctr.prototype.start = function (t) { if (!("iv" in t))
        throw new Error("Invalid IV parameter."); this._iv = a(t.iv, this.blockSize), this._inBlock = this._iv.slice(0), this._partialBytes = 0; }, o.ctr.prototype.encrypt = function (t, e, r) { var a = t.length(); if (0 === a)
        return !0; if (this.cipher.encrypt(this._inBlock, this._outBlock), 0 === this._partialBytes && a >= this.blockSize)
        for (var n = 0; n < this._ints; ++n)
            e.putInt32(t.getInt32() ^ this._outBlock[n]);
    else {
        var s = (this.blockSize - a) % this.blockSize;
        s > 0 && (s = this.blockSize - s), this._partialOutput.clear();
        for (var n = 0; n < this._ints; ++n)
            this._partialOutput.putInt32(t.getInt32() ^ this._outBlock[n]);
        if (s > 0 && (t.read -= this.blockSize), this._partialBytes > 0 && this._partialOutput.getBytes(this._partialBytes), s > 0 && !r)
            return e.putBytes(this._partialOutput.getBytes(s - this._partialBytes)), this._partialBytes = s, !0;
        e.putBytes(this._partialOutput.getBytes(a - this._partialBytes)), this._partialBytes = 0;
    } i(this._inBlock); }, o.ctr.prototype.decrypt = o.ctr.prototype.encrypt, o.gcm = function (t) { t = t || {}, this.name = "GCM", this.cipher = t.cipher, this.blockSize = t.blockSize || 16, this._ints = this.blockSize / 4, this._inBlock = new Array(this._ints), this._outBlock = new Array(this._ints), this._partialOutput = s.util.createBuffer(), this._partialBytes = 0, this._R = 3774873600; }, o.gcm.prototype.start = function (t) { if (!("iv" in t))
        throw new Error("Invalid IV parameter."); var e = s.util.createBuffer(t.iv); this._cipherLength = 0; var r; if (r = "additionalData" in t ? s.util.createBuffer(t.additionalData) : s.util.createBuffer(), this._tagLength = "tagLength" in t ? t.tagLength : 128, this._tag = null, t.decrypt && (this._tag = s.util.createBuffer(t.tag).getBytes(), this._tag.length !== this._tagLength / 8))
        throw new Error("Authentication tag does not match tag length."); this._hashBlock = new Array(this._ints), this.tag = null, this._hashSubkey = new Array(this._ints), this.cipher.encrypt([0, 0, 0, 0], this._hashSubkey), this.componentBits = 4, this._m = this.generateHashTable(this._hashSubkey, this.componentBits); var a = e.length(); if (12 === a)
        this._j0 = [e.getInt32(), e.getInt32(), e.getInt32(), 1];
    else {
        for (this._j0 = [0, 0, 0, 0]; e.length() > 0;)
            this._j0 = this.ghash(this._hashSubkey, this._j0, [e.getInt32(), e.getInt32(), e.getInt32(), e.getInt32()]);
        this._j0 = this.ghash(this._hashSubkey, this._j0, [0, 0].concat(n(8 * a)));
    } this._inBlock = this._j0.slice(0), i(this._inBlock), this._partialBytes = 0, r = s.util.createBuffer(r), this._aDataLength = n(8 * r.length()); var o = r.length() % this.blockSize; for (o && r.fillWithByte(0, this.blockSize - o), this._s = [0, 0, 0, 0]; r.length() > 0;)
        this._s = this.ghash(this._hashSubkey, this._s, [r.getInt32(), r.getInt32(), r.getInt32(), r.getInt32()]); }, o.gcm.prototype.encrypt = function (t, e, r) { var a = t.length(); if (0 === a)
        return !0; if (this.cipher.encrypt(this._inBlock, this._outBlock), 0 === this._partialBytes && a >= this.blockSize) {
        for (var n = 0; n < this._ints; ++n)
            e.putInt32(this._outBlock[n] ^= t.getInt32());
        this._cipherLength += this.blockSize;
    }
    else {
        var s = (this.blockSize - a) % this.blockSize;
        s > 0 && (s = this.blockSize - s), this._partialOutput.clear();
        for (var n = 0; n < this._ints; ++n)
            this._partialOutput.putInt32(t.getInt32() ^ this._outBlock[n]);
        if (s <= 0 || r) {
            if (r) {
                var o = a % this.blockSize;
                this._cipherLength += o, this._partialOutput.truncate(this.blockSize - o);
            }
            else
                this._cipherLength += this.blockSize;
            for (var n = 0; n < this._ints; ++n)
                this._outBlock[n] = this._partialOutput.getInt32();
            this._partialOutput.read -= this.blockSize;
        }
        if (this._partialBytes > 0 && this._partialOutput.getBytes(this._partialBytes), s > 0 && !r)
            return t.read -= this.blockSize, e.putBytes(this._partialOutput.getBytes(s - this._partialBytes)), this._partialBytes = s, !0;
        e.putBytes(this._partialOutput.getBytes(a - this._partialBytes)), this._partialBytes = 0;
    } this._s = this.ghash(this._hashSubkey, this._s, this._outBlock), i(this._inBlock); }, o.gcm.prototype.decrypt = function (t, e, r) { var a = t.length(); if (a < this.blockSize && !(r && a > 0))
        return !0; this.cipher.encrypt(this._inBlock, this._outBlock), i(this._inBlock), this._hashBlock[0] = t.getInt32(), this._hashBlock[1] = t.getInt32(), this._hashBlock[2] = t.getInt32(), this._hashBlock[3] = t.getInt32(), this._s = this.ghash(this._hashSubkey, this._s, this._hashBlock); for (var n = 0; n < this._ints; ++n)
        e.putInt32(this._outBlock[n] ^ this._hashBlock[n]); a < this.blockSize ? this._cipherLength += a % this.blockSize : this._cipherLength += this.blockSize; }, o.gcm.prototype.afterFinish = function (t, e) { var r = !0; e.decrypt && e.overflow && t.truncate(this.blockSize - e.overflow), this.tag = s.util.createBuffer(); var a = this._aDataLength.concat(n(8 * this._cipherLength)); this._s = this.ghash(this._hashSubkey, this._s, a); var i = []; this.cipher.encrypt(this._j0, i); for (var o = 0; o < this._ints; ++o)
        this.tag.putInt32(this._s[o] ^ i[o]); return this.tag.truncate(this.tag.length() % (this._tagLength / 8)), e.decrypt && this.tag.bytes() !== this._tag && (r = !1), r; }, o.gcm.prototype.multiply = function (t, e) { for (var r = [0, 0, 0, 0], a = e.slice(0), i = 0; i < 128; ++i) {
        t[i / 32 | 0] & 1 << 31 - i % 32 && (r[0] ^= a[0], r[1] ^= a[1], r[2] ^= a[2], r[3] ^= a[3]), this.pow(a, a);
    } return r; }, o.gcm.prototype.pow = function (t, e) { for (var r = 1 & t[3], a = 3; a > 0; --a)
        e[a] = t[a] >>> 1 | (1 & t[a - 1]) << 31; e[0] = t[0] >>> 1, r && (e[0] ^= this._R); }, o.gcm.prototype.tableMultiply = function (t) { for (var e = [0, 0, 0, 0], r = 0; r < 32; ++r) {
        var a = r / 8 | 0, i = t[a] >>> 4 * (7 - r % 8) & 15, n = this._m[r][i];
        e[0] ^= n[0], e[1] ^= n[1], e[2] ^= n[2], e[3] ^= n[3];
    } return e; }, o.gcm.prototype.ghash = function (t, e, r) { return e[0] ^= r[0], e[1] ^= r[1], e[2] ^= r[2], e[3] ^= r[3], this.tableMultiply(e); }, o.gcm.prototype.generateHashTable = function (t, e) { for (var r = 8 / e, a = 4 * r, i = 16 * r, n = new Array(i), s = 0; s < i; ++s) {
        var o = [0, 0, 0, 0], u = s / a | 0, c = (a - 1 - s % a) * e;
        o[u] = 1 << e - 1 << c, n[s] = this.generateSubHashTable(this.multiply(o, t), e);
    } return n; }, o.gcm.prototype.generateSubHashTable = function (t, e) { var r = 1 << e, a = r >>> 1, i = new Array(r); i[a] = t.slice(0); for (var n = a >>> 1; n > 0;)
        this.pow(i[2 * n], i[n] = []), n >>= 1; for (n = 2; n < a;) {
        for (var s = 1; s < n; ++s) {
            var o = i[n], u = i[s];
            i[n + s] = [o[0] ^ u[0], o[1] ^ u[1], o[2] ^ u[2], o[3] ^ u[3]];
        }
        n *= 2;
    } for (i[0] = [0, 0, 0, 0], n = a + 1; n < r; ++n) {
        var c = i[n ^ a];
        i[n] = [t[0] ^ c[0], t[1] ^ c[1], t[2] ^ c[2], t[3] ^ c[3]];
    } return i; }; }, function (t, e, r) { var a = r(0); r(15), r(4), r(1); var i, n = a.pkcs5 = a.pkcs5 || {}; a.util.isNodejs && !a.options.usePureJavaScript && (i = r(11)), t.exports = a.pbkdf2 = n.pbkdf2 = function (t, e, r, n, s, o) { function u() { if (C > p)
        return o(null, v); d.start(null, null), d.update(e), d.update(a.util.int32ToBytes(C)), y = m = d.digest().getBytes(), E = 2, c(); } function c() { if (E <= r)
        return d.start(null, null), d.update(m), g = d.digest().getBytes(), y = a.util.xorBytes(y, g, l), m = g, ++E, a.util.setImmediate(c); v += C < p ? y : y.substr(0, f), ++C, u(); } if ("function" == typeof s && (o = s, s = null), a.util.isNodejs && !a.options.usePureJavaScript && i.pbkdf2 && (null === s || "object" != typeof s) && (i.pbkdf2Sync.length > 4 || !s || "sha1" === s))
        return "string" != typeof s && (s = "sha1"), t = Buffer.from(t, "binary"), e = Buffer.from(e, "binary"), o ? 4 === i.pbkdf2Sync.length ? i.pbkdf2(t, e, r, n, function (t, e) { if (t)
            return o(t); o(null, e.toString("binary")); }) : i.pbkdf2(t, e, r, n, s, function (t, e) { if (t)
            return o(t); o(null, e.toString("binary")); }) : 4 === i.pbkdf2Sync.length ? i.pbkdf2Sync(t, e, r, n).toString("binary") : i.pbkdf2Sync(t, e, r, n, s).toString("binary"); if (void 0 !== s && null !== s || (s = "sha1"), "string" == typeof s) {
        if (!(s in a.md.algorithms))
            throw new Error("Unknown hash algorithm: " + s);
        s = a.md[s].create();
    } var l = s.digestLength; if (n > 4294967295 * l) {
        var h = new Error("Derived key is too long.");
        if (o)
            return o(h);
        throw h;
    } var p = Math.ceil(n / l), f = n - (p - 1) * l, d = a.hmac.create(); d.start(s, t); var y, g, m, v = ""; if (!o) {
        for (var C = 1; C <= p; ++C) {
            d.start(null, null), d.update(e), d.update(a.util.int32ToBytes(C)), y = m = d.digest().getBytes();
            for (var E = 2; E <= r; ++E)
                d.start(null, null), d.update(m), g = d.digest().getBytes(), y = a.util.xorBytes(y, g, l), m = g;
            v += C < p ? y : y.substr(0, f);
        }
        return v;
    } var E, C = 1; u(); }; }, function (t, e) { }, function (t, e, r) { function a(t) { for (var e = t.name + ": ", r = [], a = function (t, e) { return " " + e; }, i = 0; i < t.values.length; ++i)
        r.push(t.values[i].replace(/^(\S+\r\n)/, a)); e += r.join(",") + "\r\n"; for (var n = 0, s = -1, i = 0; i < e.length; ++i, ++n)
        if (n > 65 && -1 !== s) {
            var o = e[s];
            "," === o ? (++s, e = e.substr(0, s) + "\r\n " + e.substr(s)) : e = e.substr(0, s) + "\r\n" + o + e.substr(s + 1), n = i - s - 1, s = -1, ++i;
        }
        else
            " " !== e[i] && "\t" !== e[i] && "," !== e[i] || (s = i); return e; } function i(t) { return t.replace(/^\s+/, ""); } var n = r(0); r(1); var s = t.exports = n.pem = n.pem || {}; s.encode = function (t, e) { e = e || {}; var r, i = "-----BEGIN " + t.type + "-----\r\n"; if (t.procType && (r = { name: "Proc-Type", values: [String(t.procType.version), t.procType.type] }, i += a(r)), t.contentDomain && (r = { name: "Content-Domain", values: [t.contentDomain] }, i += a(r)), t.dekInfo && (r = { name: "DEK-Info", values: [t.dekInfo.algorithm] }, t.dekInfo.parameters && r.values.push(t.dekInfo.parameters), i += a(r)), t.headers)
        for (var s = 0; s < t.headers.length; ++s)
            i += a(t.headers[s]); return t.procType && (i += "\r\n"), i += n.util.encode64(t.body, e.maxline || 64) + "\r\n", i += "-----END " + t.type + "-----\r\n"; }, s.decode = function (t) { for (var e, r = [], a = /\s*-----BEGIN ([A-Z0-9- ]+)-----\r?\n?([\x21-\x7e\s]+?(?:\r?\n\r?\n))?([:A-Za-z0-9+\/=\s]+?)-----END \1-----/g, s = /([\x21-\x7e]+):\s*([\x21-\x7e\s^:]+)/, o = /\r?\n/;;) {
        if (!(e = a.exec(t)))
            break;
        var u = { type: e[1], procType: null, contentDomain: null, dekInfo: null, headers: [], body: n.util.decode64(e[3]) };
        if (r.push(u), e[2]) {
            for (var c = e[2].split(o), l = 0; e && l < c.length;) {
                for (var h = c[l].replace(/\s+$/, ""), p = l + 1; p < c.length; ++p) {
                    var f = c[p];
                    if (!/\s/.test(f[0]))
                        break;
                    h += f, l = p;
                }
                if (e = h.match(s)) {
                    for (var d = { name: e[1], values: [] }, y = e[2].split(","), g = 0; g < y.length; ++g)
                        d.values.push(i(y[g]));
                    if (u.procType)
                        if (u.contentDomain || "Content-Domain" !== d.name)
                            if (u.dekInfo || "DEK-Info" !== d.name)
                                u.headers.push(d);
                            else {
                                if (0 === d.values.length)
                                    throw new Error('Invalid PEM formatted message. The "DEK-Info" header must have at least one subfield.');
                                u.dekInfo = { algorithm: y[0], parameters: y[1] || null };
                            }
                        else
                            u.contentDomain = y[0] || "";
                    else {
                        if ("Proc-Type" !== d.name)
                            throw new Error('Invalid PEM formatted message. The first encapsulated header must be "Proc-Type".');
                        if (2 !== d.values.length)
                            throw new Error('Invalid PEM formatted message. The "Proc-Type" header must have two subfields.');
                        u.procType = { version: y[0], type: y[1] };
                    }
                }
                ++l;
            }
            if ("ENCRYPTED" === u.procType && !u.dekInfo)
                throw new Error('Invalid PEM formatted message. The "DEK-Info" header must be present if "Proc-Type" is "ENCRYPTED".');
        }
    } if (0 === r.length)
        throw new Error("Invalid PEM formatted message."); return r; }; }, function (t, e, r) { function a(t, e) { return t.start().update(e).digest().getBytes(); } function i(t) { var e; if (t) {
        if (!(e = l.oids[c.derToOid(t)])) {
            var r = new Error("Unsupported PRF OID.");
            throw r.oid = t, r.supported = ["hmacWithSHA1", "hmacWithSHA224", "hmacWithSHA256", "hmacWithSHA384", "hmacWithSHA512"], r;
        }
    }
    else
        e = "hmacWithSHA1"; return n(e); } function n(t) { var e = o.md; switch (t) {
        case "hmacWithSHA224": e = o.md.sha512;
        case "hmacWithSHA1":
        case "hmacWithSHA256":
        case "hmacWithSHA384":
        case "hmacWithSHA512":
            t = t.substr(8).toLowerCase();
            break;
        default:
            var r = new Error("Unsupported PRF algorithm.");
            throw r.algorithm = t, r.supported = ["hmacWithSHA1", "hmacWithSHA224", "hmacWithSHA256", "hmacWithSHA384", "hmacWithSHA512"], r;
    } if (!(e && t in e))
        throw new Error("Unknown hash algorithm: " + t); return e[t].create(); } function s(t, e, r, a) { var i = c.create(c.Class.UNIVERSAL, c.Type.SEQUENCE, !0, [c.create(c.Class.UNIVERSAL, c.Type.OCTETSTRING, !1, t), c.create(c.Class.UNIVERSAL, c.Type.INTEGER, !1, e.getBytes())]); return "hmacWithSHA1" !== a && i.value.push(c.create(c.Class.UNIVERSAL, c.Type.INTEGER, !1, o.util.hexToBytes(r.toString(16))), c.create(c.Class.UNIVERSAL, c.Type.SEQUENCE, !0, [c.create(c.Class.UNIVERSAL, c.Type.OID, !1, c.oidToDer(l.oids[a]).getBytes()), c.create(c.Class.UNIVERSAL, c.Type.NULL, !1, "")])), i; } var o = r(0); if (r(6), r(2), r(14), r(4), r(3), r(10), r(12), r(5), r(26), r(7), r(1), void 0 === u)
        var u = o.jsbn.BigInteger; var c = o.asn1, l = o.pki = o.pki || {}; t.exports = l.pbe = o.pbe = o.pbe || {}; var h = l.oids, p = { name: "EncryptedPrivateKeyInfo", tagClass: c.Class.UNIVERSAL, type: c.Type.SEQUENCE, constructed: !0, value: [{ name: "EncryptedPrivateKeyInfo.encryptionAlgorithm", tagClass: c.Class.UNIVERSAL, type: c.Type.SEQUENCE, constructed: !0, value: [{ name: "AlgorithmIdentifier.algorithm", tagClass: c.Class.UNIVERSAL, type: c.Type.OID, constructed: !1, capture: "encryptionOid" }, { name: "AlgorithmIdentifier.parameters", tagClass: c.Class.UNIVERSAL, type: c.Type.SEQUENCE, constructed: !0, captureAsn1: "encryptionParams" }] }, { name: "EncryptedPrivateKeyInfo.encryptedData", tagClass: c.Class.UNIVERSAL, type: c.Type.OCTETSTRING, constructed: !1, capture: "encryptedData" }] }, f = { name: "PBES2Algorithms", tagClass: c.Class.UNIVERSAL, type: c.Type.SEQUENCE, constructed: !0, value: [{ name: "PBES2Algorithms.keyDerivationFunc", tagClass: c.Class.UNIVERSAL, type: c.Type.SEQUENCE, constructed: !0, value: [{ name: "PBES2Algorithms.keyDerivationFunc.oid", tagClass: c.Class.UNIVERSAL, type: c.Type.OID, constructed: !1, capture: "kdfOid" }, { name: "PBES2Algorithms.params", tagClass: c.Class.UNIVERSAL, type: c.Type.SEQUENCE, constructed: !0, value: [{ name: "PBES2Algorithms.params.salt", tagClass: c.Class.UNIVERSAL, type: c.Type.OCTETSTRING, constructed: !1, capture: "kdfSalt" }, { name: "PBES2Algorithms.params.iterationCount", tagClass: c.Class.UNIVERSAL, type: c.Type.INTEGER, constructed: !1, capture: "kdfIterationCount" }, { name: "PBES2Algorithms.params.keyLength", tagClass: c.Class.UNIVERSAL, type: c.Type.INTEGER, constructed: !1, optional: !0, capture: "keyLength" }, { name: "PBES2Algorithms.params.prf", tagClass: c.Class.UNIVERSAL, type: c.Type.SEQUENCE, constructed: !0, optional: !0, value: [{ name: "PBES2Algorithms.params.prf.algorithm", tagClass: c.Class.UNIVERSAL, type: c.Type.OID, constructed: !1, capture: "prfOid" }] }] }] }, { name: "PBES2Algorithms.encryptionScheme", tagClass: c.Class.UNIVERSAL, type: c.Type.SEQUENCE, constructed: !0, value: [{ name: "PBES2Algorithms.encryptionScheme.oid", tagClass: c.Class.UNIVERSAL, type: c.Type.OID, constructed: !1, capture: "encOid" }, { name: "PBES2Algorithms.encryptionScheme.iv", tagClass: c.Class.UNIVERSAL, type: c.Type.OCTETSTRING, constructed: !1, capture: "encIv" }] }] }, d = { name: "pkcs-12PbeParams", tagClass: c.Class.UNIVERSAL, type: c.Type.SEQUENCE, constructed: !0, value: [{ name: "pkcs-12PbeParams.salt", tagClass: c.Class.UNIVERSAL, type: c.Type.OCTETSTRING, constructed: !1, capture: "salt" }, { name: "pkcs-12PbeParams.iterations", tagClass: c.Class.UNIVERSAL, type: c.Type.INTEGER, constructed: !1, capture: "iterations" }] }; l.encryptPrivateKeyInfo = function (t, e, r) { r = r || {}, r.saltSize = r.saltSize || 8, r.count = r.count || 2048, r.algorithm = r.algorithm || "aes128", r.prfAlgorithm = r.prfAlgorithm || "sha1"; var a, i, u, p = o.random.getBytesSync(r.saltSize), f = r.count, d = c.integerToDer(f); if (0 === r.algorithm.indexOf("aes") || "des" === r.algorithm) {
        var y, g, m;
        switch (r.algorithm) {
            case "aes128":
                a = 16, y = 16, g = h["aes128-CBC"], m = o.aes.createEncryptionCipher;
                break;
            case "aes192":
                a = 24, y = 16, g = h["aes192-CBC"], m = o.aes.createEncryptionCipher;
                break;
            case "aes256":
                a = 32, y = 16, g = h["aes256-CBC"], m = o.aes.createEncryptionCipher;
                break;
            case "des":
                a = 8, y = 8, g = h.desCBC, m = o.des.createEncryptionCipher;
                break;
            default:
                var v = new Error("Cannot encrypt private key. Unknown encryption algorithm.");
                throw v.algorithm = r.algorithm, v;
        }
        var C = "hmacWith" + r.prfAlgorithm.toUpperCase(), E = n(C), S = o.pkcs5.pbkdf2(e, p, f, a, E), T = o.random.getBytesSync(y), I = m(S);
        I.start(T), I.update(c.toDer(t)), I.finish(), u = I.output.getBytes();
        var b = s(p, d, a, C);
        i = c.create(c.Class.UNIVERSAL, c.Type.SEQUENCE, !0, [c.create(c.Class.UNIVERSAL, c.Type.OID, !1, c.oidToDer(h.pkcs5PBES2).getBytes()), c.create(c.Class.UNIVERSAL, c.Type.SEQUENCE, !0, [c.create(c.Class.UNIVERSAL, c.Type.SEQUENCE, !0, [c.create(c.Class.UNIVERSAL, c.Type.OID, !1, c.oidToDer(h.pkcs5PBKDF2).getBytes()), b]), c.create(c.Class.UNIVERSAL, c.Type.SEQUENCE, !0, [c.create(c.Class.UNIVERSAL, c.Type.OID, !1, c.oidToDer(g).getBytes()), c.create(c.Class.UNIVERSAL, c.Type.OCTETSTRING, !1, T)])])]);
    }
    else {
        if ("3des" !== r.algorithm) {
            var v = new Error("Cannot encrypt private key. Unknown encryption algorithm.");
            throw v.algorithm = r.algorithm, v;
        }
        a = 24;
        var A = new o.util.ByteBuffer(p), S = l.pbe.generatePkcs12Key(e, A, 1, f, a), T = l.pbe.generatePkcs12Key(e, A, 2, f, a), I = o.des.createEncryptionCipher(S);
        I.start(T), I.update(c.toDer(t)), I.finish(), u = I.output.getBytes(), i = c.create(c.Class.UNIVERSAL, c.Type.SEQUENCE, !0, [c.create(c.Class.UNIVERSAL, c.Type.OID, !1, c.oidToDer(h["pbeWithSHAAnd3-KeyTripleDES-CBC"]).getBytes()), c.create(c.Class.UNIVERSAL, c.Type.SEQUENCE, !0, [c.create(c.Class.UNIVERSAL, c.Type.OCTETSTRING, !1, p), c.create(c.Class.UNIVERSAL, c.Type.INTEGER, !1, d.getBytes())])]);
    } return c.create(c.Class.UNIVERSAL, c.Type.SEQUENCE, !0, [i, c.create(c.Class.UNIVERSAL, c.Type.OCTETSTRING, !1, u)]); }, l.decryptPrivateKeyInfo = function (t, e) { var r = null, a = {}, i = []; if (!c.validate(t, p, a, i)) {
        var n = new Error("Cannot read encrypted private key. ASN.1 object is not a supported EncryptedPrivateKeyInfo.");
        throw n.errors = i, n;
    } var s = c.derToOid(a.encryptionOid), u = l.pbe.getCipher(s, a.encryptionParams, e), h = o.util.createBuffer(a.encryptedData); return u.update(h), u.finish() && (r = c.fromDer(u.output)), r; }, l.encryptedPrivateKeyToPem = function (t, e) { var r = { type: "ENCRYPTED PRIVATE KEY", body: c.toDer(t).getBytes() }; return o.pem.encode(r, { maxline: e }); }, l.encryptedPrivateKeyFromPem = function (t) { var e = o.pem.decode(t)[0]; if ("ENCRYPTED PRIVATE KEY" !== e.type) {
        var r = new Error('Could not convert encrypted private key from PEM; PEM header type is "ENCRYPTED PRIVATE KEY".');
        throw r.headerType = e.type, r;
    } if (e.procType && "ENCRYPTED" === e.procType.type)
        throw new Error("Could not convert encrypted private key from PEM; PEM is encrypted."); return c.fromDer(e.body); }, l.encryptRsaPrivateKey = function (t, e, r) { if (r = r || {}, !r.legacy) {
        var a = l.wrapRsaPrivateKey(l.privateKeyToAsn1(t));
        return a = l.encryptPrivateKeyInfo(a, e, r), l.encryptedPrivateKeyToPem(a);
    } var i, n, s, u; switch (r.algorithm) {
        case "aes128":
            i = "AES-128-CBC", s = 16, n = o.random.getBytesSync(16), u = o.aes.createEncryptionCipher;
            break;
        case "aes192":
            i = "AES-192-CBC", s = 24, n = o.random.getBytesSync(16), u = o.aes.createEncryptionCipher;
            break;
        case "aes256":
            i = "AES-256-CBC", s = 32, n = o.random.getBytesSync(16), u = o.aes.createEncryptionCipher;
            break;
        case "3des":
            i = "DES-EDE3-CBC", s = 24, n = o.random.getBytesSync(8), u = o.des.createEncryptionCipher;
            break;
        case "des":
            i = "DES-CBC", s = 8, n = o.random.getBytesSync(8), u = o.des.createEncryptionCipher;
            break;
        default:
            var h = new Error('Could not encrypt RSA private key; unsupported encryption algorithm "' + r.algorithm + '".');
            throw h.algorithm = r.algorithm, h;
    } var p = o.pbe.opensslDeriveBytes(e, n.substr(0, 8), s), f = u(p); f.start(n), f.update(c.toDer(l.privateKeyToAsn1(t))), f.finish(); var d = { type: "RSA PRIVATE KEY", procType: { version: "4", type: "ENCRYPTED" }, dekInfo: { algorithm: i, parameters: o.util.bytesToHex(n).toUpperCase() }, body: f.output.getBytes() }; return o.pem.encode(d); }, l.decryptRsaPrivateKey = function (t, e) { var r = null, a = o.pem.decode(t)[0]; if ("ENCRYPTED PRIVATE KEY" !== a.type && "PRIVATE KEY" !== a.type && "RSA PRIVATE KEY" !== a.type) {
        var i = new Error('Could not convert private key from PEM; PEM header type is not "ENCRYPTED PRIVATE KEY", "PRIVATE KEY", or "RSA PRIVATE KEY".');
        throw i.headerType = i, i;
    } if (a.procType && "ENCRYPTED" === a.procType.type) {
        var n, s;
        switch (a.dekInfo.algorithm) {
            case "DES-CBC":
                n = 8, s = o.des.createDecryptionCipher;
                break;
            case "DES-EDE3-CBC":
                n = 24, s = o.des.createDecryptionCipher;
                break;
            case "AES-128-CBC":
                n = 16, s = o.aes.createDecryptionCipher;
                break;
            case "AES-192-CBC":
                n = 24, s = o.aes.createDecryptionCipher;
                break;
            case "AES-256-CBC":
                n = 32, s = o.aes.createDecryptionCipher;
                break;
            case "RC2-40-CBC":
                n = 5, s = function (t) { return o.rc2.createDecryptionCipher(t, 40); };
                break;
            case "RC2-64-CBC":
                n = 8, s = function (t) { return o.rc2.createDecryptionCipher(t, 64); };
                break;
            case "RC2-128-CBC":
                n = 16, s = function (t) { return o.rc2.createDecryptionCipher(t, 128); };
                break;
            default:
                var i = new Error('Could not decrypt private key; unsupported encryption algorithm "' + a.dekInfo.algorithm + '".');
                throw i.algorithm = a.dekInfo.algorithm, i;
        }
        var u = o.util.hexToBytes(a.dekInfo.parameters), h = o.pbe.opensslDeriveBytes(e, u.substr(0, 8), n), p = s(h);
        if (p.start(u), p.update(o.util.createBuffer(a.body)), !p.finish())
            return r;
        r = p.output.getBytes();
    }
    else
        r = a.body; return r = "ENCRYPTED PRIVATE KEY" === a.type ? l.decryptPrivateKeyInfo(c.fromDer(r), e) : c.fromDer(r), null !== r && (r = l.privateKeyFromAsn1(r)), r; }, l.pbe.generatePkcs12Key = function (t, e, r, a, i, n) { var s, u; if (void 0 === n || null === n) {
        if (!("sha1" in o.md))
            throw new Error('"sha1" hash algorithm unavailable.');
        n = o.md.sha1.create();
    } var c = n.digestLength, l = n.blockLength, h = new o.util.ByteBuffer, p = new o.util.ByteBuffer; if (null !== t && void 0 !== t) {
        for (u = 0; u < t.length; u++)
            p.putInt16(t.charCodeAt(u));
        p.putInt16(0);
    } var f = p.length(), d = e.length(), y = new o.util.ByteBuffer; y.fillWithByte(r, l); var g = l * Math.ceil(d / l), m = new o.util.ByteBuffer; for (u = 0; u < g; u++)
        m.putByte(e.at(u % d)); var v = l * Math.ceil(f / l), C = new o.util.ByteBuffer; for (u = 0; u < v; u++)
        C.putByte(p.at(u % f)); var E = m; E.putBuffer(C); for (var S = Math.ceil(i / c), T = 1; T <= S; T++) {
        var I = new o.util.ByteBuffer;
        I.putBytes(y.bytes()), I.putBytes(E.bytes());
        for (var b = 0; b < a; b++)
            n.start(), n.update(I.getBytes()), I = n.digest();
        var A = new o.util.ByteBuffer;
        for (u = 0; u < l; u++)
            A.putByte(I.at(u % c));
        var B = Math.ceil(d / l) + Math.ceil(f / l), N = new o.util.ByteBuffer;
        for (s = 0; s < B; s++) {
            var R = new o.util.ByteBuffer(E.getBytes(l)), w = 511;
            for (u = A.length() - 1; u >= 0; u--)
                w >>= 8, w += A.at(u) + R.at(u), R.setAt(u, 255 & w);
            N.putBuffer(R);
        }
        E = N, h.putBuffer(I);
    } return h.truncate(h.length() - i), h; }, l.pbe.getCipher = function (t, e, r) { switch (t) {
        case l.oids.pkcs5PBES2: return l.pbe.getCipherForPBES2(t, e, r);
        case l.oids["pbeWithSHAAnd3-KeyTripleDES-CBC"]:
        case l.oids["pbewithSHAAnd40BitRC2-CBC"]: return l.pbe.getCipherForPKCS12PBE(t, e, r);
        default:
            var a = new Error("Cannot read encrypted PBE data block. Unsupported OID.");
            throw a.oid = t, a.supportedOids = ["pkcs5PBES2", "pbeWithSHAAnd3-KeyTripleDES-CBC", "pbewithSHAAnd40BitRC2-CBC"], a;
    } }, l.pbe.getCipherForPBES2 = function (t, e, r) { var a = {}, n = []; if (!c.validate(e, f, a, n)) {
        var s = new Error("Cannot read password-based-encryption algorithm parameters. ASN.1 object is not a supported EncryptedPrivateKeyInfo.");
        throw s.errors = n, s;
    } if ((t = c.derToOid(a.kdfOid)) !== l.oids.pkcs5PBKDF2) {
        var s = new Error("Cannot read encrypted private key. Unsupported key derivation function OID.");
        throw s.oid = t, s.supportedOids = ["pkcs5PBKDF2"], s;
    } if ((t = c.derToOid(a.encOid)) !== l.oids["aes128-CBC"] && t !== l.oids["aes192-CBC"] && t !== l.oids["aes256-CBC"] && t !== l.oids["des-EDE3-CBC"] && t !== l.oids.desCBC) {
        var s = new Error("Cannot read encrypted private key. Unsupported encryption scheme OID.");
        throw s.oid = t, s.supportedOids = ["aes128-CBC", "aes192-CBC", "aes256-CBC", "des-EDE3-CBC", "desCBC"], s;
    } var u = a.kdfSalt, h = o.util.createBuffer(a.kdfIterationCount); h = h.getInt(h.length() << 3); var p, d; switch (l.oids[t]) {
        case "aes128-CBC":
            p = 16, d = o.aes.createDecryptionCipher;
            break;
        case "aes192-CBC":
            p = 24, d = o.aes.createDecryptionCipher;
            break;
        case "aes256-CBC":
            p = 32, d = o.aes.createDecryptionCipher;
            break;
        case "des-EDE3-CBC":
            p = 24, d = o.des.createDecryptionCipher;
            break;
        case "desCBC": p = 8, d = o.des.createDecryptionCipher;
    } var y = i(a.prfOid), g = o.pkcs5.pbkdf2(r, u, h, p, y), m = a.encIv, v = d(g); return v.start(m), v; }, l.pbe.getCipherForPKCS12PBE = function (t, e, r) { var a = {}, n = []; if (!c.validate(e, d, a, n)) {
        var s = new Error("Cannot read password-based-encryption algorithm parameters. ASN.1 object is not a supported EncryptedPrivateKeyInfo.");
        throw s.errors = n, s;
    } var u = o.util.createBuffer(a.salt), h = o.util.createBuffer(a.iterations); h = h.getInt(h.length() << 3); var p, f, y; switch (t) {
        case l.oids["pbeWithSHAAnd3-KeyTripleDES-CBC"]:
            p = 24, f = 8, y = o.des.startDecrypting;
            break;
        case l.oids["pbewithSHAAnd40BitRC2-CBC"]:
            p = 5, f = 8, y = function (t, e) { var r = o.rc2.createDecryptionCipher(t, 40); return r.start(e, null), r; };
            break;
        default:
            var s = new Error("Cannot read PKCS #12 PBE data block. Unsupported OID.");
            throw s.oid = t, s;
    } var g = i(a.prfOid), m = l.pbe.generatePkcs12Key(r, u, 1, h, p, g); return g.start(), y(m, l.pbe.generatePkcs12Key(r, u, 2, h, f, g)); }, l.pbe.opensslDeriveBytes = function (t, e, r, i) { if (void 0 === i || null === i) {
        if (!("md5" in o.md))
            throw new Error('"md5" hash algorithm unavailable.');
        i = o.md.md5.create();
    } null === e && (e = ""); for (var n = [a(i, t + e)], s = 16, u = 1; s < r; ++u, s += 16)
        n.push(a(i, n[u - 1] + t + e)); return n.join("").substr(0, r); }; }, function (t, e, r) { function a(t, e) { var r = function () { return new o.des.Algorithm(t, e); }; o.cipher.registerAlgorithm(t, r); } function i(t) { for (var e, r = [0, 4, 536870912, 536870916, 65536, 65540, 536936448, 536936452, 512, 516, 536871424, 536871428, 66048, 66052, 536936960, 536936964], a = [0, 1, 1048576, 1048577, 67108864, 67108865, 68157440, 68157441, 256, 257, 1048832, 1048833, 67109120, 67109121, 68157696, 68157697], i = [0, 8, 2048, 2056, 16777216, 16777224, 16779264, 16779272, 0, 8, 2048, 2056, 16777216, 16777224, 16779264, 16779272], n = [0, 2097152, 134217728, 136314880, 8192, 2105344, 134225920, 136323072, 131072, 2228224, 134348800, 136445952, 139264, 2236416, 134356992, 136454144], s = [0, 262144, 16, 262160, 0, 262144, 16, 262160, 4096, 266240, 4112, 266256, 4096, 266240, 4112, 266256], o = [0, 1024, 32, 1056, 0, 1024, 32, 1056, 33554432, 33555456, 33554464, 33555488, 33554432, 33555456, 33554464, 33555488], u = [0, 268435456, 524288, 268959744, 2, 268435458, 524290, 268959746, 0, 268435456, 524288, 268959744, 2, 268435458, 524290, 268959746], c = [0, 65536, 2048, 67584, 536870912, 536936448, 536872960, 536938496, 131072, 196608, 133120, 198656, 537001984, 537067520, 537004032, 537069568], l = [0, 262144, 0, 262144, 2, 262146, 2, 262146, 33554432, 33816576, 33554432, 33816576, 33554434, 33816578, 33554434, 33816578], h = [0, 268435456, 8, 268435464, 0, 268435456, 8, 268435464, 1024, 268436480, 1032, 268436488, 1024, 268436480, 1032, 268436488], p = [0, 32, 0, 32, 1048576, 1048608, 1048576, 1048608, 8192, 8224, 8192, 8224, 1056768, 1056800, 1056768, 1056800], f = [0, 16777216, 512, 16777728, 2097152, 18874368, 2097664, 18874880, 67108864, 83886080, 67109376, 83886592, 69206016, 85983232, 69206528, 85983744], d = [0, 4096, 134217728, 134221824, 524288, 528384, 134742016, 134746112, 16, 4112, 134217744, 134221840, 524304, 528400, 134742032, 134746128], y = [0, 4, 256, 260, 0, 4, 256, 260, 1, 5, 257, 261, 1, 5, 257, 261], g = t.length() > 8 ? 3 : 1, m = [], v = [0, 0, 1, 1, 1, 1, 1, 1, 0, 1, 1, 1, 1, 1, 1, 0], C = 0, E = 0; E < g; E++) {
        var S = t.getInt32(), T = t.getInt32();
        e = 252645135 & (S >>> 4 ^ T), T ^= e, S ^= e << 4, e = 65535 & (T >>> -16 ^ S), S ^= e, T ^= e << -16, e = 858993459 & (S >>> 2 ^ T), T ^= e, S ^= e << 2, e = 65535 & (T >>> -16 ^ S), S ^= e, T ^= e << -16, e = 1431655765 & (S >>> 1 ^ T), T ^= e, S ^= e << 1, e = 16711935 & (T >>> 8 ^ S), S ^= e, T ^= e << 8, e = 1431655765 & (S >>> 1 ^ T), T ^= e, S ^= e << 1, e = S << 8 | T >>> 20 & 240, S = T << 24 | T << 8 & 16711680 | T >>> 8 & 65280 | T >>> 24 & 240, T = e;
        for (var I = 0; I < v.length; ++I) {
            v[I] ? (S = S << 2 | S >>> 26, T = T << 2 | T >>> 26) : (S = S << 1 | S >>> 27, T = T << 1 | T >>> 27), S &= -15, T &= -15;
            var b = r[S >>> 28] | a[S >>> 24 & 15] | i[S >>> 20 & 15] | n[S >>> 16 & 15] | s[S >>> 12 & 15] | o[S >>> 8 & 15] | u[S >>> 4 & 15], A = c[T >>> 28] | l[T >>> 24 & 15] | h[T >>> 20 & 15] | p[T >>> 16 & 15] | f[T >>> 12 & 15] | d[T >>> 8 & 15] | y[T >>> 4 & 15];
            e = 65535 & (A >>> 16 ^ b), m[C++] = b ^ e, m[C++] = A ^ e << 16;
        }
    } return m; } function n(t, e, r, a) { var i, n = 32 === t.length ? 3 : 9; i = 3 === n ? a ? [30, -2, -2] : [0, 32, 2] : a ? [94, 62, -2, 32, 64, 2, 30, -2, -2] : [0, 32, 2, 62, 30, -2, 64, 96, 2]; var s, o = e[0], g = e[1]; s = 252645135 & (o >>> 4 ^ g), g ^= s, o ^= s << 4, s = 65535 & (o >>> 16 ^ g), g ^= s, o ^= s << 16, s = 858993459 & (g >>> 2 ^ o), o ^= s, g ^= s << 2, s = 16711935 & (g >>> 8 ^ o), o ^= s, g ^= s << 8, s = 1431655765 & (o >>> 1 ^ g), g ^= s, o ^= s << 1, o = o << 1 | o >>> 31, g = g << 1 | g >>> 31; for (var m = 0; m < n; m += 3) {
        for (var v = i[m + 1], C = i[m + 2], E = i[m]; E != v; E += C) {
            var S = g ^ t[E], T = (g >>> 4 | g << 28) ^ t[E + 1];
            s = o, o = g, g = s ^ (c[S >>> 24 & 63] | h[S >>> 16 & 63] | f[S >>> 8 & 63] | y[63 & S] | u[T >>> 24 & 63] | l[T >>> 16 & 63] | p[T >>> 8 & 63] | d[63 & T]);
        }
        s = o, o = g, g = s;
    } o = o >>> 1 | o << 31, g = g >>> 1 | g << 31, s = 1431655765 & (o >>> 1 ^ g), g ^= s, o ^= s << 1, s = 16711935 & (g >>> 8 ^ o), o ^= s, g ^= s << 8, s = 858993459 & (g >>> 2 ^ o), o ^= s, g ^= s << 2, s = 65535 & (o >>> 16 ^ g), g ^= s, o ^= s << 16, s = 252645135 & (o >>> 4 ^ g), g ^= s, o ^= s << 4, r[0] = o, r[1] = g; } function s(t) { t = t || {}; var e, r = (t.mode || "CBC").toUpperCase(), a = "DES-" + r; e = t.decrypt ? o.cipher.createDecipher(a, t.key) : o.cipher.createCipher(a, t.key); var i = e.start; return e.start = function (t, r) { var a = null; r instanceof o.util.ByteBuffer && (a = r, r = {}), r = r || {}, r.output = a, r.iv = t, i.call(e, r); }, e; } var o = r(0); r(8), r(9), r(1), t.exports = o.des = o.des || {}, o.des.startEncrypting = function (t, e, r, a) { var i = s({ key: t, output: r, decrypt: !1, mode: a || (null === e ? "ECB" : "CBC") }); return i.start(e), i; }, o.des.createEncryptionCipher = function (t, e) { return s({ key: t, output: null, decrypt: !1, mode: e }); }, o.des.startDecrypting = function (t, e, r, a) { var i = s({ key: t, output: r, decrypt: !0, mode: a || (null === e ? "ECB" : "CBC") }); return i.start(e), i; }, o.des.createDecryptionCipher = function (t, e) { return s({ key: t, output: null, decrypt: !0, mode: e }); }, o.des.Algorithm = function (t, e) { var r = this; r.name = t, r.mode = new e({ blockSize: 8, cipher: { encrypt: function (t, e) { return n(r._keys, t, e, !1); }, decrypt: function (t, e) { return n(r._keys, t, e, !0); } } }), r._init = !1; }, o.des.Algorithm.prototype.initialize = function (t) { if (!this._init) {
        var e = o.util.createBuffer(t.key);
        if (0 === this.name.indexOf("3DES") && 24 !== e.length())
            throw new Error("Invalid Triple-DES key size: " + 8 * e.length());
        this._keys = i(e), this._init = !0;
    } }, a("DES-ECB", o.cipher.modes.ecb), a("DES-CBC", o.cipher.modes.cbc), a("DES-CFB", o.cipher.modes.cfb), a("DES-OFB", o.cipher.modes.ofb), a("DES-CTR", o.cipher.modes.ctr), a("3DES-ECB", o.cipher.modes.ecb), a("3DES-CBC", o.cipher.modes.cbc), a("3DES-CFB", o.cipher.modes.cfb), a("3DES-OFB", o.cipher.modes.ofb), a("3DES-CTR", o.cipher.modes.ctr); var u = [16843776, 0, 65536, 16843780, 16842756, 66564, 4, 65536, 1024, 16843776, 16843780, 1024, 16778244, 16842756, 16777216, 4, 1028, 16778240, 16778240, 66560, 66560, 16842752, 16842752, 16778244, 65540, 16777220, 16777220, 65540, 0, 1028, 66564, 16777216, 65536, 16843780, 4, 16842752, 16843776, 16777216, 16777216, 1024, 16842756, 65536, 66560, 16777220, 1024, 4, 16778244, 66564, 16843780, 65540, 16842752, 16778244, 16777220, 1028, 66564, 16843776, 1028, 16778240, 16778240, 0, 65540, 66560, 0, 16842756], c = [-2146402272, -2147450880, 32768, 1081376, 1048576, 32, -2146435040, -2147450848, -2147483616, -2146402272, -2146402304, -2147483648, -2147450880, 1048576, 32, -2146435040, 1081344, 1048608, -2147450848, 0, -2147483648, 32768, 1081376, -2146435072, 1048608, -2147483616, 0, 1081344, 32800, -2146402304, -2146435072, 32800, 0, 1081376, -2146435040, 1048576, -2147450848, -2146435072, -2146402304, 32768, -2146435072, -2147450880, 32, -2146402272, 1081376, 32, 32768, -2147483648, 32800, -2146402304, 1048576, -2147483616, 1048608, -2147450848, -2147483616, 1048608, 1081344, 0, -2147450880, 32800, -2147483648, -2146435040, -2146402272, 1081344], l = [520, 134349312, 0, 134348808, 134218240, 0, 131592, 134218240, 131080, 134217736, 134217736, 131072, 134349320, 131080, 134348800, 520, 134217728, 8, 134349312, 512, 131584, 134348800, 134348808, 131592, 134218248, 131584, 131072, 134218248, 8, 134349320, 512, 134217728, 134349312, 134217728, 131080, 520, 131072, 134349312, 134218240, 0, 512, 131080, 134349320, 134218240, 134217736, 512, 0, 134348808, 134218248, 131072, 134217728, 134349320, 8, 131592, 131584, 134217736, 134348800, 134218248, 520, 134348800, 131592, 8, 134348808, 131584], h = [8396801, 8321, 8321, 128, 8396928, 8388737, 8388609, 8193, 0, 8396800, 8396800, 8396929, 129, 0, 8388736, 8388609, 1, 8192, 8388608, 8396801, 128, 8388608, 8193, 8320, 8388737, 1, 8320, 8388736, 8192, 8396928, 8396929, 129, 8388736, 8388609, 8396800, 8396929, 129, 0, 0, 8396800, 8320, 8388736, 8388737, 1, 8396801, 8321, 8321, 128, 8396929, 129, 1, 8192, 8388609, 8193, 8396928, 8388737, 8193, 8320, 8388608, 8396801, 128, 8388608, 8192, 8396928], p = [256, 34078976, 34078720, 1107296512, 524288, 256, 1073741824, 34078720, 1074266368, 524288, 33554688, 1074266368, 1107296512, 1107820544, 524544, 1073741824, 33554432, 1074266112, 1074266112, 0, 1073742080, 1107820800, 1107820800, 33554688, 1107820544, 1073742080, 0, 1107296256, 34078976, 33554432, 1107296256, 524544, 524288, 1107296512, 256, 33554432, 1073741824, 34078720, 1107296512, 1074266368, 33554688, 1073741824, 1107820544, 34078976, 1074266368, 256, 33554432, 1107820544, 1107820800, 524544, 1107296256, 1107820800, 34078720, 0, 1074266112, 1107296256, 524544, 33554688, 1073742080, 524288, 0, 1074266112, 34078976, 1073742080], f = [536870928, 541065216, 16384, 541081616, 541065216, 16, 541081616, 4194304, 536887296, 4210704, 4194304, 536870928, 4194320, 536887296, 536870912, 16400, 0, 4194320, 536887312, 16384, 4210688, 536887312, 16, 541065232, 541065232, 0, 4210704, 541081600, 16400, 4210688, 541081600, 536870912, 536887296, 16, 541065232, 4210688, 541081616, 4194304, 16400, 536870928, 4194304, 536887296, 536870912, 16400, 536870928, 541081616, 4210688, 541065216, 4210704, 541081600, 0, 541065232, 16, 16384, 541065216, 4210704, 16384, 4194320, 536887312, 0, 541081600, 536870912, 4194320, 536887312], d = [2097152, 69206018, 67110914, 0, 2048, 67110914, 2099202, 69208064, 69208066, 2097152, 0, 67108866, 2, 67108864, 69206018, 2050, 67110912, 2099202, 2097154, 67110912, 67108866, 69206016, 69208064, 2097154, 69206016, 2048, 2050, 69208066, 2099200, 2, 67108864, 2099200, 67108864, 2099200, 2097152, 67110914, 67110914, 69206018, 69206018, 2, 2097154, 67108864, 67110912, 2097152, 69208064, 2050, 2099202, 69208064, 2050, 67108866, 69208066, 69206016, 2099200, 0, 2, 69208066, 0, 2099202, 69206016, 2048, 67108866, 67110912, 2048, 2097154], y = [268439616, 4096, 262144, 268701760, 268435456, 268439616, 64, 268435456, 262208, 268697600, 268701760, 266240, 268701696, 266304, 4096, 64, 268697600, 268435520, 268439552, 4160, 266240, 262208, 268697664, 268701696, 4160, 0, 0, 268697664, 268435520, 268439552, 266304, 262144, 266304, 262144, 268701696, 4096, 64, 268697664, 4096, 266304, 268439552, 64, 268435520, 268697600, 268697664, 268435456, 262144, 268439616, 0, 268701760, 262208, 268435520, 268697600, 268439552, 268439616, 0, 268701760, 266240, 266240, 4160, 4160, 262208, 268435456, 268701696]; }, function (t, e, r) { var a = r(0); r(4), r(1), (t.exports = a.hmac = a.hmac || {}).create = function () { var t = null, e = null, r = null, i = null, n = {}; return n.start = function (n, s) { if (null !== n)
        if ("string" == typeof n) {
            if (!((n = n.toLowerCase()) in a.md.algorithms))
                throw new Error('Unknown hash algorithm "' + n + '"');
            e = a.md.algorithms[n].create();
        }
        else
            e = n; if (null === s)
        s = t;
    else {
        if ("string" == typeof s)
            s = a.util.createBuffer(s);
        else if (a.util.isArray(s)) {
            var o = s;
            s = a.util.createBuffer();
            for (var u = 0; u < o.length; ++u)
                s.putByte(o[u]);
        }
        var c = s.length();
        c > e.blockLength && (e.start(), e.update(s.bytes()), s = e.digest()), r = a.util.createBuffer(), i = a.util.createBuffer(), c = s.length();
        for (var u = 0; u < c; ++u) {
            var o = s.at(u);
            r.putByte(54 ^ o), i.putByte(92 ^ o);
        }
        if (c < e.blockLength)
            for (var o = e.blockLength - c, u = 0; u < o; ++u)
                r.putByte(54), i.putByte(92);
        t = s, r = r.bytes(), i = i.bytes();
    } e.start(), e.update(r); }, n.update = function (t) { e.update(t); }, n.getMac = function () { var t = e.digest().bytes(); return e.start(), e.update(i), e.update(t), e.digest(); }, n.digest = n.getMac, n; }; }, function (t, e, r) { function a() { o = String.fromCharCode(128), o += n.util.fillString(String.fromCharCode(0), 64), c = [1116352408, 1899447441, 3049323471, 3921009573, 961987163, 1508970993, 2453635748, 2870763221, 3624381080, 310598401, 607225278, 1426881987, 1925078388, 2162078206, 2614888103, 3248222580, 3835390401, 4022224774, 264347078, 604807628, 770255983, 1249150122, 1555081692, 1996064986, 2554220882, 2821834349, 2952996808, 3210313671, 3336571891, 3584528711, 113926993, 338241895, 666307205, 773529912, 1294757372, 1396182291, 1695183700, 1986661051, 2177026350, 2456956037, 2730485921, 2820302411, 3259730800, 3345764771, 3516065817, 3600352804, 4094571909, 275423344, 430227734, 506948616, 659060556, 883997877, 958139571, 1322822218, 1537002063, 1747873779, 1955562222, 2024104815, 2227730452, 2361852424, 2428436474, 2756734187, 3204031479, 3329325298], u = !0; } function i(t, e, r) { for (var a, i, n, s, o, u, l, h, p, f, d, y, g, m, v, C = r.length(); C >= 64;) {
        for (l = 0; l < 16; ++l)
            e[l] = r.getInt32();
        for (; l < 64; ++l)
            a = e[l - 2], a = (a >>> 17 | a << 15) ^ (a >>> 19 | a << 13) ^ a >>> 10, i = e[l - 15], i = (i >>> 7 | i << 25) ^ (i >>> 18 | i << 14) ^ i >>> 3, e[l] = a + e[l - 7] + i + e[l - 16] | 0;
        for (h = t.h0, p = t.h1, f = t.h2, d = t.h3, y = t.h4, g = t.h5, m = t.h6, v = t.h7, l = 0; l < 64; ++l)
            s = (y >>> 6 | y << 26) ^ (y >>> 11 | y << 21) ^ (y >>> 25 | y << 7), o = m ^ y & (g ^ m), n = (h >>> 2 | h << 30) ^ (h >>> 13 | h << 19) ^ (h >>> 22 | h << 10), u = h & p | f & (h ^ p), a = v + s + o + c[l] + e[l], i = n + u, v = m, m = g, g = y, y = d + a >>> 0, d = f, f = p, p = h, h = a + i >>> 0;
        t.h0 = t.h0 + h | 0, t.h1 = t.h1 + p | 0, t.h2 = t.h2 + f | 0, t.h3 = t.h3 + d | 0, t.h4 = t.h4 + y | 0, t.h5 = t.h5 + g | 0, t.h6 = t.h6 + m | 0, t.h7 = t.h7 + v | 0, C -= 64;
    } } var n = r(0); r(4), r(1); var s = t.exports = n.sha256 = n.sha256 || {}; n.md.sha256 = n.md.algorithms.sha256 = s, s.create = function () { u || a(); var t = null, e = n.util.createBuffer(), r = new Array(64), s = { algorithm: "sha256", blockLength: 64, digestLength: 32, messageLength: 0, fullMessageLength: null, messageLengthSize: 8 }; return s.start = function () { s.messageLength = 0, s.fullMessageLength = s.messageLength64 = []; for (var r = s.messageLengthSize / 4, a = 0; a < r; ++a)
        s.fullMessageLength.push(0); return e = n.util.createBuffer(), t = { h0: 1779033703, h1: 3144134277, h2: 1013904242, h3: 2773480762, h4: 1359893119, h5: 2600822924, h6: 528734635, h7: 1541459225 }, s; }, s.start(), s.update = function (a, o) { "utf8" === o && (a = n.util.encodeUtf8(a)); var u = a.length; s.messageLength += u, u = [u / 4294967296 >>> 0, u >>> 0]; for (var c = s.fullMessageLength.length - 1; c >= 0; --c)
        s.fullMessageLength[c] += u[1], u[1] = u[0] + (s.fullMessageLength[c] / 4294967296 >>> 0), s.fullMessageLength[c] = s.fullMessageLength[c] >>> 0, u[0] = u[1] / 4294967296 >>> 0; return e.putBytes(a), i(t, r, e), (e.read > 2048 || 0 === e.length()) && e.compact(), s; }, s.digest = function () { var a = n.util.createBuffer(); a.putBytes(e.bytes()); var u = s.fullMessageLength[s.fullMessageLength.length - 1] + s.messageLengthSize, c = u & s.blockLength - 1; a.putBytes(o.substr(0, s.blockLength - c)); for (var l, h, p = 8 * s.fullMessageLength[0], f = 0; f < s.fullMessageLength.length - 1; ++f)
        l = 8 * s.fullMessageLength[f + 1], h = l / 4294967296 >>> 0, p += h, a.putInt32(p >>> 0), p = l >>> 0; a.putInt32(p); var d = { h0: t.h0, h1: t.h1, h2: t.h2, h3: t.h3, h4: t.h4, h5: t.h5, h6: t.h6, h7: t.h7 }; i(d, r, a); var y = n.util.createBuffer(); return y.putInt32(d.h0), y.putInt32(d.h1), y.putInt32(d.h2), y.putInt32(d.h3), y.putInt32(d.h4), y.putInt32(d.h5), y.putInt32(d.h6), y.putInt32(d.h7), y; }, s; }; var o = null, u = !1, c = null; }, function (t, e, r) { function a(t, e, r) { this.data = [], null != t && ("number" == typeof t ? this.fromNumber(t, e, r) : null == e && "string" != typeof t ? this.fromString(t, 256) : this.fromString(t, e)); } function i() { return new a(null); } function n(t, e, r, a, i, n) { for (; --n >= 0;) {
        var s = e * this.data[t++] + r.data[a] + i;
        i = Math.floor(s / 67108864), r.data[a++] = 67108863 & s;
    } return i; } function s(t, e, r, a, i, n) { for (var s = 32767 & e, o = e >> 15; --n >= 0;) {
        var u = 32767 & this.data[t], c = this.data[t++] >> 15, l = o * u + c * s;
        u = s * u + ((32767 & l) << 15) + r.data[a] + (1073741823 & i), i = (u >>> 30) + (l >>> 15) + o * c + (i >>> 30), r.data[a++] = 1073741823 & u;
    } return i; } function o(t, e, r, a, i, n) { for (var s = 16383 & e, o = e >> 14; --n >= 0;) {
        var u = 16383 & this.data[t], c = this.data[t++] >> 14, l = o * u + c * s;
        u = s * u + ((16383 & l) << 14) + r.data[a] + i, i = (u >> 28) + (l >> 14) + o * c, r.data[a++] = 268435455 & u;
    } return i; } function u(t) { return ne.charAt(t); } function c(t, e) { var r = se[t.charCodeAt(e)]; return null == r ? -1 : r; } function l(t) { for (var e = this.t - 1; e >= 0; --e)
        t.data[e] = this.data[e]; t.t = this.t, t.s = this.s; } function h(t) { this.t = 1, this.s = t < 0 ? -1 : 0, t > 0 ? this.data[0] = t : t < -1 ? this.data[0] = t + this.DV : this.t = 0; } function p(t) { var e = i(); return e.fromInt(t), e; } function f(t, e) { var r; if (16 == e)
        r = 4;
    else if (8 == e)
        r = 3;
    else if (256 == e)
        r = 8;
    else if (2 == e)
        r = 1;
    else if (32 == e)
        r = 5;
    else {
        if (4 != e)
            return void this.fromRadix(t, e);
        r = 2;
    } this.t = 0, this.s = 0; for (var i = t.length, n = !1, s = 0; --i >= 0;) {
        var o = 8 == r ? 255 & t[i] : c(t, i);
        o < 0 ? "-" == t.charAt(i) && (n = !0) : (n = !1, 0 == s ? this.data[this.t++] = o : s + r > this.DB ? (this.data[this.t - 1] |= (o & (1 << this.DB - s) - 1) << s, this.data[this.t++] = o >> this.DB - s) : this.data[this.t - 1] |= o << s, (s += r) >= this.DB && (s -= this.DB));
    } 8 == r && 0 != (128 & t[0]) && (this.s = -1, s > 0 && (this.data[this.t - 1] |= (1 << this.DB - s) - 1 << s)), this.clamp(), n && a.ZERO.subTo(this, this); } function d() { for (var t = this.s & this.DM; this.t > 0 && this.data[this.t - 1] == t;)
        --this.t; } function y(t) { if (this.s < 0)
        return "-" + this.negate().toString(t); var e; if (16 == t)
        e = 4;
    else if (8 == t)
        e = 3;
    else if (2 == t)
        e = 1;
    else if (32 == t)
        e = 5;
    else {
        if (4 != t)
            return this.toRadix(t);
        e = 2;
    } var r, a = (1 << e) - 1, i = !1, n = "", s = this.t, o = this.DB - s * this.DB % e; if (s-- > 0)
        for (o < this.DB && (r = this.data[s] >> o) > 0 && (i = !0, n = u(r)); s >= 0;)
            o < e ? (r = (this.data[s] & (1 << o) - 1) << e - o, r |= this.data[--s] >> (o += this.DB - e)) : (r = this.data[s] >> (o -= e) & a, o <= 0 && (o += this.DB, --s)), r > 0 && (i = !0), i && (n += u(r)); return i ? n : "0"; } function g() { var t = i(); return a.ZERO.subTo(this, t), t; } function m() { return this.s < 0 ? this.negate() : this; } function v(t) { var e = this.s - t.s; if (0 != e)
        return e; var r = this.t; if (0 != (e = r - t.t))
        return this.s < 0 ? -e : e; for (; --r >= 0;)
        if (0 != (e = this.data[r] - t.data[r]))
            return e; return 0; } function C(t) { var e, r = 1; return 0 != (e = t >>> 16) && (t = e, r += 16), 0 != (e = t >> 8) && (t = e, r += 8), 0 != (e = t >> 4) && (t = e, r += 4), 0 != (e = t >> 2) && (t = e, r += 2), 0 != (e = t >> 1) && (t = e, r += 1), r; } function E() { return this.t <= 0 ? 0 : this.DB * (this.t - 1) + C(this.data[this.t - 1] ^ this.s & this.DM); } function S(t, e) { var r; for (r = this.t - 1; r >= 0; --r)
        e.data[r + t] = this.data[r]; for (r = t - 1; r >= 0; --r)
        e.data[r] = 0; e.t = this.t + t, e.s = this.s; } function T(t, e) { for (var r = t; r < this.t; ++r)
        e.data[r - t] = this.data[r]; e.t = Math.max(this.t - t, 0), e.s = this.s; } function I(t, e) { var r, a = t % this.DB, i = this.DB - a, n = (1 << i) - 1, s = Math.floor(t / this.DB), o = this.s << a & this.DM; for (r = this.t - 1; r >= 0; --r)
        e.data[r + s + 1] = this.data[r] >> i | o, o = (this.data[r] & n) << a; for (r = s - 1; r >= 0; --r)
        e.data[r] = 0; e.data[s] = o, e.t = this.t + s + 1, e.s = this.s, e.clamp(); } function b(t, e) { e.s = this.s; var r = Math.floor(t / this.DB); if (r >= this.t)
        return void (e.t = 0); var a = t % this.DB, i = this.DB - a, n = (1 << a) - 1; e.data[0] = this.data[r] >> a; for (var s = r + 1; s < this.t; ++s)
        e.data[s - r - 1] |= (this.data[s] & n) << i, e.data[s - r] = this.data[s] >> a; a > 0 && (e.data[this.t - r - 1] |= (this.s & n) << i), e.t = this.t - r, e.clamp(); } function A(t, e) { for (var r = 0, a = 0, i = Math.min(t.t, this.t); r < i;)
        a += this.data[r] - t.data[r], e.data[r++] = a & this.DM, a >>= this.DB; if (t.t < this.t) {
        for (a -= t.s; r < this.t;)
            a += this.data[r], e.data[r++] = a & this.DM, a >>= this.DB;
        a += this.s;
    }
    else {
        for (a += this.s; r < t.t;)
            a -= t.data[r], e.data[r++] = a & this.DM, a >>= this.DB;
        a -= t.s;
    } e.s = a < 0 ? -1 : 0, a < -1 ? e.data[r++] = this.DV + a : a > 0 && (e.data[r++] = a), e.t = r, e.clamp(); } function B(t, e) { var r = this.abs(), i = t.abs(), n = r.t; for (e.t = n + i.t; --n >= 0;)
        e.data[n] = 0; for (n = 0; n < i.t; ++n)
        e.data[n + r.t] = r.am(0, i.data[n], e, n, 0, r.t); e.s = 0, e.clamp(), this.s != t.s && a.ZERO.subTo(e, e); } function N(t) { for (var e = this.abs(), r = t.t = 2 * e.t; --r >= 0;)
        t.data[r] = 0; for (r = 0; r < e.t - 1; ++r) {
        var a = e.am(r, e.data[r], t, 2 * r, 0, 1);
        (t.data[r + e.t] += e.am(r + 1, 2 * e.data[r], t, 2 * r + 1, a, e.t - r - 1)) >= e.DV && (t.data[r + e.t] -= e.DV, t.data[r + e.t + 1] = 1);
    } t.t > 0 && (t.data[t.t - 1] += e.am(r, e.data[r], t, 2 * r, 0, 1)), t.s = 0, t.clamp(); } function R(t, e, r) { var n = t.abs(); if (!(n.t <= 0)) {
        var s = this.abs();
        if (s.t < n.t)
            return null != e && e.fromInt(0), void (null != r && this.copyTo(r));
        null == r && (r = i());
        var o = i(), u = this.s, c = t.s, l = this.DB - C(n.data[n.t - 1]);
        l > 0 ? (n.lShiftTo(l, o), s.lShiftTo(l, r)) : (n.copyTo(o), s.copyTo(r));
        var h = o.t, p = o.data[h - 1];
        if (0 != p) {
            var f = p * (1 << this.F1) + (h > 1 ? o.data[h - 2] >> this.F2 : 0), d = this.FV / f, y = (1 << this.F1) / f, g = 1 << this.F2, m = r.t, v = m - h, E = null == e ? i() : e;
            for (o.dlShiftTo(v, E), r.compareTo(E) >= 0 && (r.data[r.t++] = 1, r.subTo(E, r)), a.ONE.dlShiftTo(h, E), E.subTo(o, o); o.t < h;)
                o.data[o.t++] = 0;
            for (; --v >= 0;) {
                var S = r.data[--m] == p ? this.DM : Math.floor(r.data[m] * d + (r.data[m - 1] + g) * y);
                if ((r.data[m] += o.am(0, S, r, v, 0, h)) < S)
                    for (o.dlShiftTo(v, E), r.subTo(E, r); r.data[m] < --S;)
                        r.subTo(E, r);
            }
            null != e && (r.drShiftTo(h, e), u != c && a.ZERO.subTo(e, e)), r.t = h, r.clamp(), l > 0 && r.rShiftTo(l, r), u < 0 && a.ZERO.subTo(r, r);
        }
    } } function w(t) { var e = i(); return this.abs().divRemTo(t, null, e), this.s < 0 && e.compareTo(a.ZERO) > 0 && t.subTo(e, e), e; } function U(t) { this.m = t; } function L(t) { return t.s < 0 || t.compareTo(this.m) >= 0 ? t.mod(this.m) : t; } function k(t) { return t; } function D(t) { t.divRemTo(this.m, null, t); } function P(t, e, r) { t.multiplyTo(e, r), this.reduce(r); } function O(t, e) { t.squareTo(e), this.reduce(e); } function V() { if (this.t < 1)
        return 0; var t = this.data[0]; if (0 == (1 & t))
        return 0; var e = 3 & t; return e = e * (2 - (15 & t) * e) & 15, e = e * (2 - (255 & t) * e) & 255, e = e * (2 - ((65535 & t) * e & 65535)) & 65535, e = e * (2 - t * e % this.DV) % this.DV, e > 0 ? this.DV - e : -e; } function _(t) { this.m = t, this.mp = t.invDigit(), this.mpl = 32767 & this.mp, this.mph = this.mp >> 15, this.um = (1 << t.DB - 15) - 1, this.mt2 = 2 * t.t; } function K(t) { var e = i(); return t.abs().dlShiftTo(this.m.t, e), e.divRemTo(this.m, null, e), t.s < 0 && e.compareTo(a.ZERO) > 0 && this.m.subTo(e, e), e; } function x(t) { var e = i(); return t.copyTo(e), this.reduce(e), e; } function M(t) { for (; t.t <= this.mt2;)
        t.data[t.t++] = 0; for (var e = 0; e < this.m.t; ++e) {
        var r = 32767 & t.data[e], a = r * this.mpl + ((r * this.mph + (t.data[e] >> 15) * this.mpl & this.um) << 15) & t.DM;
        for (r = e + this.m.t, t.data[r] += this.m.am(0, a, t, e, 0, this.m.t); t.data[r] >= t.DV;)
            t.data[r] -= t.DV, t.data[++r]++;
    } t.clamp(), t.drShiftTo(this.m.t, t), t.compareTo(this.m) >= 0 && t.subTo(this.m, t); } function F(t, e) { t.squareTo(e), this.reduce(e); } function j(t, e, r) { t.multiplyTo(e, r), this.reduce(r); } function q() { return 0 == (this.t > 0 ? 1 & this.data[0] : this.s); } function G(t, e) { if (t > 4294967295 || t < 1)
        return a.ONE; var r = i(), n = i(), s = e.convert(this), o = C(t) - 1; for (s.copyTo(r); --o >= 0;)
        if (e.sqrTo(r, n), (t & 1 << o) > 0)
            e.mulTo(n, s, r);
        else {
            var u = r;
            r = n, n = u;
        } return e.revert(r); } function Q(t, e) { var r; return r = t < 256 || e.isEven() ? new U(e) : new _(e), this.exp(t, r); } function z() { var t = i(); return this.copyTo(t), t; } function H() { if (this.s < 0) {
        if (1 == this.t)
            return this.data[0] - this.DV;
        if (0 == this.t)
            return -1;
    }
    else {
        if (1 == this.t)
            return this.data[0];
        if (0 == this.t)
            return 0;
    } return (this.data[1] & (1 << 32 - this.DB) - 1) << this.DB | this.data[0]; } function W() { return 0 == this.t ? this.s : this.data[0] << 24 >> 24; } function X() { return 0 == this.t ? this.s : this.data[0] << 16 >> 16; } function Y(t) { return Math.floor(Math.LN2 * this.DB / Math.log(t)); } function Z() { return this.s < 0 ? -1 : this.t <= 0 || 1 == this.t && this.data[0] <= 0 ? 0 : 1; } function J(t) { if (null == t && (t = 10), 0 == this.signum() || t < 2 || t > 36)
        return "0"; var e = this.chunkSize(t), r = Math.pow(t, e), a = p(r), n = i(), s = i(), o = ""; for (this.divRemTo(a, n, s); n.signum() > 0;)
        o = (r + s.intValue()).toString(t).substr(1) + o, n.divRemTo(a, n, s); return s.intValue().toString(t) + o; } function $(t, e) { this.fromInt(0), null == e && (e = 10); for (var r = this.chunkSize(e), i = Math.pow(e, r), n = !1, s = 0, o = 0, u = 0; u < t.length; ++u) {
        var l = c(t, u);
        l < 0 ? "-" == t.charAt(u) && 0 == this.signum() && (n = !0) : (o = e * o + l, ++s >= r && (this.dMultiply(i), this.dAddOffset(o, 0), s = 0, o = 0));
    } s > 0 && (this.dMultiply(Math.pow(e, s)), this.dAddOffset(o, 0)), n && a.ZERO.subTo(this, this); } function tt(t, e, r) { if ("number" == typeof e)
        if (t < 2)
            this.fromInt(1);
        else
            for (this.fromNumber(t, r), this.testBit(t - 1) || this.bitwiseTo(a.ONE.shiftLeft(t - 1), ut, this), this.isEven() && this.dAddOffset(1, 0); !this.isProbablePrime(e);)
                this.dAddOffset(2, 0), this.bitLength() > t && this.subTo(a.ONE.shiftLeft(t - 1), this);
    else {
        var i = new Array, n = 7 & t;
        i.length = 1 + (t >> 3), e.nextBytes(i), n > 0 ? i[0] &= (1 << n) - 1 : i[0] = 0, this.fromString(i, 256);
    } } function et() { var t = this.t, e = new Array; e[0] = this.s; var r, a = this.DB - t * this.DB % 8, i = 0; if (t-- > 0)
        for (a < this.DB && (r = this.data[t] >> a) != (this.s & this.DM) >> a && (e[i++] = r | this.s << this.DB - a); t >= 0;)
            a < 8 ? (r = (this.data[t] & (1 << a) - 1) << 8 - a, r |= this.data[--t] >> (a += this.DB - 8)) : (r = this.data[t] >> (a -= 8) & 255, a <= 0 && (a += this.DB, --t)), 0 != (128 & r) && (r |= -256), 0 == i && (128 & this.s) != (128 & r) && ++i, (i > 0 || r != this.s) && (e[i++] = r); return e; } function rt(t) { return 0 == this.compareTo(t); } function at(t) { return this.compareTo(t) < 0 ? this : t; } function it(t) { return this.compareTo(t) > 0 ? this : t; } function nt(t, e, r) { var a, i, n = Math.min(t.t, this.t); for (a = 0; a < n; ++a)
        r.data[a] = e(this.data[a], t.data[a]); if (t.t < this.t) {
        for (i = t.s & this.DM, a = n; a < this.t; ++a)
            r.data[a] = e(this.data[a], i);
        r.t = this.t;
    }
    else {
        for (i = this.s & this.DM, a = n; a < t.t; ++a)
            r.data[a] = e(i, t.data[a]);
        r.t = t.t;
    } r.s = e(this.s, t.s), r.clamp(); } function st(t, e) { return t & e; } function ot(t) { var e = i(); return this.bitwiseTo(t, st, e), e; } function ut(t, e) { return t | e; } function ct(t) { var e = i(); return this.bitwiseTo(t, ut, e), e; } function lt(t, e) { return t ^ e; } function ht(t) { var e = i(); return this.bitwiseTo(t, lt, e), e; } function pt(t, e) { return t & ~e; } function ft(t) { var e = i(); return this.bitwiseTo(t, pt, e), e; } function dt() { for (var t = i(), e = 0; e < this.t; ++e)
        t.data[e] = this.DM & ~this.data[e]; return t.t = this.t, t.s = ~this.s, t; } function yt(t) { var e = i(); return t < 0 ? this.rShiftTo(-t, e) : this.lShiftTo(t, e), e; } function gt(t) { var e = i(); return t < 0 ? this.lShiftTo(-t, e) : this.rShiftTo(t, e), e; } function mt(t) { if (0 == t)
        return -1; var e = 0; return 0 == (65535 & t) && (t >>= 16, e += 16), 0 == (255 & t) && (t >>= 8, e += 8), 0 == (15 & t) && (t >>= 4, e += 4), 0 == (3 & t) && (t >>= 2, e += 2), 0 == (1 & t) && ++e, e; } function vt() { for (var t = 0; t < this.t; ++t)
        if (0 != this.data[t])
            return t * this.DB + mt(this.data[t]); return this.s < 0 ? this.t * this.DB : -1; } function Ct(t) { for (var e = 0; 0 != t;)
        t &= t - 1, ++e; return e; } function Et() { for (var t = 0, e = this.s & this.DM, r = 0; r < this.t; ++r)
        t += Ct(this.data[r] ^ e); return t; } function St(t) { var e = Math.floor(t / this.DB); return e >= this.t ? 0 != this.s : 0 != (this.data[e] & 1 << t % this.DB); } function Tt(t, e) { var r = a.ONE.shiftLeft(t); return this.bitwiseTo(r, e, r), r; } function It(t) { return this.changeBit(t, ut); } function bt(t) { return this.changeBit(t, pt); } function At(t) { return this.changeBit(t, lt); } function Bt(t, e) { for (var r = 0, a = 0, i = Math.min(t.t, this.t); r < i;)
        a += this.data[r] + t.data[r], e.data[r++] = a & this.DM, a >>= this.DB; if (t.t < this.t) {
        for (a += t.s; r < this.t;)
            a += this.data[r], e.data[r++] = a & this.DM, a >>= this.DB;
        a += this.s;
    }
    else {
        for (a += this.s; r < t.t;)
            a += t.data[r], e.data[r++] = a & this.DM, a >>= this.DB;
        a += t.s;
    } e.s = a < 0 ? -1 : 0, a > 0 ? e.data[r++] = a : a < -1 && (e.data[r++] = this.DV + a), e.t = r, e.clamp(); } function Nt(t) { var e = i(); return this.addTo(t, e), e; } function Rt(t) { var e = i(); return this.subTo(t, e), e; } function wt(t) { var e = i(); return this.multiplyTo(t, e), e; } function Ut(t) { var e = i(); return this.divRemTo(t, e, null), e; } function Lt(t) { var e = i(); return this.divRemTo(t, null, e), e; } function kt(t) { var e = i(), r = i(); return this.divRemTo(t, e, r), new Array(e, r); } function Dt(t) { this.data[this.t] = this.am(0, t - 1, this, 0, 0, this.t), ++this.t, this.clamp(); } function Pt(t, e) { if (0 != t) {
        for (; this.t <= e;)
            this.data[this.t++] = 0;
        for (this.data[e] += t; this.data[e] >= this.DV;)
            this.data[e] -= this.DV, ++e >= this.t && (this.data[this.t++] = 0), ++this.data[e];
    } } function Ot() { } function Vt(t) { return t; } function _t(t, e, r) { t.multiplyTo(e, r); } function Kt(t, e) { t.squareTo(e); } function xt(t) { return this.exp(t, new Ot); } function Mt(t, e, r) { var a = Math.min(this.t + t.t, e); for (r.s = 0, r.t = a; a > 0;)
        r.data[--a] = 0; var i; for (i = r.t - this.t; a < i; ++a)
        r.data[a + this.t] = this.am(0, t.data[a], r, a, 0, this.t); for (i = Math.min(t.t, e); a < i; ++a)
        this.am(0, t.data[a], r, a, 0, e - a); r.clamp(); } function Ft(t, e, r) { --e; var a = r.t = this.t + t.t - e; for (r.s = 0; --a >= 0;)
        r.data[a] = 0; for (a = Math.max(e - this.t, 0); a < t.t; ++a)
        r.data[this.t + a - e] = this.am(e - a, t.data[a], r, 0, 0, this.t + a - e); r.clamp(), r.drShiftTo(1, r); } function jt(t) { this.r2 = i(), this.q3 = i(), a.ONE.dlShiftTo(2 * t.t, this.r2), this.mu = this.r2.divide(t), this.m = t; } function qt(t) { if (t.s < 0 || t.t > 2 * this.m.t)
        return t.mod(this.m); if (t.compareTo(this.m) < 0)
        return t; var e = i(); return t.copyTo(e), this.reduce(e), e; } function Gt(t) { return t; } function Qt(t) { for (t.drShiftTo(this.m.t - 1, this.r2), t.t > this.m.t + 1 && (t.t = this.m.t + 1, t.clamp()), this.mu.multiplyUpperTo(this.r2, this.m.t + 1, this.q3), this.m.multiplyLowerTo(this.q3, this.m.t + 1, this.r2); t.compareTo(this.r2) < 0;)
        t.dAddOffset(1, this.m.t + 1); for (t.subTo(this.r2, t); t.compareTo(this.m) >= 0;)
        t.subTo(this.m, t); } function zt(t, e) { t.squareTo(e), this.reduce(e); } function Ht(t, e, r) { t.multiplyTo(e, r), this.reduce(r); } function Wt(t, e) { var r, a, n = t.bitLength(), s = p(1); if (n <= 0)
        return s; r = n < 18 ? 1 : n < 48 ? 3 : n < 144 ? 4 : n < 768 ? 5 : 6, a = n < 8 ? new U(e) : e.isEven() ? new jt(e) : new _(e); var o = new Array, u = 3, c = r - 1, l = (1 << r) - 1; if (o[1] = a.convert(this), r > 1) {
        var h = i();
        for (a.sqrTo(o[1], h); u <= l;)
            o[u] = i(), a.mulTo(h, o[u - 2], o[u]), u += 2;
    } var f, d, y = t.t - 1, g = !0, m = i(); for (n = C(t.data[y]) - 1; y >= 0;) {
        for (n >= c ? f = t.data[y] >> n - c & l : (f = (t.data[y] & (1 << n + 1) - 1) << c - n, y > 0 && (f |= t.data[y - 1] >> this.DB + n - c)), u = r; 0 == (1 & f);)
            f >>= 1, --u;
        if ((n -= u) < 0 && (n += this.DB, --y), g)
            o[f].copyTo(s), g = !1;
        else {
            for (; u > 1;)
                a.sqrTo(s, m), a.sqrTo(m, s), u -= 2;
            u > 0 ? a.sqrTo(s, m) : (d = s, s = m, m = d), a.mulTo(m, o[f], s);
        }
        for (; y >= 0 && 0 == (t.data[y] & 1 << n);)
            a.sqrTo(s, m), d = s, s = m, m = d, --n < 0 && (n = this.DB - 1, --y);
    } return a.revert(s); } function Xt(t) { var e = this.s < 0 ? this.negate() : this.clone(), r = t.s < 0 ? t.negate() : t.clone(); if (e.compareTo(r) < 0) {
        var a = e;
        e = r, r = a;
    } var i = e.getLowestSetBit(), n = r.getLowestSetBit(); if (n < 0)
        return e; for (i < n && (n = i), n > 0 && (e.rShiftTo(n, e), r.rShiftTo(n, r)); e.signum() > 0;)
        (i = e.getLowestSetBit()) > 0 && e.rShiftTo(i, e), (i = r.getLowestSetBit()) > 0 && r.rShiftTo(i, r), e.compareTo(r) >= 0 ? (e.subTo(r, e), e.rShiftTo(1, e)) : (r.subTo(e, r), r.rShiftTo(1, r)); return n > 0 && r.lShiftTo(n, r), r; } function Yt(t) { if (t <= 0)
        return 0; var e = this.DV % t, r = this.s < 0 ? t - 1 : 0; if (this.t > 0)
        if (0 == e)
            r = this.data[0] % t;
        else
            for (var a = this.t - 1; a >= 0; --a)
                r = (e * r + this.data[a]) % t; return r; } function Zt(t) { var e = t.isEven(); if (this.isEven() && e || 0 == t.signum())
        return a.ZERO; for (var r = t.clone(), i = this.clone(), n = p(1), s = p(0), o = p(0), u = p(1); 0 != r.signum();) {
        for (; r.isEven();)
            r.rShiftTo(1, r), e ? (n.isEven() && s.isEven() || (n.addTo(this, n), s.subTo(t, s)), n.rShiftTo(1, n)) : s.isEven() || s.subTo(t, s), s.rShiftTo(1, s);
        for (; i.isEven();)
            i.rShiftTo(1, i), e ? (o.isEven() && u.isEven() || (o.addTo(this, o), u.subTo(t, u)), o.rShiftTo(1, o)) : u.isEven() || u.subTo(t, u), u.rShiftTo(1, u);
        r.compareTo(i) >= 0 ? (r.subTo(i, r), e && n.subTo(o, n), s.subTo(u, s)) : (i.subTo(r, i), e && o.subTo(n, o), u.subTo(s, u));
    } return 0 != i.compareTo(a.ONE) ? a.ZERO : u.compareTo(t) >= 0 ? u.subtract(t) : u.signum() < 0 ? (u.addTo(t, u), u.signum() < 0 ? u.add(t) : u) : u; } function Jt(t) { var e, r = this.abs(); if (1 == r.t && r.data[0] <= oe[oe.length - 1]) {
        for (e = 0; e < oe.length; ++e)
            if (r.data[0] == oe[e])
                return !0;
        return !1;
    } if (r.isEven())
        return !1; for (e = 1; e < oe.length;) {
        for (var a = oe[e], i = e + 1; i < oe.length && a < ue;)
            a *= oe[i++];
        for (a = r.modInt(a); e < i;)
            if (a % oe[e++] == 0)
                return !1;
    } return r.millerRabin(t); } function $t(t) { var e = this.subtract(a.ONE), r = e.getLowestSetBit(); if (r <= 0)
        return !1; for (var i, n = e.shiftRight(r), s = te(), o = 0; o < t; ++o) {
        do {
            i = new a(this.bitLength(), s);
        } while (i.compareTo(a.ONE) <= 0 || i.compareTo(e) >= 0);
        var u = i.modPow(n, this);
        if (0 != u.compareTo(a.ONE) && 0 != u.compareTo(e)) {
            for (var c = 1; c++ < r && 0 != u.compareTo(e);)
                if (u = u.modPowInt(2, this), 0 == u.compareTo(a.ONE))
                    return !1;
            if (0 != u.compareTo(e))
                return !1;
        }
    } return !0; } function te() { return { nextBytes: function (t) { for (var e = 0; e < t.length; ++e)
            t[e] = Math.floor(256 * Math.random()); } }; } var ee = r(0); t.exports = ee.jsbn = ee.jsbn || {}; var re; ee.jsbn.BigInteger = a, "undefined" == typeof navigator ? (a.prototype.am = o, re = 28) : "Microsoft Internet Explorer" == navigator.appName ? (a.prototype.am = s, re = 30) : "Netscape" != navigator.appName ? (a.prototype.am = n, re = 26) : (a.prototype.am = o, re = 28), a.prototype.DB = re, a.prototype.DM = (1 << re) - 1, a.prototype.DV = 1 << re; a.prototype.FV = Math.pow(2, 52), a.prototype.F1 = 52 - re, a.prototype.F2 = 2 * re - 52; var ae, ie, ne = "0123456789abcdefghijklmnopqrstuvwxyz", se = new Array; for (ae = "0".charCodeAt(0), ie = 0; ie <= 9; ++ie)
        se[ae++] = ie; for (ae = "a".charCodeAt(0), ie = 10; ie < 36; ++ie)
        se[ae++] = ie; for (ae = "A".charCodeAt(0), ie = 10; ie < 36; ++ie)
        se[ae++] = ie; U.prototype.convert = L, U.prototype.revert = k, U.prototype.reduce = D, U.prototype.mulTo = P, U.prototype.sqrTo = O, _.prototype.convert = K, _.prototype.revert = x, _.prototype.reduce = M, _.prototype.mulTo = j, _.prototype.sqrTo = F, a.prototype.copyTo = l, a.prototype.fromInt = h, a.prototype.fromString = f, a.prototype.clamp = d, a.prototype.dlShiftTo = S, a.prototype.drShiftTo = T, a.prototype.lShiftTo = I, a.prototype.rShiftTo = b, a.prototype.subTo = A, a.prototype.multiplyTo = B, a.prototype.squareTo = N, a.prototype.divRemTo = R, a.prototype.invDigit = V, a.prototype.isEven = q, a.prototype.exp = G, a.prototype.toString = y, a.prototype.negate = g, a.prototype.abs = m, a.prototype.compareTo = v, a.prototype.bitLength = E, a.prototype.mod = w, a.prototype.modPowInt = Q, a.ZERO = p(0), a.ONE = p(1), Ot.prototype.convert = Vt, Ot.prototype.revert = Vt, Ot.prototype.mulTo = _t, Ot.prototype.sqrTo = Kt, jt.prototype.convert = qt, jt.prototype.revert = Gt, jt.prototype.reduce = Qt, jt.prototype.mulTo = Ht, jt.prototype.sqrTo = zt; var oe = [2, 3, 5, 7, 11, 13, 17, 19, 23, 29, 31, 37, 41, 43, 47, 53, 59, 61, 67, 71, 73, 79, 83, 89, 97, 101, 103, 107, 109, 113, 127, 131, 137, 139, 149, 151, 157, 163, 167, 173, 179, 181, 191, 193, 197, 199, 211, 223, 227, 229, 233, 239, 241, 251, 257, 263, 269, 271, 277, 281, 283, 293, 307, 311, 313, 317, 331, 337, 347, 349, 353, 359, 367, 373, 379, 383, 389, 397, 401, 409, 419, 421, 431, 433, 439, 443, 449, 457, 461, 463, 467, 479, 487, 491, 499, 503, 509], ue = (1 << 26) / oe[oe.length - 1]; a.prototype.chunkSize = Y, a.prototype.toRadix = J, a.prototype.fromRadix = $, a.prototype.fromNumber = tt, a.prototype.bitwiseTo = nt, a.prototype.changeBit = Tt, a.prototype.addTo = Bt, a.prototype.dMultiply = Dt, a.prototype.dAddOffset = Pt, a.prototype.multiplyLowerTo = Mt, a.prototype.multiplyUpperTo = Ft, a.prototype.modInt = Yt, a.prototype.millerRabin = $t, a.prototype.clone = z, a.prototype.intValue = H, a.prototype.byteValue = W, a.prototype.shortValue = X, a.prototype.signum = Z, a.prototype.toByteArray = et, a.prototype.equals = rt, a.prototype.min = at, a.prototype.max = it, a.prototype.and = ot, a.prototype.or = ct, a.prototype.xor = ht, a.prototype.andNot = ft, a.prototype.not = dt, a.prototype.shiftLeft = yt, a.prototype.shiftRight = gt, a.prototype.getLowestSetBit = vt, a.prototype.bitCount = Et, a.prototype.testBit = St, a.prototype.setBit = It, a.prototype.clearBit = bt, a.prototype.flipBit = At, a.prototype.add = Nt, a.prototype.subtract = Rt, a.prototype.multiply = wt, a.prototype.divide = Ut, a.prototype.remainder = Lt, a.prototype.divideAndRemainder = kt, a.prototype.modPow = Wt, a.prototype.modInverse = Zt, a.prototype.pow = xt, a.prototype.gcd = Xt, a.prototype.isProbablePrime = Jt; }, function (t, e, r) { function a() { o = String.fromCharCode(128), o += n.util.fillString(String.fromCharCode(0), 64), u = !0; } function i(t, e, r) { for (var a, i, n, s, o, u, c, l, h = r.length(); h >= 64;) {
        for (i = t.h0, n = t.h1, s = t.h2, o = t.h3, u = t.h4, l = 0; l < 16; ++l)
            a = r.getInt32(), e[l] = a, c = o ^ n & (s ^ o), a = (i << 5 | i >>> 27) + c + u + 1518500249 + a, u = o, o = s, s = (n << 30 | n >>> 2) >>> 0, n = i, i = a;
        for (; l < 20; ++l)
            a = e[l - 3] ^ e[l - 8] ^ e[l - 14] ^ e[l - 16], a = a << 1 | a >>> 31, e[l] = a, c = o ^ n & (s ^ o), a = (i << 5 | i >>> 27) + c + u + 1518500249 + a, u = o, o = s, s = (n << 30 | n >>> 2) >>> 0, n = i, i = a;
        for (; l < 32; ++l)
            a = e[l - 3] ^ e[l - 8] ^ e[l - 14] ^ e[l - 16], a = a << 1 | a >>> 31, e[l] = a, c = n ^ s ^ o, a = (i << 5 | i >>> 27) + c + u + 1859775393 + a, u = o, o = s, s = (n << 30 | n >>> 2) >>> 0, n = i, i = a;
        for (; l < 40; ++l)
            a = e[l - 6] ^ e[l - 16] ^ e[l - 28] ^ e[l - 32], a = a << 2 | a >>> 30, e[l] = a, c = n ^ s ^ o, a = (i << 5 | i >>> 27) + c + u + 1859775393 + a, u = o, o = s, s = (n << 30 | n >>> 2) >>> 0, n = i, i = a;
        for (; l < 60; ++l)
            a = e[l - 6] ^ e[l - 16] ^ e[l - 28] ^ e[l - 32], a = a << 2 | a >>> 30, e[l] = a, c = n & s | o & (n ^ s), a = (i << 5 | i >>> 27) + c + u + 2400959708 + a, u = o, o = s, s = (n << 30 | n >>> 2) >>> 0, n = i, i = a;
        for (; l < 80; ++l)
            a = e[l - 6] ^ e[l - 16] ^ e[l - 28] ^ e[l - 32], a = a << 2 | a >>> 30, e[l] = a, c = n ^ s ^ o, a = (i << 5 | i >>> 27) + c + u + 3395469782 + a, u = o, o = s, s = (n << 30 | n >>> 2) >>> 0, n = i, i = a;
        t.h0 = t.h0 + i | 0, t.h1 = t.h1 + n | 0, t.h2 = t.h2 + s | 0, t.h3 = t.h3 + o | 0, t.h4 = t.h4 + u | 0, h -= 64;
    } } var n = r(0); r(4), r(1); var s = t.exports = n.sha1 = n.sha1 || {}; n.md.sha1 = n.md.algorithms.sha1 = s, s.create = function () { u || a(); var t = null, e = n.util.createBuffer(), r = new Array(80), s = { algorithm: "sha1", blockLength: 64, digestLength: 20, messageLength: 0, fullMessageLength: null, messageLengthSize: 8 }; return s.start = function () { s.messageLength = 0, s.fullMessageLength = s.messageLength64 = []; for (var r = s.messageLengthSize / 4, a = 0; a < r; ++a)
        s.fullMessageLength.push(0); return e = n.util.createBuffer(), t = { h0: 1732584193, h1: 4023233417, h2: 2562383102, h3: 271733878, h4: 3285377520 }, s; }, s.start(), s.update = function (a, o) { "utf8" === o && (a = n.util.encodeUtf8(a)); var u = a.length; s.messageLength += u, u = [u / 4294967296 >>> 0, u >>> 0]; for (var c = s.fullMessageLength.length - 1; c >= 0; --c)
        s.fullMessageLength[c] += u[1], u[1] = u[0] + (s.fullMessageLength[c] / 4294967296 >>> 0), s.fullMessageLength[c] = s.fullMessageLength[c] >>> 0, u[0] = u[1] / 4294967296 >>> 0; return e.putBytes(a), i(t, r, e), (e.read > 2048 || 0 === e.length()) && e.compact(), s; }, s.digest = function () { var a = n.util.createBuffer(); a.putBytes(e.bytes()); var u = s.fullMessageLength[s.fullMessageLength.length - 1] + s.messageLengthSize, c = u & s.blockLength - 1; a.putBytes(o.substr(0, s.blockLength - c)); for (var l, h, p = 8 * s.fullMessageLength[0], f = 0; f < s.fullMessageLength.length - 1; ++f)
        l = 8 * s.fullMessageLength[f + 1], h = l / 4294967296 >>> 0, p += h, a.putInt32(p >>> 0), p = l >>> 0; a.putInt32(p); var d = { h0: t.h0, h1: t.h1, h2: t.h2, h3: t.h3, h4: t.h4 }; i(d, r, a); var y = n.util.createBuffer(); return y.putInt32(d.h0), y.putInt32(d.h1), y.putInt32(d.h2), y.putInt32(d.h3), y.putInt32(d.h4), y; }, s; }; var o = null, u = !1; }, function (t, e, r) { function a(t, e) { "string" == typeof e && (e = { shortName: e }); for (var r, a = null, i = 0; null === a && i < t.attributes.length; ++i)
        r = t.attributes[i], e.type && e.type === r.type ? a = r : e.name && e.name === r.name ? a = r : e.shortName && e.shortName === r.shortName && (a = r); return a; } function i(t) { for (var e, r, a = h.create(h.Class.UNIVERSAL, h.Type.SEQUENCE, !0, []), i = t.attributes, n = 0; n < i.length; ++n) {
        e = i[n];
        var s = e.value, o = h.Type.PRINTABLESTRING;
        "valueTagClass" in e && (o = e.valueTagClass) === h.Type.UTF8 && (s = l.util.encodeUtf8(s)), r = h.create(h.Class.UNIVERSAL, h.Type.SET, !0, [h.create(h.Class.UNIVERSAL, h.Type.SEQUENCE, !0, [h.create(h.Class.UNIVERSAL, h.Type.OID, !1, h.oidToDer(e.type).getBytes()), h.create(h.Class.UNIVERSAL, o, !1, s)])]), a.value.push(r);
    } return a; } function n(t) { for (var e, r = 0; r < t.length; ++r) {
        if (e = t[r], void 0 === e.name && (e.type && e.type in p.oids ? e.name = p.oids[e.type] : e.shortName && e.shortName in d && (e.name = p.oids[d[e.shortName]])), void 0 === e.type) {
            if (!(e.name && e.name in p.oids)) {
                var a = new Error("Attribute type not specified.");
                throw a.attribute = e, a;
            }
            e.type = p.oids[e.name];
        }
        if (void 0 === e.shortName && e.name && e.name in d && (e.shortName = d[e.name]), e.type === f.extensionRequest && (e.valueConstructed = !0, e.valueTagClass = h.Type.SEQUENCE, !e.value && e.extensions)) {
            e.value = [];
            for (var i = 0; i < e.extensions.length; ++i)
                e.value.push(p.certificateExtensionToAsn1(s(e.extensions[i])));
        }
        if (void 0 === e.value) {
            var a = new Error("Attribute value not specified.");
            throw a.attribute = e, a;
        }
    } } function s(t, e) { if (e = e || {}, void 0 === t.name && t.id && t.id in p.oids && (t.name = p.oids[t.id]), void 0 === t.id) {
        if (!(t.name && t.name in p.oids)) {
            var r = new Error("Extension ID not specified.");
            throw r.extension = t, r;
        }
        t.id = p.oids[t.name];
    } if (void 0 !== t.value)
        return t; if ("keyUsage" === t.name) {
        var a = 0, n = 0, s = 0;
        t.digitalSignature && (n |= 128, a = 7), t.nonRepudiation && (n |= 64, a = 6), t.keyEncipherment && (n |= 32, a = 5), t.dataEncipherment && (n |= 16, a = 4), t.keyAgreement && (n |= 8, a = 3), t.keyCertSign && (n |= 4, a = 2), t.cRLSign && (n |= 2, a = 1), t.encipherOnly && (n |= 1, a = 0), t.decipherOnly && (s |= 128, a = 7);
        var o = String.fromCharCode(a);
        0 !== s ? o += String.fromCharCode(n) + String.fromCharCode(s) : 0 !== n && (o += String.fromCharCode(n)), t.value = h.create(h.Class.UNIVERSAL, h.Type.BITSTRING, !1, o);
    }
    else if ("basicConstraints" === t.name)
        t.value = h.create(h.Class.UNIVERSAL, h.Type.SEQUENCE, !0, []), t.cA && t.value.value.push(h.create(h.Class.UNIVERSAL, h.Type.BOOLEAN, !1, String.fromCharCode(255))), "pathLenConstraint" in t && t.value.value.push(h.create(h.Class.UNIVERSAL, h.Type.INTEGER, !1, h.integerToDer(t.pathLenConstraint).getBytes()));
    else if ("extKeyUsage" === t.name) {
        t.value = h.create(h.Class.UNIVERSAL, h.Type.SEQUENCE, !0, []);
        var u = t.value.value;
        for (var c in t)
            !0 === t[c] && (c in f ? u.push(h.create(h.Class.UNIVERSAL, h.Type.OID, !1, h.oidToDer(f[c]).getBytes())) : -1 !== c.indexOf(".") && u.push(h.create(h.Class.UNIVERSAL, h.Type.OID, !1, h.oidToDer(c).getBytes())));
    }
    else if ("nsCertType" === t.name) {
        var a = 0, n = 0;
        t.client && (n |= 128, a = 7), t.server && (n |= 64, a = 6), t.email && (n |= 32, a = 5), t.objsign && (n |= 16, a = 4), t.reserved && (n |= 8, a = 3), t.sslCA && (n |= 4, a = 2), t.emailCA && (n |= 2, a = 1), t.objCA && (n |= 1, a = 0);
        var o = String.fromCharCode(a);
        0 !== n && (o += String.fromCharCode(n)), t.value = h.create(h.Class.UNIVERSAL, h.Type.BITSTRING, !1, o);
    }
    else if ("subjectAltName" === t.name || "issuerAltName" === t.name) {
        t.value = h.create(h.Class.UNIVERSAL, h.Type.SEQUENCE, !0, []);
        for (var d, y = 0; y < t.altNames.length; ++y) {
            d = t.altNames[y];
            var o = d.value;
            if (7 === d.type && d.ip) {
                if (null === (o = l.util.bytesFromIP(d.ip))) {
                    var r = new Error('Extension "ip" value is not a valid IPv4 or IPv6 address.');
                    throw r.extension = t, r;
                }
            }
            else
                8 === d.type && (o = d.oid ? h.oidToDer(h.oidToDer(d.oid)) : h.oidToDer(o));
            t.value.value.push(h.create(h.Class.CONTEXT_SPECIFIC, d.type, !1, o));
        }
    }
    else if ("nsComment" === t.name && e.cert) {
        if (!/^[\x00-\x7F]*$/.test(t.comment) || t.comment.length < 1 || t.comment.length > 128)
            throw new Error('Invalid "nsComment" content.');
        t.value = h.create(h.Class.UNIVERSAL, h.Type.IA5STRING, !1, t.comment);
    }
    else if ("subjectKeyIdentifier" === t.name && e.cert) {
        var g = e.cert.generateSubjectKeyIdentifier();
        t.subjectKeyIdentifier = g.toHex(), t.value = h.create(h.Class.UNIVERSAL, h.Type.OCTETSTRING, !1, g.getBytes());
    }
    else if ("authorityKeyIdentifier" === t.name && e.cert) {
        t.value = h.create(h.Class.UNIVERSAL, h.Type.SEQUENCE, !0, []);
        var u = t.value.value;
        if (t.keyIdentifier) {
            var m = !0 === t.keyIdentifier ? e.cert.generateSubjectKeyIdentifier().getBytes() : t.keyIdentifier;
            u.push(h.create(h.Class.CONTEXT_SPECIFIC, 0, !1, m));
        }
        if (t.authorityCertIssuer) {
            var v = [h.create(h.Class.CONTEXT_SPECIFIC, 4, !0, [i(!0 === t.authorityCertIssuer ? e.cert.issuer : t.authorityCertIssuer)])];
            u.push(h.create(h.Class.CONTEXT_SPECIFIC, 1, !0, v));
        }
        if (t.serialNumber) {
            var C = l.util.hexToBytes(!0 === t.serialNumber ? e.cert.serialNumber : t.serialNumber);
            u.push(h.create(h.Class.CONTEXT_SPECIFIC, 2, !1, C));
        }
    }
    else if ("cRLDistributionPoints" === t.name) {
        t.value = h.create(h.Class.UNIVERSAL, h.Type.SEQUENCE, !0, []);
        for (var d, u = t.value.value, E = h.create(h.Class.UNIVERSAL, h.Type.SEQUENCE, !0, []), S = h.create(h.Class.CONTEXT_SPECIFIC, 0, !0, []), y = 0; y < t.altNames.length; ++y) {
            d = t.altNames[y];
            var o = d.value;
            if (7 === d.type && d.ip) {
                if (null === (o = l.util.bytesFromIP(d.ip))) {
                    var r = new Error('Extension "ip" value is not a valid IPv4 or IPv6 address.');
                    throw r.extension = t, r;
                }
            }
            else
                8 === d.type && (o = d.oid ? h.oidToDer(h.oidToDer(d.oid)) : h.oidToDer(o));
            S.value.push(h.create(h.Class.CONTEXT_SPECIFIC, d.type, !1, o));
        }
        E.value.push(h.create(h.Class.CONTEXT_SPECIFIC, 0, !0, [S])), u.push(E);
    } if (void 0 === t.value) {
        var r = new Error("Extension value not specified.");
        throw r.extension = t, r;
    } return t; } function o(t, e) { switch (t) {
        case f["RSASSA-PSS"]:
            var r = [];
            return void 0 !== e.hash.algorithmOid && r.push(h.create(h.Class.CONTEXT_SPECIFIC, 0, !0, [h.create(h.Class.UNIVERSAL, h.Type.SEQUENCE, !0, [h.create(h.Class.UNIVERSAL, h.Type.OID, !1, h.oidToDer(e.hash.algorithmOid).getBytes()), h.create(h.Class.UNIVERSAL, h.Type.NULL, !1, "")])])), void 0 !== e.mgf.algorithmOid && r.push(h.create(h.Class.CONTEXT_SPECIFIC, 1, !0, [h.create(h.Class.UNIVERSAL, h.Type.SEQUENCE, !0, [h.create(h.Class.UNIVERSAL, h.Type.OID, !1, h.oidToDer(e.mgf.algorithmOid).getBytes()), h.create(h.Class.UNIVERSAL, h.Type.SEQUENCE, !0, [h.create(h.Class.UNIVERSAL, h.Type.OID, !1, h.oidToDer(e.mgf.hash.algorithmOid).getBytes()), h.create(h.Class.UNIVERSAL, h.Type.NULL, !1, "")])])])), void 0 !== e.saltLength && r.push(h.create(h.Class.CONTEXT_SPECIFIC, 2, !0, [h.create(h.Class.UNIVERSAL, h.Type.INTEGER, !1, h.integerToDer(e.saltLength).getBytes())])), h.create(h.Class.UNIVERSAL, h.Type.SEQUENCE, !0, r);
        default: return h.create(h.Class.UNIVERSAL, h.Type.NULL, !1, "");
    } } function u(t) { var e = h.create(h.Class.CONTEXT_SPECIFIC, 0, !0, []); if (0 === t.attributes.length)
        return e; for (var r = t.attributes, a = 0; a < r.length; ++a) {
        var i = r[a], n = i.value, s = h.Type.UTF8;
        "valueTagClass" in i && (s = i.valueTagClass), s === h.Type.UTF8 && (n = l.util.encodeUtf8(n));
        var o = !1;
        "valueConstructed" in i && (o = i.valueConstructed);
        var u = h.create(h.Class.UNIVERSAL, h.Type.SEQUENCE, !0, [h.create(h.Class.UNIVERSAL, h.Type.OID, !1, h.oidToDer(i.type).getBytes()), h.create(h.Class.UNIVERSAL, h.Type.SET, !0, [h.create(h.Class.UNIVERSAL, s, o, n)])]);
        e.value.push(u);
    } return e; } function c(t) { return t >= S && t < T ? h.create(h.Class.UNIVERSAL, h.Type.UTCTIME, !1, h.dateToUtcTime(t)) : h.create(h.Class.UNIVERSAL, h.Type.GENERALIZEDTIME, !1, h.dateToGeneralizedTime(t)); } var l = r(0); r(6), r(2), r(14), r(4), r(31), r(3), r(12), r(20), r(7), r(1); var h = l.asn1, p = t.exports = l.pki = l.pki || {}, f = p.oids, d = {}; d.CN = f.commonName, d.commonName = "CN", d.C = f.countryName, d.countryName = "C", d.L = f.localityName, d.localityName = "L", d.ST = f.stateOrProvinceName, d.stateOrProvinceName = "ST", d.O = f.organizationName, d.organizationName = "O", d.OU = f.organizationalUnitName, d.organizationalUnitName = "OU", d.E = f.emailAddress, d.emailAddress = "E"; var y = l.pki.rsa.publicKeyValidator, g = { name: "Certificate", tagClass: h.Class.UNIVERSAL, type: h.Type.SEQUENCE, constructed: !0, value: [{ name: "Certificate.TBSCertificate", tagClass: h.Class.UNIVERSAL, type: h.Type.SEQUENCE, constructed: !0, captureAsn1: "tbsCertificate", value: [{ name: "Certificate.TBSCertificate.version", tagClass: h.Class.CONTEXT_SPECIFIC, type: 0, constructed: !0, optional: !0, value: [{ name: "Certificate.TBSCertificate.version.integer", tagClass: h.Class.UNIVERSAL, type: h.Type.INTEGER, constructed: !1, capture: "certVersion" }] }, { name: "Certificate.TBSCertificate.serialNumber", tagClass: h.Class.UNIVERSAL, type: h.Type.INTEGER, constructed: !1, capture: "certSerialNumber" }, { name: "Certificate.TBSCertificate.signature", tagClass: h.Class.UNIVERSAL, type: h.Type.SEQUENCE, constructed: !0, value: [{ name: "Certificate.TBSCertificate.signature.algorithm", tagClass: h.Class.UNIVERSAL, type: h.Type.OID, constructed: !1, capture: "certinfoSignatureOid" }, { name: "Certificate.TBSCertificate.signature.parameters", tagClass: h.Class.UNIVERSAL, optional: !0, captureAsn1: "certinfoSignatureParams" }] }, { name: "Certificate.TBSCertificate.issuer", tagClass: h.Class.UNIVERSAL, type: h.Type.SEQUENCE, constructed: !0, captureAsn1: "certIssuer" }, { name: "Certificate.TBSCertificate.validity", tagClass: h.Class.UNIVERSAL, type: h.Type.SEQUENCE, constructed: !0, value: [{ name: "Certificate.TBSCertificate.validity.notBefore (utc)", tagClass: h.Class.UNIVERSAL, type: h.Type.UTCTIME, constructed: !1, optional: !0, capture: "certValidity1UTCTime" }, { name: "Certificate.TBSCertificate.validity.notBefore (generalized)", tagClass: h.Class.UNIVERSAL, type: h.Type.GENERALIZEDTIME, constructed: !1, optional: !0, capture: "certValidity2GeneralizedTime" }, { name: "Certificate.TBSCertificate.validity.notAfter (utc)", tagClass: h.Class.UNIVERSAL, type: h.Type.UTCTIME, constructed: !1, optional: !0, capture: "certValidity3UTCTime" }, { name: "Certificate.TBSCertificate.validity.notAfter (generalized)", tagClass: h.Class.UNIVERSAL, type: h.Type.GENERALIZEDTIME, constructed: !1, optional: !0, capture: "certValidity4GeneralizedTime" }] }, { name: "Certificate.TBSCertificate.subject", tagClass: h.Class.UNIVERSAL, type: h.Type.SEQUENCE, constructed: !0, captureAsn1: "certSubject" }, y, { name: "Certificate.TBSCertificate.issuerUniqueID", tagClass: h.Class.CONTEXT_SPECIFIC, type: 1, constructed: !0, optional: !0, value: [{ name: "Certificate.TBSCertificate.issuerUniqueID.id", tagClass: h.Class.UNIVERSAL, type: h.Type.BITSTRING, constructed: !1, captureBitStringValue: "certIssuerUniqueId" }] }, { name: "Certificate.TBSCertificate.subjectUniqueID", tagClass: h.Class.CONTEXT_SPECIFIC, type: 2, constructed: !0, optional: !0, value: [{ name: "Certificate.TBSCertificate.subjectUniqueID.id", tagClass: h.Class.UNIVERSAL, type: h.Type.BITSTRING, constructed: !1, captureBitStringValue: "certSubjectUniqueId" }] }, { name: "Certificate.TBSCertificate.extensions", tagClass: h.Class.CONTEXT_SPECIFIC, type: 3, constructed: !0, captureAsn1: "certExtensions", optional: !0 }] }, { name: "Certificate.signatureAlgorithm", tagClass: h.Class.UNIVERSAL, type: h.Type.SEQUENCE, constructed: !0, value: [{ name: "Certificate.signatureAlgorithm.algorithm", tagClass: h.Class.UNIVERSAL, type: h.Type.OID, constructed: !1, capture: "certSignatureOid" }, { name: "Certificate.TBSCertificate.signature.parameters", tagClass: h.Class.UNIVERSAL, optional: !0, captureAsn1: "certSignatureParams" }] }, { name: "Certificate.signatureValue", tagClass: h.Class.UNIVERSAL, type: h.Type.BITSTRING, constructed: !1, captureBitStringValue: "certSignature" }] }, m = { name: "rsapss", tagClass: h.Class.UNIVERSAL, type: h.Type.SEQUENCE, constructed: !0, value: [{ name: "rsapss.hashAlgorithm", tagClass: h.Class.CONTEXT_SPECIFIC, type: 0, constructed: !0, value: [{ name: "rsapss.hashAlgorithm.AlgorithmIdentifier", tagClass: h.Class.UNIVERSAL, type: h.Class.SEQUENCE, constructed: !0, optional: !0, value: [{ name: "rsapss.hashAlgorithm.AlgorithmIdentifier.algorithm", tagClass: h.Class.UNIVERSAL, type: h.Type.OID, constructed: !1, capture: "hashOid" }] }] }, { name: "rsapss.maskGenAlgorithm", tagClass: h.Class.CONTEXT_SPECIFIC, type: 1, constructed: !0, value: [{ name: "rsapss.maskGenAlgorithm.AlgorithmIdentifier", tagClass: h.Class.UNIVERSAL, type: h.Class.SEQUENCE, constructed: !0, optional: !0, value: [{ name: "rsapss.maskGenAlgorithm.AlgorithmIdentifier.algorithm", tagClass: h.Class.UNIVERSAL, type: h.Type.OID, constructed: !1, capture: "maskGenOid" }, { name: "rsapss.maskGenAlgorithm.AlgorithmIdentifier.params", tagClass: h.Class.UNIVERSAL, type: h.Type.SEQUENCE, constructed: !0, value: [{ name: "rsapss.maskGenAlgorithm.AlgorithmIdentifier.params.algorithm", tagClass: h.Class.UNIVERSAL, type: h.Type.OID, constructed: !1, capture: "maskGenHashOid" }] }] }] }, { name: "rsapss.saltLength", tagClass: h.Class.CONTEXT_SPECIFIC, type: 2, optional: !0, value: [{ name: "rsapss.saltLength.saltLength", tagClass: h.Class.UNIVERSAL, type: h.Class.INTEGER, constructed: !1, capture: "saltLength" }] }, { name: "rsapss.trailerField", tagClass: h.Class.CONTEXT_SPECIFIC, type: 3, optional: !0, value: [{ name: "rsapss.trailer.trailer", tagClass: h.Class.UNIVERSAL, type: h.Class.INTEGER, constructed: !1, capture: "trailer" }] }] }, v = { name: "CertificationRequestInfo", tagClass: h.Class.UNIVERSAL, type: h.Type.SEQUENCE, constructed: !0, captureAsn1: "certificationRequestInfo", value: [{ name: "CertificationRequestInfo.integer", tagClass: h.Class.UNIVERSAL, type: h.Type.INTEGER, constructed: !1, capture: "certificationRequestInfoVersion" }, { name: "CertificationRequestInfo.subject", tagClass: h.Class.UNIVERSAL, type: h.Type.SEQUENCE, constructed: !0, captureAsn1: "certificationRequestInfoSubject" }, y, { name: "CertificationRequestInfo.attributes", tagClass: h.Class.CONTEXT_SPECIFIC, type: 0, constructed: !0, optional: !0, capture: "certificationRequestInfoAttributes", value: [{ name: "CertificationRequestInfo.attributes", tagClass: h.Class.UNIVERSAL, type: h.Type.SEQUENCE, constructed: !0, value: [{ name: "CertificationRequestInfo.attributes.type", tagClass: h.Class.UNIVERSAL, type: h.Type.OID, constructed: !1 }, { name: "CertificationRequestInfo.attributes.value", tagClass: h.Class.UNIVERSAL, type: h.Type.SET, constructed: !0 }] }] }] }, C = { name: "CertificationRequest", tagClass: h.Class.UNIVERSAL, type: h.Type.SEQUENCE, constructed: !0, captureAsn1: "csr", value: [v, { name: "CertificationRequest.signatureAlgorithm", tagClass: h.Class.UNIVERSAL, type: h.Type.SEQUENCE, constructed: !0, value: [{ name: "CertificationRequest.signatureAlgorithm.algorithm", tagClass: h.Class.UNIVERSAL, type: h.Type.OID, constructed: !1, capture: "csrSignatureOid" }, { name: "CertificationRequest.signatureAlgorithm.parameters", tagClass: h.Class.UNIVERSAL, optional: !0, captureAsn1: "csrSignatureParams" }] }, { name: "CertificationRequest.signature", tagClass: h.Class.UNIVERSAL, type: h.Type.BITSTRING, constructed: !1, captureBitStringValue: "csrSignature" }] }; p.RDNAttributesAsArray = function (t, e) { for (var r, a, i, n = [], s = 0; s < t.value.length; ++s) {
        r = t.value[s];
        for (var o = 0; o < r.value.length; ++o)
            i = {}, a = r.value[o], i.type = h.derToOid(a.value[0].value), i.value = a.value[1].value, i.valueTagClass = a.value[1].type, i.type in f && (i.name = f[i.type], i.name in d && (i.shortName = d[i.name])), e && (e.update(i.type), e.update(i.value)), n.push(i);
    } return n; }, p.CRIAttributesAsArray = function (t) { for (var e = [], r = 0; r < t.length; ++r)
        for (var a = t[r], i = h.derToOid(a.value[0].value), n = a.value[1].value, s = 0; s < n.length; ++s) {
            var o = {};
            if (o.type = i, o.value = n[s].value, o.valueTagClass = n[s].type, o.type in f && (o.name = f[o.type], o.name in d && (o.shortName = d[o.name])), o.type === f.extensionRequest) {
                o.extensions = [];
                for (var u = 0; u < o.value.length; ++u)
                    o.extensions.push(p.certificateExtensionFromAsn1(o.value[u]));
            }
            e.push(o);
        } return e; }; var E = function (t, e, r) { var a = {}; if (t !== f["RSASSA-PSS"])
        return a; r && (a = { hash: { algorithmOid: f.sha1 }, mgf: { algorithmOid: f.mgf1, hash: { algorithmOid: f.sha1 } }, saltLength: 20 }); var i = {}, n = []; if (!h.validate(e, m, i, n)) {
        var s = new Error("Cannot read RSASSA-PSS parameter block.");
        throw s.errors = n, s;
    } return void 0 !== i.hashOid && (a.hash = a.hash || {}, a.hash.algorithmOid = h.derToOid(i.hashOid)), void 0 !== i.maskGenOid && (a.mgf = a.mgf || {}, a.mgf.algorithmOid = h.derToOid(i.maskGenOid), a.mgf.hash = a.mgf.hash || {}, a.mgf.hash.algorithmOid = h.derToOid(i.maskGenHashOid)), void 0 !== i.saltLength && (a.saltLength = i.saltLength.charCodeAt(0)), a; }; p.certificateFromPem = function (t, e, r) { var a = l.pem.decode(t)[0]; if ("CERTIFICATE" !== a.type && "X509 CERTIFICATE" !== a.type && "TRUSTED CERTIFICATE" !== a.type) {
        var i = new Error('Could not convert certificate from PEM; PEM header type is not "CERTIFICATE", "X509 CERTIFICATE", or "TRUSTED CERTIFICATE".');
        throw i.headerType = a.type, i;
    } if (a.procType && "ENCRYPTED" === a.procType.type)
        throw new Error("Could not convert certificate from PEM; PEM is encrypted."); var n = h.fromDer(a.body, r); return p.certificateFromAsn1(n, e); }, p.certificateToPem = function (t, e) { var r = { type: "CERTIFICATE", body: h.toDer(p.certificateToAsn1(t)).getBytes() }; return l.pem.encode(r, { maxline: e }); }, p.publicKeyFromPem = function (t) { var e = l.pem.decode(t)[0]; if ("PUBLIC KEY" !== e.type && "RSA PUBLIC KEY" !== e.type) {
        var r = new Error('Could not convert public key from PEM; PEM header type is not "PUBLIC KEY" or "RSA PUBLIC KEY".');
        throw r.headerType = e.type, r;
    } if (e.procType && "ENCRYPTED" === e.procType.type)
        throw new Error("Could not convert public key from PEM; PEM is encrypted."); var a = h.fromDer(e.body); return p.publicKeyFromAsn1(a); }, p.publicKeyToPem = function (t, e) { var r = { type: "PUBLIC KEY", body: h.toDer(p.publicKeyToAsn1(t)).getBytes() }; return l.pem.encode(r, { maxline: e }); }, p.publicKeyToRSAPublicKeyPem = function (t, e) { var r = { type: "RSA PUBLIC KEY", body: h.toDer(p.publicKeyToRSAPublicKey(t)).getBytes() }; return l.pem.encode(r, { maxline: e }); }, p.getPublicKeyFingerprint = function (t, e) { e = e || {}; var r, a = e.md || l.md.sha1.create(), i = e.type || "RSAPublicKey"; switch (i) {
        case "RSAPublicKey":
            r = h.toDer(p.publicKeyToRSAPublicKey(t)).getBytes();
            break;
        case "SubjectPublicKeyInfo":
            r = h.toDer(p.publicKeyToAsn1(t)).getBytes();
            break;
        default: throw new Error('Unknown fingerprint type "' + e.type + '".');
    } a.start(), a.update(r); var n = a.digest(); if ("hex" === e.encoding) {
        var s = n.toHex();
        return e.delimiter ? s.match(/.{2}/g).join(e.delimiter) : s;
    } if ("binary" === e.encoding)
        return n.getBytes(); if (e.encoding)
        throw new Error('Unknown encoding "' + e.encoding + '".'); return n; }, p.certificationRequestFromPem = function (t, e, r) { var a = l.pem.decode(t)[0]; if ("CERTIFICATE REQUEST" !== a.type) {
        var i = new Error('Could not convert certification request from PEM; PEM header type is not "CERTIFICATE REQUEST".');
        throw i.headerType = a.type, i;
    } if (a.procType && "ENCRYPTED" === a.procType.type)
        throw new Error("Could not convert certification request from PEM; PEM is encrypted."); var n = h.fromDer(a.body, r); return p.certificationRequestFromAsn1(n, e); }, p.certificationRequestToPem = function (t, e) { var r = { type: "CERTIFICATE REQUEST", body: h.toDer(p.certificationRequestToAsn1(t)).getBytes() }; return l.pem.encode(r, { maxline: e }); }, p.createCertificate = function () { var t = {}; return t.version = 2, t.serialNumber = "00", t.signatureOid = null, t.signature = null, t.siginfo = {}, t.siginfo.algorithmOid = null, t.validity = {}, t.validity.notBefore = new Date, t.validity.notAfter = new Date, t.issuer = {}, t.issuer.getField = function (e) { return a(t.issuer, e); }, t.issuer.addField = function (e) { n([e]), t.issuer.attributes.push(e); }, t.issuer.attributes = [], t.issuer.hash = null, t.subject = {}, t.subject.getField = function (e) { return a(t.subject, e); }, t.subject.addField = function (e) { n([e]), t.subject.attributes.push(e); }, t.subject.attributes = [], t.subject.hash = null, t.extensions = [], t.publicKey = null, t.md = null, t.setSubject = function (e, r) { n(e), t.subject.attributes = e, delete t.subject.uniqueId, r && (t.subject.uniqueId = r), t.subject.hash = null; }, t.setIssuer = function (e, r) { n(e), t.issuer.attributes = e, delete t.issuer.uniqueId, r && (t.issuer.uniqueId = r), t.issuer.hash = null; }, t.setExtensions = function (e) { for (var r = 0; r < e.length; ++r)
        s(e[r], { cert: t }); t.extensions = e; }, t.getExtension = function (e) { "string" == typeof e && (e = { name: e }); for (var r, a = null, i = 0; null === a && i < t.extensions.length; ++i)
        r = t.extensions[i], e.id && r.id === e.id ? a = r : e.name && r.name === e.name && (a = r); return a; }, t.sign = function (e, r) { t.md = r || l.md.sha1.create(); var a = f[t.md.algorithm + "WithRSAEncryption"]; if (!a) {
        var i = new Error("Could not compute certificate digest. Unknown message digest algorithm OID.");
        throw i.algorithm = t.md.algorithm, i;
    } t.signatureOid = t.siginfo.algorithmOid = a, t.tbsCertificate = p.getTBSCertificate(t); var n = h.toDer(t.tbsCertificate); t.md.update(n.getBytes()), t.signature = e.sign(t.md); }, t.verify = function (e) { var r = !1; if (!t.issued(e)) {
        var a = e.issuer, i = t.subject, n = new Error("The parent certificate did not issue the given child certificate; the child certificate's issuer does not match the parent's subject.");
        throw n.expectedIssuer = a.attributes, n.actualIssuer = i.attributes, n;
    } var s = e.md; if (null === s) {
        if (e.signatureOid in f) {
            switch (f[e.signatureOid]) {
                case "sha1WithRSAEncryption":
                    s = l.md.sha1.create();
                    break;
                case "md5WithRSAEncryption":
                    s = l.md.md5.create();
                    break;
                case "sha256WithRSAEncryption":
                    s = l.md.sha256.create();
                    break;
                case "sha384WithRSAEncryption":
                    s = l.md.sha384.create();
                    break;
                case "sha512WithRSAEncryption":
                    s = l.md.sha512.create();
                    break;
                case "RSASSA-PSS": s = l.md.sha256.create();
            }
        }
        if (null === s) {
            var n = new Error("Could not compute certificate digest. Unknown signature OID.");
            throw n.signatureOid = e.signatureOid, n;
        }
        var o = e.tbsCertificate || p.getTBSCertificate(e), u = h.toDer(o);
        s.update(u.getBytes());
    } if (null !== s) {
        var c;
        switch (e.signatureOid) {
            case f.sha1WithRSAEncryption:
                c = void 0;
                break;
            case f["RSASSA-PSS"]:
                var d, y;
                if (void 0 === (d = f[e.signatureParameters.mgf.hash.algorithmOid]) || void 0 === l.md[d]) {
                    var n = new Error("Unsupported MGF hash function.");
                    throw n.oid = e.signatureParameters.mgf.hash.algorithmOid, n.name = d, n;
                }
                if (void 0 === (y = f[e.signatureParameters.mgf.algorithmOid]) || void 0 === l.mgf[y]) {
                    var n = new Error("Unsupported MGF function.");
                    throw n.oid = e.signatureParameters.mgf.algorithmOid, n.name = y, n;
                }
                if (y = l.mgf[y].create(l.md[d].create()), void 0 === (d = f[e.signatureParameters.hash.algorithmOid]) || void 0 === l.md[d])
                    throw { message: "Unsupported RSASSA-PSS hash function.", oid: e.signatureParameters.hash.algorithmOid, name: d };
                c = l.pss.create(l.md[d].create(), y, e.signatureParameters.saltLength);
        }
        r = t.publicKey.verify(s.digest().getBytes(), e.signature, c);
    } return r; }, t.isIssuer = function (e) { var r = !1, a = t.issuer, i = e.subject; if (a.hash && i.hash)
        r = a.hash === i.hash;
    else if (a.attributes.length === i.attributes.length) {
        r = !0;
        for (var n, s, o = 0; r && o < a.attributes.length; ++o)
            n = a.attributes[o], s = i.attributes[o], n.type === s.type && n.value === s.value || (r = !1);
    } return r; }, t.issued = function (e) { return e.isIssuer(t); }, t.generateSubjectKeyIdentifier = function () { return p.getPublicKeyFingerprint(t.publicKey, { type: "RSAPublicKey" }); }, t.verifySubjectKeyIdentifier = function () { for (var e = f.subjectKeyIdentifier, r = 0; r < t.extensions.length; ++r) {
        var a = t.extensions[r];
        if (a.id === e) {
            var i = t.generateSubjectKeyIdentifier().getBytes();
            return l.util.hexToBytes(a.subjectKeyIdentifier) === i;
        }
    } return !1; }, t; }, p.certificateFromAsn1 = function (t, e) { var r = {}, i = []; if (!h.validate(t, g, r, i)) {
        var s = new Error("Cannot read X.509 certificate. ASN.1 object is not an X509v3 Certificate.");
        throw s.errors = i, s;
    } var o = h.derToOid(r.publicKeyOid); if (o !== p.oids.rsaEncryption)
        throw new Error("Cannot read public key. OID is not RSA."); var u = p.createCertificate(); u.version = r.certVersion ? r.certVersion.charCodeAt(0) : 0; var c = l.util.createBuffer(r.certSerialNumber); u.serialNumber = c.toHex(), u.signatureOid = l.asn1.derToOid(r.certSignatureOid), u.signatureParameters = E(u.signatureOid, r.certSignatureParams, !0), u.siginfo.algorithmOid = l.asn1.derToOid(r.certinfoSignatureOid), u.siginfo.parameters = E(u.siginfo.algorithmOid, r.certinfoSignatureParams, !1), u.signature = r.certSignature; var d = []; if (void 0 !== r.certValidity1UTCTime && d.push(h.utcTimeToDate(r.certValidity1UTCTime)), void 0 !== r.certValidity2GeneralizedTime && d.push(h.generalizedTimeToDate(r.certValidity2GeneralizedTime)), void 0 !== r.certValidity3UTCTime && d.push(h.utcTimeToDate(r.certValidity3UTCTime)), void 0 !== r.certValidity4GeneralizedTime && d.push(h.generalizedTimeToDate(r.certValidity4GeneralizedTime)), d.length > 2)
        throw new Error("Cannot read notBefore/notAfter validity times; more than two times were provided in the certificate."); if (d.length < 2)
        throw new Error("Cannot read notBefore/notAfter validity times; they were not provided as either UTCTime or GeneralizedTime."); if (u.validity.notBefore = d[0], u.validity.notAfter = d[1], u.tbsCertificate = r.tbsCertificate, e) {
        if (u.md = null, u.signatureOid in f) {
            var o = f[u.signatureOid];
            switch (o) {
                case "sha1WithRSAEncryption":
                    u.md = l.md.sha1.create();
                    break;
                case "md5WithRSAEncryption":
                    u.md = l.md.md5.create();
                    break;
                case "sha256WithRSAEncryption":
                    u.md = l.md.sha256.create();
                    break;
                case "sha384WithRSAEncryption":
                    u.md = l.md.sha384.create();
                    break;
                case "sha512WithRSAEncryption":
                    u.md = l.md.sha512.create();
                    break;
                case "RSASSA-PSS": u.md = l.md.sha256.create();
            }
        }
        if (null === u.md) {
            var s = new Error("Could not compute certificate digest. Unknown signature OID.");
            throw s.signatureOid = u.signatureOid, s;
        }
        var y = h.toDer(u.tbsCertificate);
        u.md.update(y.getBytes());
    } var m = l.md.sha1.create(); u.issuer.getField = function (t) { return a(u.issuer, t); }, u.issuer.addField = function (t) { n([t]), u.issuer.attributes.push(t); }, u.issuer.attributes = p.RDNAttributesAsArray(r.certIssuer, m), r.certIssuerUniqueId && (u.issuer.uniqueId = r.certIssuerUniqueId), u.issuer.hash = m.digest().toHex(); var v = l.md.sha1.create(); return u.subject.getField = function (t) { return a(u.subject, t); }, u.subject.addField = function (t) { n([t]), u.subject.attributes.push(t); }, u.subject.attributes = p.RDNAttributesAsArray(r.certSubject, v), r.certSubjectUniqueId && (u.subject.uniqueId = r.certSubjectUniqueId), u.subject.hash = v.digest().toHex(), r.certExtensions ? u.extensions = p.certificateExtensionsFromAsn1(r.certExtensions) : u.extensions = [], u.publicKey = p.publicKeyFromAsn1(r.subjectPublicKeyInfo), u; }, p.certificateExtensionsFromAsn1 = function (t) { for (var e = [], r = 0; r < t.value.length; ++r)
        for (var a = t.value[r], i = 0; i < a.value.length; ++i)
            e.push(p.certificateExtensionFromAsn1(a.value[i])); return e; }, p.certificateExtensionFromAsn1 = function (t) { var e = {}; if (e.id = h.derToOid(t.value[0].value), e.critical = !1, t.value[1].type === h.Type.BOOLEAN ? (e.critical = 0 !== t.value[1].value.charCodeAt(0), e.value = t.value[2].value) : e.value = t.value[1].value, e.id in f)
        if (e.name = f[e.id], "keyUsage" === e.name) {
            var r = h.fromDer(e.value), a = 0, i = 0;
            r.value.length > 1 && (a = r.value.charCodeAt(1), i = r.value.length > 2 ? r.value.charCodeAt(2) : 0), e.digitalSignature = 128 == (128 & a), e.nonRepudiation = 64 == (64 & a), e.keyEncipherment = 32 == (32 & a), e.dataEncipherment = 16 == (16 & a), e.keyAgreement = 8 == (8 & a), e.keyCertSign = 4 == (4 & a), e.cRLSign = 2 == (2 & a), e.encipherOnly = 1 == (1 & a), e.decipherOnly = 128 == (128 & i);
        }
        else if ("basicConstraints" === e.name) {
            var r = h.fromDer(e.value);
            r.value.length > 0 && r.value[0].type === h.Type.BOOLEAN ? e.cA = 0 !== r.value[0].value.charCodeAt(0) : e.cA = !1;
            var n = null;
            r.value.length > 0 && r.value[0].type === h.Type.INTEGER ? n = r.value[0].value : r.value.length > 1 && (n = r.value[1].value), null !== n && (e.pathLenConstraint = h.derToInteger(n));
        }
        else if ("extKeyUsage" === e.name)
            for (var r = h.fromDer(e.value), s = 0; s < r.value.length; ++s) {
                var o = h.derToOid(r.value[s].value);
                o in f ? e[f[o]] = !0 : e[o] = !0;
            }
        else if ("nsCertType" === e.name) {
            var r = h.fromDer(e.value), a = 0;
            r.value.length > 1 && (a = r.value.charCodeAt(1)), e.client = 128 == (128 & a), e.server = 64 == (64 & a), e.email = 32 == (32 & a), e.objsign = 16 == (16 & a), e.reserved = 8 == (8 & a), e.sslCA = 4 == (4 & a), e.emailCA = 2 == (2 & a), e.objCA = 1 == (1 & a);
        }
        else if ("subjectAltName" === e.name || "issuerAltName" === e.name) {
            e.altNames = [];
            for (var u, r = h.fromDer(e.value), c = 0; c < r.value.length; ++c) {
                u = r.value[c];
                var p = { type: u.type, value: u.value };
                switch (e.altNames.push(p), u.type) {
                    case 1:
                    case 2:
                    case 6: break;
                    case 7:
                        p.ip = l.util.bytesToIP(u.value);
                        break;
                    case 8: p.oid = h.derToOid(u.value);
                }
            }
        }
        else if ("subjectKeyIdentifier" === e.name) {
            var r = h.fromDer(e.value);
            e.subjectKeyIdentifier = l.util.bytesToHex(r.value);
        } return e; }, p.certificationRequestFromAsn1 = function (t, e) { var r = {}, i = []; if (!h.validate(t, C, r, i)) {
        var s = new Error("Cannot read PKCS#10 certificate request. ASN.1 object is not a PKCS#10 CertificationRequest.");
        throw s.errors = i, s;
    } var o = h.derToOid(r.publicKeyOid); if (o !== p.oids.rsaEncryption)
        throw new Error("Cannot read public key. OID is not RSA."); var u = p.createCertificationRequest(); if (u.version = r.csrVersion ? r.csrVersion.charCodeAt(0) : 0, u.signatureOid = l.asn1.derToOid(r.csrSignatureOid), u.signatureParameters = E(u.signatureOid, r.csrSignatureParams, !0), u.siginfo.algorithmOid = l.asn1.derToOid(r.csrSignatureOid), u.siginfo.parameters = E(u.siginfo.algorithmOid, r.csrSignatureParams, !1), u.signature = r.csrSignature, u.certificationRequestInfo = r.certificationRequestInfo, e) {
        if (u.md = null, u.signatureOid in f) {
            var o = f[u.signatureOid];
            switch (o) {
                case "sha1WithRSAEncryption":
                    u.md = l.md.sha1.create();
                    break;
                case "md5WithRSAEncryption":
                    u.md = l.md.md5.create();
                    break;
                case "sha256WithRSAEncryption":
                    u.md = l.md.sha256.create();
                    break;
                case "sha384WithRSAEncryption":
                    u.md = l.md.sha384.create();
                    break;
                case "sha512WithRSAEncryption":
                    u.md = l.md.sha512.create();
                    break;
                case "RSASSA-PSS": u.md = l.md.sha256.create();
            }
        }
        if (null === u.md) {
            var s = new Error("Could not compute certification request digest. Unknown signature OID.");
            throw s.signatureOid = u.signatureOid, s;
        }
        var c = h.toDer(u.certificationRequestInfo);
        u.md.update(c.getBytes());
    } var d = l.md.sha1.create(); return u.subject.getField = function (t) { return a(u.subject, t); }, u.subject.addField = function (t) { n([t]), u.subject.attributes.push(t); }, u.subject.attributes = p.RDNAttributesAsArray(r.certificationRequestInfoSubject, d), u.subject.hash = d.digest().toHex(), u.publicKey = p.publicKeyFromAsn1(r.subjectPublicKeyInfo), u.getAttribute = function (t) { return a(u, t); }, u.addAttribute = function (t) { n([t]), u.attributes.push(t); }, u.attributes = p.CRIAttributesAsArray(r.certificationRequestInfoAttributes || []), u; }, p.createCertificationRequest = function () { var t = {}; return t.version = 0, t.signatureOid = null, t.signature = null, t.siginfo = {}, t.siginfo.algorithmOid = null, t.subject = {}, t.subject.getField = function (e) { return a(t.subject, e); }, t.subject.addField = function (e) { n([e]), t.subject.attributes.push(e); }, t.subject.attributes = [], t.subject.hash = null, t.publicKey = null, t.attributes = [], t.getAttribute = function (e) { return a(t, e); }, t.addAttribute = function (e) { n([e]), t.attributes.push(e); }, t.md = null, t.setSubject = function (e) { n(e), t.subject.attributes = e, t.subject.hash = null; }, t.setAttributes = function (e) { n(e), t.attributes = e; }, t.sign = function (e, r) { t.md = r || l.md.sha1.create(); var a = f[t.md.algorithm + "WithRSAEncryption"]; if (!a) {
        var i = new Error("Could not compute certification request digest. Unknown message digest algorithm OID.");
        throw i.algorithm = t.md.algorithm, i;
    } t.signatureOid = t.siginfo.algorithmOid = a, t.certificationRequestInfo = p.getCertificationRequestInfo(t); var n = h.toDer(t.certificationRequestInfo); t.md.update(n.getBytes()), t.signature = e.sign(t.md); }, t.verify = function () { var e = !1, r = t.md; if (null === r) {
        if (t.signatureOid in f) {
            switch (f[t.signatureOid]) {
                case "sha1WithRSAEncryption":
                    r = l.md.sha1.create();
                    break;
                case "md5WithRSAEncryption":
                    r = l.md.md5.create();
                    break;
                case "sha256WithRSAEncryption":
                    r = l.md.sha256.create();
                    break;
                case "sha384WithRSAEncryption":
                    r = l.md.sha384.create();
                    break;
                case "sha512WithRSAEncryption":
                    r = l.md.sha512.create();
                    break;
                case "RSASSA-PSS": r = l.md.sha256.create();
            }
        }
        if (null === r) {
            var a = new Error("Could not compute certification request digest. Unknown signature OID.");
            throw a.signatureOid = t.signatureOid, a;
        }
        var i = t.certificationRequestInfo || p.getCertificationRequestInfo(t), n = h.toDer(i);
        r.update(n.getBytes());
    } if (null !== r) {
        var s;
        switch (t.signatureOid) {
            case f.sha1WithRSAEncryption: break;
            case f["RSASSA-PSS"]:
                var o, u;
                if (void 0 === (o = f[t.signatureParameters.mgf.hash.algorithmOid]) || void 0 === l.md[o]) {
                    var a = new Error("Unsupported MGF hash function.");
                    throw a.oid = t.signatureParameters.mgf.hash.algorithmOid, a.name = o, a;
                }
                if (void 0 === (u = f[t.signatureParameters.mgf.algorithmOid]) || void 0 === l.mgf[u]) {
                    var a = new Error("Unsupported MGF function.");
                    throw a.oid = t.signatureParameters.mgf.algorithmOid, a.name = u, a;
                }
                if (u = l.mgf[u].create(l.md[o].create()), void 0 === (o = f[t.signatureParameters.hash.algorithmOid]) || void 0 === l.md[o]) {
                    var a = new Error("Unsupported RSASSA-PSS hash function.");
                    throw a.oid = t.signatureParameters.hash.algorithmOid, a.name = o, a;
                }
                s = l.pss.create(l.md[o].create(), u, t.signatureParameters.saltLength);
        }
        e = t.publicKey.verify(r.digest().getBytes(), t.signature, s);
    } return e; }, t; }; var S = new Date("1950-01-01T00:00:00Z"), T = new Date("2050-01-01T00:00:00Z"); p.getTBSCertificate = function (t) { var e = c(t.validity.notBefore), r = c(t.validity.notAfter), a = h.create(h.Class.UNIVERSAL, h.Type.SEQUENCE, !0, [h.create(h.Class.CONTEXT_SPECIFIC, 0, !0, [h.create(h.Class.UNIVERSAL, h.Type.INTEGER, !1, h.integerToDer(t.version).getBytes())]), h.create(h.Class.UNIVERSAL, h.Type.INTEGER, !1, l.util.hexToBytes(t.serialNumber)), h.create(h.Class.UNIVERSAL, h.Type.SEQUENCE, !0, [h.create(h.Class.UNIVERSAL, h.Type.OID, !1, h.oidToDer(t.siginfo.algorithmOid).getBytes()), o(t.siginfo.algorithmOid, t.siginfo.parameters)]), i(t.issuer), h.create(h.Class.UNIVERSAL, h.Type.SEQUENCE, !0, [e, r]), i(t.subject), p.publicKeyToAsn1(t.publicKey)]); return t.issuer.uniqueId && a.value.push(h.create(h.Class.CONTEXT_SPECIFIC, 1, !0, [h.create(h.Class.UNIVERSAL, h.Type.BITSTRING, !1, String.fromCharCode(0) + t.issuer.uniqueId)])), t.subject.uniqueId && a.value.push(h.create(h.Class.CONTEXT_SPECIFIC, 2, !0, [h.create(h.Class.UNIVERSAL, h.Type.BITSTRING, !1, String.fromCharCode(0) + t.subject.uniqueId)])), t.extensions.length > 0 && a.value.push(p.certificateExtensionsToAsn1(t.extensions)), a; }, p.getCertificationRequestInfo = function (t) { return h.create(h.Class.UNIVERSAL, h.Type.SEQUENCE, !0, [h.create(h.Class.UNIVERSAL, h.Type.INTEGER, !1, h.integerToDer(t.version).getBytes()), i(t.subject), p.publicKeyToAsn1(t.publicKey), u(t)]); }, p.distinguishedNameToAsn1 = function (t) { return i(t); }, p.certificateToAsn1 = function (t) { var e = t.tbsCertificate || p.getTBSCertificate(t); return h.create(h.Class.UNIVERSAL, h.Type.SEQUENCE, !0, [e, h.create(h.Class.UNIVERSAL, h.Type.SEQUENCE, !0, [h.create(h.Class.UNIVERSAL, h.Type.OID, !1, h.oidToDer(t.signatureOid).getBytes()), o(t.signatureOid, t.signatureParameters)]), h.create(h.Class.UNIVERSAL, h.Type.BITSTRING, !1, String.fromCharCode(0) + t.signature)]); }, p.certificateExtensionsToAsn1 = function (t) { var e = h.create(h.Class.CONTEXT_SPECIFIC, 3, !0, []), r = h.create(h.Class.UNIVERSAL, h.Type.SEQUENCE, !0, []); e.value.push(r); for (var a = 0; a < t.length; ++a)
        r.value.push(p.certificateExtensionToAsn1(t[a])); return e; }, p.certificateExtensionToAsn1 = function (t) { var e = h.create(h.Class.UNIVERSAL, h.Type.SEQUENCE, !0, []); e.value.push(h.create(h.Class.UNIVERSAL, h.Type.OID, !1, h.oidToDer(t.id).getBytes())), t.critical && e.value.push(h.create(h.Class.UNIVERSAL, h.Type.BOOLEAN, !1, String.fromCharCode(255))); var r = t.value; return "string" != typeof t.value && (r = h.toDer(r).getBytes()), e.value.push(h.create(h.Class.UNIVERSAL, h.Type.OCTETSTRING, !1, r)), e; }, p.certificationRequestToAsn1 = function (t) { var e = t.certificationRequestInfo || p.getCertificationRequestInfo(t); return h.create(h.Class.UNIVERSAL, h.Type.SEQUENCE, !0, [e, h.create(h.Class.UNIVERSAL, h.Type.SEQUENCE, !0, [h.create(h.Class.UNIVERSAL, h.Type.OID, !1, h.oidToDer(t.signatureOid).getBytes()), o(t.signatureOid, t.signatureParameters)]), h.create(h.Class.UNIVERSAL, h.Type.BITSTRING, !1, String.fromCharCode(0) + t.signature)]); }, p.createCaStore = function (t) { function e(t) { return r(t), a.certs[t.hash] || null; } function r(t) { if (!t.hash) {
        var e = l.md.sha1.create();
        t.attributes = p.RDNAttributesAsArray(i(t), e), t.hash = e.digest().toHex();
    } } var a = { certs: {} }; if (a.getIssuer = function (t) { return e(t.issuer); }, a.addCertificate = function (t) { if ("string" == typeof t && (t = l.pki.certificateFromPem(t)), r(t.subject), !a.hasCertificate(t))
        if (t.subject.hash in a.certs) {
            var e = a.certs[t.subject.hash];
            l.util.isArray(e) || (e = [e]), e.push(t), a.certs[t.subject.hash] = e;
        }
        else
            a.certs[t.subject.hash] = t; }, a.hasCertificate = function (t) { "string" == typeof t && (t = l.pki.certificateFromPem(t)); var r = e(t.subject); if (!r)
        return !1; l.util.isArray(r) || (r = [r]); for (var a = h.toDer(p.certificateToAsn1(t)).getBytes(), i = 0; i < r.length; ++i) {
        if (a === h.toDer(p.certificateToAsn1(r[i])).getBytes())
            return !0;
    } return !1; }, a.listAllCertificates = function () { var t = []; for (var e in a.certs)
        if (a.certs.hasOwnProperty(e)) {
            var r = a.certs[e];
            if (l.util.isArray(r))
                for (var i = 0; i < r.length; ++i)
                    t.push(r[i]);
            else
                t.push(r);
        } return t; }, a.removeCertificate = function (t) { var i; if ("string" == typeof t && (t = l.pki.certificateFromPem(t)), r(t.subject), !a.hasCertificate(t))
        return null; var n = e(t.subject); if (!l.util.isArray(n))
        return i = a.certs[t.subject.hash], delete a.certs[t.subject.hash], i; for (var s = h.toDer(p.certificateToAsn1(t)).getBytes(), o = 0; o < n.length; ++o) {
        s === h.toDer(p.certificateToAsn1(n[o])).getBytes() && (i = n[o], n.splice(o, 1));
    } return 0 === n.length && delete a.certs[t.subject.hash], i; }, t)
        for (var n = 0; n < t.length; ++n) {
            var s = t[n];
            a.addCertificate(s);
        } return a; }, p.certificateError = { bad_certificate: "forge.pki.BadCertificate", unsupported_certificate: "forge.pki.UnsupportedCertificate", certificate_revoked: "forge.pki.CertificateRevoked", certificate_expired: "forge.pki.CertificateExpired", certificate_unknown: "forge.pki.CertificateUnknown", unknown_ca: "forge.pki.UnknownCertificateAuthority" }, p.verifyCertificateChain = function (t, e, r) { "function" == typeof r && (r = { verify: r }), r = r || {}, e = e.slice(0); var a = e.slice(0), i = r.validityCheckDate; void 0 === i && (i = new Date); var n = !0, s = null, o = 0; do {
        var u = e.shift(), c = null, h = !1;
        if (i && (i < u.validity.notBefore || i > u.validity.notAfter) && (s = { message: "Certificate is not valid yet or has expired.", error: p.certificateError.certificate_expired, notBefore: u.validity.notBefore, notAfter: u.validity.notAfter, now: i }), null === s) {
            if (c = e[0] || t.getIssuer(u), null === c && u.isIssuer(u) && (h = !0, c = u), c) {
                var f = c;
                l.util.isArray(f) || (f = [f]);
                for (var d = !1; !d && f.length > 0;) {
                    c = f.shift();
                    try {
                        d = c.verify(u);
                    }
                    catch (t) { }
                }
                d || (s = { message: "Certificate signature is invalid.", error: p.certificateError.bad_certificate });
            }
            null !== s || c && !h || t.hasCertificate(u) || (s = { message: "Certificate is not trusted.", error: p.certificateError.unknown_ca });
        }
        if (null === s && c && !u.isIssuer(c) && (s = { message: "Certificate issuer is invalid.", error: p.certificateError.bad_certificate }), null === s)
            for (var y = { keyUsage: !0, basicConstraints: !0 }, g = 0; null === s && g < u.extensions.length; ++g) {
                var m = u.extensions[g];
                !m.critical || m.name in y || (s = { message: "Certificate has an unsupported critical extension.", error: p.certificateError.unsupported_certificate });
            }
        if (null === s && (!n || 0 === e.length && (!c || h))) {
            var v = u.getExtension("basicConstraints"), C = u.getExtension("keyUsage");
            if (null !== C && (C.keyCertSign && null !== v || (s = { message: "Certificate keyUsage or basicConstraints conflict or indicate that the certificate is not a CA. If the certificate is the only one in the chain or isn't the first then the certificate must be a valid CA.", error: p.certificateError.bad_certificate })), null !== s || null === v || v.cA || (s = { message: "Certificate basicConstraints indicates the certificate is not a CA.", error: p.certificateError.bad_certificate }), null === s && null !== C && "pathLenConstraint" in v) {
                o - 1 > v.pathLenConstraint && (s = { message: "Certificate basicConstraints pathLenConstraint violated.", error: p.certificateError.bad_certificate });
            }
        }
        var E = null === s || s.error, S = r.verify ? r.verify(E, o, a) : E;
        if (!0 !== S)
            throw !0 === E && (s = { message: "The application rejected the certificate.", error: p.certificateError.bad_certificate }), (S || 0 === S) && ("object" != typeof S || l.util.isArray(S) ? "string" == typeof S && (s.error = S) : (S.message && (s.message = S.message), S.error && (s.error = S.error))), s;
        s = null, n = !1, ++o;
    } while (e.length > 0); return !0; }; }, function (t, e, r) { var a = r(0); r(5), r(1), (t.exports = a.pss = a.pss || {}).create = function (t) { 3 === arguments.length && (t = { md: arguments[0], mgf: arguments[1], saltLength: arguments[2] }); var e = t.md, r = t.mgf, i = e.digestLength, n = t.salt || null; "string" == typeof n && (n = a.util.createBuffer(n)); var s; if ("saltLength" in t)
        s = t.saltLength;
    else {
        if (null === n)
            throw new Error("Salt length not specified or specific salt not given.");
        s = n.length();
    } if (null !== n && n.length() !== s)
        throw new Error("Given salt length does not match length of given salt."); var o = t.prng || a.random, u = {}; return u.encode = function (t, u) { var c, l = u - 1, h = Math.ceil(l / 8), p = t.digest().getBytes(); if (h < i + s + 2)
        throw new Error("Message is too long to encrypt."); var f; f = null === n ? o.getBytesSync(s) : n.bytes(); var d = new a.util.ByteBuffer; d.fillWithByte(0, 8), d.putBytes(p), d.putBytes(f), e.start(), e.update(d.getBytes()); var y = e.digest().getBytes(), g = new a.util.ByteBuffer; g.fillWithByte(0, h - s - i - 2), g.putByte(1), g.putBytes(f); var m = g.getBytes(), v = h - i - 1, C = r.generate(y, v), E = ""; for (c = 0; c < v; c++)
        E += String.fromCharCode(m.charCodeAt(c) ^ C.charCodeAt(c)); var S = 65280 >> 8 * h - l & 255; return (E = String.fromCharCode(E.charCodeAt(0) & ~S) + E.substr(1)) + y + String.fromCharCode(188); }, u.verify = function (t, n, o) { var u, c = o - 1, l = Math.ceil(c / 8); if (n = n.substr(-l), l < i + s + 2)
        throw new Error("Inconsistent parameters to PSS signature verification."); if (188 !== n.charCodeAt(l - 1))
        throw new Error("Encoded message does not end in 0xBC."); var h = l - i - 1, p = n.substr(0, h), f = n.substr(h, i), d = 65280 >> 8 * l - c & 255; if (0 != (p.charCodeAt(0) & d))
        throw new Error("Bits beyond keysize not zero as expected."); var y = r.generate(f, h), g = ""; for (u = 0; u < h; u++)
        g += String.fromCharCode(p.charCodeAt(u) ^ y.charCodeAt(u)); g = String.fromCharCode(g.charCodeAt(0) & ~d) + g.substr(1); var m = l - i - s - 2; for (u = 0; u < m; u++)
        if (0 !== g.charCodeAt(u))
            throw new Error("Leftmost octets not zero as expected"); if (1 !== g.charCodeAt(m))
        throw new Error("Inconsistent PSS signature, 0x01 marker not found"); var v = g.substr(-s), C = new a.util.ByteBuffer; return C.fillWithByte(0, 8), C.putBytes(t), C.putBytes(v), e.start(), e.update(C.getBytes()), f === e.digest().getBytes(); }, u; }; }, function (t, e, r) { r(22), r(6), r(1), r(9), r(8), r(10), r(16), t.exports = r(0); }, function (t, e, r) { var a = r(0); r(2), r(3), r(13), r(12), r(10), r(29), r(20), r(7), r(1), r(19); var i = a.asn1, n = t.exports = a.pki = a.pki || {}; n.pemToDer = function (t) { var e = a.pem.decode(t)[0]; if (e.procType && "ENCRYPTED" === e.procType.type)
        throw new Error("Could not convert PEM to DER; PEM is encrypted."); return a.util.createBuffer(e.body); }, n.privateKeyFromPem = function (t) { var e = a.pem.decode(t)[0]; if ("PRIVATE KEY" !== e.type && "RSA PRIVATE KEY" !== e.type) {
        var r = new Error('Could not convert private key from PEM; PEM header type is not "PRIVATE KEY" or "RSA PRIVATE KEY".');
        throw r.headerType = e.type, r;
    } if (e.procType && "ENCRYPTED" === e.procType.type)
        throw new Error("Could not convert private key from PEM; PEM is encrypted."); var s = i.fromDer(e.body); return n.privateKeyFromAsn1(s); }, n.privateKeyToPem = function (t, e) { var r = { type: "RSA PRIVATE KEY", body: i.toDer(n.privateKeyToAsn1(t)).getBytes() }; return a.pem.encode(r, { maxline: e }); }, n.privateKeyInfoToPem = function (t, e) { var r = { type: "PRIVATE KEY", body: i.toDer(t).getBytes() }; return a.pem.encode(r, { maxline: e }); }; }, function (t, e) { var r; r = function () { return this; }(); try {
        r = r || Function("return this")() || (0, eval)("this");
    }
    catch (t) {
        "object" == typeof window && (r = window);
    } t.exports = r; }, function (t, e) { function r(t, e) { var r = 0, a = e.length, i = e.charAt(0), n = [0]; for (r = 0; r < t.length(); ++r) {
        for (var s = 0, o = t.at(r); s < n.length; ++s)
            o += n[s] << 8, n[s] = o % a, o = o / a | 0;
        for (; o > 0;)
            n.push(o % a), o = o / a | 0;
    } var u = ""; for (r = 0; 0 === t.at(r) && r < t.length() - 1; ++r)
        u += i; for (r = n.length - 1; r >= 0; --r)
        u += e[n[r]]; return u; } var a = {}; t.exports = a; var i = {}; a.encode = function (t, e, a) { if ("string" != typeof e)
        throw new TypeError('"alphabet" must be a string.'); if (void 0 !== a && "number" != typeof a)
        throw new TypeError('"maxline" must be a number.'); var i = ""; if (t instanceof Uint8Array) {
        var n = 0, s = e.length, o = e.charAt(0), u = [0];
        for (n = 0; n < t.length; ++n) {
            for (var c = 0, l = t[n]; c < u.length; ++c)
                l += u[c] << 8, u[c] = l % s, l = l / s | 0;
            for (; l > 0;)
                u.push(l % s), l = l / s | 0;
        }
        for (n = 0; 0 === t[n] && n < t.length - 1; ++n)
            i += o;
        for (n = u.length - 1; n >= 0; --n)
            i += e[u[n]];
    }
    else
        i = r(t, e); if (a) {
        var h = new RegExp(".{1," + a + "}", "g");
        i = i.match(h).join("\r\n");
    } return i; }, a.decode = function (t, e) { if ("string" != typeof t)
        throw new TypeError('"input" must be a string.'); if ("string" != typeof e)
        throw new TypeError('"alphabet" must be a string.'); var r = i[e]; if (!r) {
        r = i[e] = [];
        for (var a = 0; a < e.length; ++a)
            r[e.charCodeAt(a)] = a;
    } t = t.replace(/\s/g, ""); for (var n = e.length, s = e.charAt(0), o = [0], a = 0; a < t.length; a++) {
        var u = r[t.charCodeAt(a)];
        if (void 0 === u)
            return;
        for (var c = 0, l = u; c < o.length; ++c)
            l += o[c] * n, o[c] = 255 & l, l >>= 8;
        for (; l > 0;)
            o.push(255 & l), l >>= 8;
    } for (var h = 0; t[h] === s && h < t.length - 1; ++h)
        o.push(0); return "undefined" != typeof Buffer ? Buffer.from(o.reverse()) : new Uint8Array(o.reverse()); }; }, function (t, e, r) { var a = r(0); r(1); var i = null; !a.util.isNodejs || a.options.usePureJavaScript || process.versions["node-webkit"] || (i = r(11)), (t.exports = a.prng = a.prng || {}).create = function (t) { function e(t) { if (o.pools[0].messageLength >= 32)
        return n(), t(); var e = 32 - o.pools[0].messageLength << 5; o.seedFile(e, function (e, r) { if (e)
        return t(e); o.collect(r), n(), t(); }); } function r() { if (o.pools[0].messageLength >= 32)
        return n(); var t = 32 - o.pools[0].messageLength << 5; o.collect(o.seedFileSync(t)), n(); } function n() { o.reseeds = 4294967295 === o.reseeds ? 0 : o.reseeds + 1; var t = o.plugin.md.create(); t.update(o.keyBytes); for (var e = 1, r = 0; r < 32; ++r)
        o.reseeds % e == 0 && (t.update(o.pools[r].digest().getBytes()), o.pools[r].start()), e <<= 1; o.keyBytes = t.digest().getBytes(), t.start(), t.update(o.keyBytes); var a = t.digest().getBytes(); o.key = o.plugin.formatKey(o.keyBytes), o.seed = o.plugin.formatSeed(a), o.generated = 0; } function s(t) { var e = null, r = a.util.globalScope, i = r.crypto || r.msCrypto; i && i.getRandomValues && (e = function (t) { return i.getRandomValues(t); }); var n = a.util.createBuffer(); if (e)
        for (; n.length() < t;) {
            var s = Math.max(1, Math.min(t - n.length(), 65536) / 4), o = new Uint32Array(Math.floor(s));
            try {
                e(o);
                for (var u = 0; u < o.length; ++u)
                    n.putInt32(o[u]);
            }
            catch (t) {
                if (!("undefined" != typeof QuotaExceededError && t instanceof QuotaExceededError))
                    throw t;
            }
        } if (n.length() < t)
        for (var c, l, h, p = Math.floor(65536 * Math.random()); n.length() < t;) {
            l = 16807 * (65535 & p), c = 16807 * (p >> 16), l += (32767 & c) << 16, l += c >> 15, l = (2147483647 & l) + (l >> 31), p = 4294967295 & l;
            for (var u = 0; u < 3; ++u)
                h = p >>> (u << 3), h ^= Math.floor(256 * Math.random()), n.putByte(String.fromCharCode(255 & h));
        } return n.getBytes(t); } for (var o = { plugin: t, key: null, seed: null, time: null, reseeds: 0, generated: 0, keyBytes: "" }, u = t.md, c = new Array(32), l = 0; l < 32; ++l)
        c[l] = u.create(); return o.pools = c, o.pool = 0, o.generate = function (t, r) { function i(h) { if (h)
        return r(h); if (l.length() >= t)
        return r(null, l.getBytes(t)); if (o.generated > 1048575 && (o.key = null), null === o.key)
        return a.util.nextTick(function () { e(i); }); var p = n(o.key, o.seed); o.generated += p.length, l.putBytes(p), o.key = u(n(o.key, s(o.seed))), o.seed = c(n(o.key, o.seed)), a.util.setImmediate(i); } if (!r)
        return o.generateSync(t); var n = o.plugin.cipher, s = o.plugin.increment, u = o.plugin.formatKey, c = o.plugin.formatSeed, l = a.util.createBuffer(); o.key = null, i(); }, o.generateSync = function (t) { var e = o.plugin.cipher, i = o.plugin.increment, n = o.plugin.formatKey, s = o.plugin.formatSeed; o.key = null; for (var u = a.util.createBuffer(); u.length() < t;) {
        o.generated > 1048575 && (o.key = null), null === o.key && r();
        var c = e(o.key, o.seed);
        o.generated += c.length, u.putBytes(c), o.key = n(e(o.key, i(o.seed))), o.seed = s(e(o.key, o.seed));
    } return u.getBytes(t); }, i ? (o.seedFile = function (t, e) { i.randomBytes(t, function (t, r) { if (t)
        return e(t); e(null, r.toString()); }); }, o.seedFileSync = function (t) { return i.randomBytes(t).toString(); }) : (o.seedFile = function (t, e) { try {
        e(null, s(t));
    }
    catch (t) {
        e(t);
    } }, o.seedFileSync = s), o.collect = function (t) { for (var e = t.length, r = 0; r < e; ++r)
        o.pools[o.pool].update(t.substr(r, 1)), o.pool = 31 === o.pool ? 0 : o.pool + 1; }, o.collectInt = function (t, e) { for (var r = "", a = 0; a < e; a += 8)
        r += String.fromCharCode(t >> a & 255); o.collect(r); }, o.registerWorker = function (t) { if (t === self)
        o.seedFile = function (t, e) { function r(t) { var a = t.data; a.forge && a.forge.prng && (self.removeEventListener("message", r), e(a.forge.prng.err, a.forge.prng.bytes)); } self.addEventListener("message", r), self.postMessage({ forge: { prng: { needed: t } } }); };
    else {
        var e = function (e) { var r = e.data; r.forge && r.forge.prng && o.seedFile(r.forge.prng.needed, function (e, r) { t.postMessage({ forge: { prng: { err: e, bytes: r } } }); }); };
        t.addEventListener("message", e);
    } }, o; }; }, function (t, e, r) { var a = r(0); r(1); var i = [217, 120, 249, 196, 25, 221, 181, 237, 40, 233, 253, 121, 74, 160, 216, 157, 198, 126, 55, 131, 43, 118, 83, 142, 98, 76, 100, 136, 68, 139, 251, 162, 23, 154, 89, 245, 135, 179, 79, 19, 97, 69, 109, 141, 9, 129, 125, 50, 189, 143, 64, 235, 134, 183, 123, 11, 240, 149, 33, 34, 92, 107, 78, 130, 84, 214, 101, 147, 206, 96, 178, 28, 115, 86, 192, 20, 167, 140, 241, 220, 18, 117, 202, 31, 59, 190, 228, 209, 66, 61, 212, 48, 163, 60, 182, 38, 111, 191, 14, 218, 70, 105, 7, 87, 39, 242, 29, 155, 188, 148, 67, 3, 248, 17, 199, 246, 144, 239, 62, 231, 6, 195, 213, 47, 200, 102, 30, 215, 8, 232, 234, 222, 128, 82, 238, 247, 132, 170, 114, 172, 53, 77, 106, 42, 150, 26, 210, 113, 90, 21, 73, 116, 75, 159, 208, 94, 4, 24, 164, 236, 194, 224, 65, 110, 15, 81, 203, 204, 36, 145, 175, 80, 161, 244, 112, 57, 153, 124, 58, 133, 35, 184, 180, 122, 252, 2, 54, 91, 37, 85, 151, 49, 45, 93, 250, 152, 227, 138, 146, 174, 5, 223, 41, 16, 103, 108, 186, 201, 211, 0, 230, 207, 225, 158, 168, 44, 99, 22, 1, 63, 88, 226, 137, 169, 13, 56, 52, 27, 171, 51, 255, 176, 187, 72, 12, 95, 185, 177, 205, 46, 197, 243, 219, 71, 229, 165, 156, 119, 10, 166, 32, 104, 254, 127, 193, 173], n = [1, 2, 3, 5], s = function (t, e) { return t << e & 65535 | (65535 & t) >> 16 - e; }, o = function (t, e) { return (65535 & t) >> e | t << 16 - e & 65535; }; t.exports = a.rc2 = a.rc2 || {}, a.rc2.expandKey = function (t, e) { "string" == typeof t && (t = a.util.createBuffer(t)), e = e || 128; var r, n = t, s = t.length(), o = e, u = Math.ceil(o / 8), c = 255 >> (7 & o); for (r = s; r < 128; r++)
        n.putByte(i[n.at(r - 1) + n.at(r - s) & 255]); for (n.setAt(128 - u, i[n.at(128 - u) & c]), r = 127 - u; r >= 0; r--)
        n.setAt(r, i[n.at(r + 1) ^ n.at(r + u)]); return n; }; var u = function (t, e, r) { var i, u, c, l, h = !1, p = null, f = null, d = null, y = []; for (t = a.rc2.expandKey(t, e), c = 0; c < 64; c++)
        y.push(t.getInt16Le()); r ? (i = function (t) { for (c = 0; c < 4; c++)
        t[c] += y[l] + (t[(c + 3) % 4] & t[(c + 2) % 4]) + (~t[(c + 3) % 4] & t[(c + 1) % 4]), t[c] = s(t[c], n[c]), l++; }, u = function (t) { for (c = 0; c < 4; c++)
        t[c] += y[63 & t[(c + 3) % 4]]; }) : (i = function (t) { for (c = 3; c >= 0; c--)
        t[c] = o(t[c], n[c]), t[c] -= y[l] + (t[(c + 3) % 4] & t[(c + 2) % 4]) + (~t[(c + 3) % 4] & t[(c + 1) % 4]), l--; }, u = function (t) { for (c = 3; c >= 0; c--)
        t[c] -= y[63 & t[(c + 3) % 4]]; }); var g = function (t) { var e = []; for (c = 0; c < 4; c++) {
        var a = p.getInt16Le();
        null !== d && (r ? a ^= d.getInt16Le() : d.putInt16Le(a)), e.push(65535 & a);
    } l = r ? 0 : 63; for (var i = 0; i < t.length; i++)
        for (var n = 0; n < t[i][0]; n++)
            t[i][1](e); for (c = 0; c < 4; c++)
        null !== d && (r ? d.putInt16Le(e[c]) : e[c] ^= d.getInt16Le()), f.putInt16Le(e[c]); }, m = null; return m = { start: function (t, e) { t && "string" == typeof t && (t = a.util.createBuffer(t)), h = !1, p = a.util.createBuffer(), f = e || new a.util.createBuffer, d = t, m.output = f; }, update: function (t) { for (h || p.putBuffer(t); p.length() >= 8;)
            g([[5, i], [1, u], [6, i], [1, u], [5, i]]); }, finish: function (t) { var e = !0; if (r)
            if (t)
                e = t(8, p, !r);
            else {
                var a = 8 === p.length() ? 8 : 8 - p.length();
                p.fillWithByte(a, a);
            } if (e && (h = !0, m.update()), !r && (e = 0 === p.length()))
            if (t)
                e = t(8, f, !r);
            else {
                var i = f.length(), n = f.at(i - 1);
                n > i ? e = !1 : f.truncate(n);
            } return e; } }; }; a.rc2.startEncrypting = function (t, e, r) { var i = a.rc2.createEncryptionCipher(t, 128); return i.start(e, r), i; }, a.rc2.createEncryptionCipher = function (t, e) { return u(t, e, !0); }, a.rc2.startDecrypting = function (t, e, r) { var i = a.rc2.createDecryptionCipher(t, 128); return i.start(e, r), i; }, a.rc2.createDecryptionCipher = function (t, e) { return u(t, e, !1); }; }, function (t, e, r) { function a(t, e, r) { r || (r = i.md.sha1.create()); for (var a = "", n = Math.ceil(e / r.digestLength), s = 0; s < n; ++s) {
        var o = String.fromCharCode(s >> 24 & 255, s >> 16 & 255, s >> 8 & 255, 255 & s);
        r.start(), r.update(t + o), a += r.digest().getBytes();
    } return a.substring(0, e); } var i = r(0); r(1), r(5), r(18); var n = t.exports = i.pkcs1 = i.pkcs1 || {}; n.encode_rsa_oaep = function (t, e, r) { var n, s, o, u; "string" == typeof r ? (n = r, s = arguments[3] || void 0, o = arguments[4] || void 0) : r && (n = r.label || void 0, s = r.seed || void 0, o = r.md || void 0, r.mgf1 && r.mgf1.md && (u = r.mgf1.md)), o ? o.start() : o = i.md.sha1.create(), u || (u = o); var c = Math.ceil(t.n.bitLength() / 8), l = c - 2 * o.digestLength - 2; if (e.length > l) {
        var h = new Error("RSAES-OAEP input message length is too long.");
        throw h.length = e.length, h.maxLength = l, h;
    } n || (n = ""), o.update(n, "raw"); for (var p = o.digest(), f = "", d = l - e.length, y = 0; y < d; y++)
        f += "\0"; var g = p.getBytes() + f + "" + e; if (s) {
        if (s.length !== o.digestLength) {
            var h = new Error("Invalid RSAES-OAEP seed. The seed length must match the digest length.");
            throw h.seedLength = s.length, h.digestLength = o.digestLength, h;
        }
    }
    else
        s = i.random.getBytes(o.digestLength); var m = a(s, c - o.digestLength - 1, u), v = i.util.xorBytes(g, m, g.length), C = a(v, o.digestLength, u); return "\0" + i.util.xorBytes(s, C, s.length) + v; }, n.decode_rsa_oaep = function (t, e, r) { var n, s, o; "string" == typeof r ? (n = r, s = arguments[3] || void 0) : r && (n = r.label || void 0, s = r.md || void 0, r.mgf1 && r.mgf1.md && (o = r.mgf1.md)); var u = Math.ceil(t.n.bitLength() / 8); if (e.length !== u) {
        var c = new Error("RSAES-OAEP encoded message length is invalid.");
        throw c.length = e.length, c.expectedLength = u, c;
    } if (void 0 === s ? s = i.md.sha1.create() : s.start(), o || (o = s), u < 2 * s.digestLength + 2)
        throw new Error("RSAES-OAEP key is too short for the hash function."); n || (n = ""), s.update(n, "raw"); for (var l = s.digest().getBytes(), h = e.charAt(0), p = e.substring(1, s.digestLength + 1), f = e.substring(1 + s.digestLength), d = a(f, s.digestLength, o), y = i.util.xorBytes(p, d, p.length), g = a(y, u - s.digestLength - 1, o), m = i.util.xorBytes(f, g, f.length), v = m.substring(0, s.digestLength), c = "\0" !== h, C = 0; C < s.digestLength; ++C)
        c |= l.charAt(C) !== v.charAt(C); for (var E = 1, S = s.digestLength, T = s.digestLength; T < m.length; T++) {
        var I = m.charCodeAt(T), b = 1 & I ^ 1;
        c |= I & (E ? 65534 : 0), E &= b, S += E;
    } if (c || 1 !== m.charCodeAt(S))
        throw new Error("Invalid RSAES-OAEP padding."); return m.substring(S + 1); }; }, function (t, e, r) { var a = r(0); r(1), r(17), r(5), function () { function e(t, e, a, i) { return "workers" in a ? n(t, e, a, i) : r(t, e, a, i); } function r(t, e, r, a) { var n = s(t, e), u = o(n.bitLength()); "millerRabinTests" in r && (u = r.millerRabinTests); var c = 10; "maxBlockTime" in r && (c = r.maxBlockTime), i(n, t, e, 0, u, c, a); } function i(t, e, r, n, o, u, c) { var h = +new Date; do {
        if (t.bitLength() > e && (t = s(e, r)), t.isProbablePrime(o))
            return c(null, t);
        t.dAddOffset(l[n++ % 8], 0);
    } while (u < 0 || +new Date - h < u); a.util.setImmediate(function () { i(t, e, r, n, o, u, c); }); } function n(t, e, i, n) { function o() { function r(r) { if (!d) {
        --o;
        var i = r.data;
        if (i.found) {
            for (var l = 0; l < a.length; ++l)
                a[l].terminate();
            return d = !0, n(null, new c(i.prime, 16));
        }
        u.bitLength() > t && (u = s(t, e));
        var f = u.toString(16);
        r.target.postMessage({ hex: f, workLoad: h }), u.dAddOffset(p, 0);
    } } l = Math.max(1, l); for (var a = [], i = 0; i < l; ++i)
        a[i] = new Worker(f); for (var o = l, i = 0; i < l; ++i)
        a[i].addEventListener("message", r); var d = !1; } if ("undefined" == typeof Worker)
        return r(t, e, i, n); var u = s(t, e), l = i.workers, h = i.workLoad || 100, p = 30 * h / 8, f = i.workerScript || "forge/prime.worker.js"; if (-1 === l)
        return a.util.estimateCores(function (t, e) { t && (e = 2), l = e - 1, o(); }); o(); } function s(t, e) { var r = new c(t, e), a = t - 1; return r.testBit(a) || r.bitwiseTo(c.ONE.shiftLeft(a), p, r), r.dAddOffset(31 - r.mod(h).byteValue(), 0), r; } function o(t) { return t <= 100 ? 27 : t <= 150 ? 18 : t <= 200 ? 15 : t <= 250 ? 12 : t <= 300 ? 9 : t <= 350 ? 8 : t <= 400 ? 7 : t <= 500 ? 6 : t <= 600 ? 5 : t <= 800 ? 4 : t <= 1250 ? 3 : 2; } if (a.prime)
        return void (t.exports = a.prime); var u = t.exports = a.prime = a.prime || {}, c = a.jsbn.BigInteger, l = [6, 4, 2, 4, 2, 4, 6, 2], h = new c(null); h.fromInt(30); var p = function (t, e) { return t | e; }; u.generateProbablePrime = function (t, r, i) { "function" == typeof r && (i = r, r = {}), r = r || {}; var n = r.algorithm || "PRIMEINC"; "string" == typeof n && (n = { name: n }), n.options = n.options || {}; var s = r.prng || a.random, o = { nextBytes: function (t) { for (var e = s.getBytesSync(t.length), r = 0; r < t.length; ++r)
            t[r] = e.charCodeAt(r); } }; if ("PRIMEINC" === n.name)
        return e(t, o, n.options, i); throw new Error("Invalid prime generation algorithm: " + n.name); }; }(); }, function (t, e, r) { function a(t, e, r, a) { for (var i = [], n = 0; n < t.length; n++)
        for (var s = 0; s < t[n].safeBags.length; s++) {
            var o = t[n].safeBags[s];
            void 0 !== a && o.type !== a || (null !== e ? void 0 !== o.attributes[e] && o.attributes[e].indexOf(r) >= 0 && i.push(o) : i.push(o));
        } return i; } function i(t) { if (t.composed || t.constructed) {
        for (var e = c.util.createBuffer(), r = 0; r < t.value.length; ++r)
            e.putBytes(t.value[r].value);
        t.composed = t.constructed = !1, t.value = e.getBytes();
    } return t; } function n(t, e, r, a) { if (e = l.fromDer(e, r), e.tagClass !== l.Class.UNIVERSAL || e.type !== l.Type.SEQUENCE || !0 !== e.constructed)
        throw new Error("PKCS#12 AuthenticatedSafe expected to be a SEQUENCE OF ContentInfo"); for (var n = 0; n < e.value.length; n++) {
        var u = e.value[n], c = {}, p = [];
        if (!l.validate(u, f, c, p)) {
            var d = new Error("Cannot read ContentInfo.");
            throw d.errors = p, d;
        }
        var y = { encrypted: !1 }, g = null, m = c.content.value[0];
        switch (l.derToOid(c.contentType)) {
            case h.oids.data:
                if (m.tagClass !== l.Class.UNIVERSAL || m.type !== l.Type.OCTETSTRING)
                    throw new Error("PKCS#12 SafeContents Data is not an OCTET STRING.");
                g = i(m).value;
                break;
            case h.oids.encryptedData:
                g = s(m, a), y.encrypted = !0;
                break;
            default:
                var d = new Error("Unsupported PKCS#12 contentType.");
                throw d.contentType = l.derToOid(c.contentType), d;
        }
        y.safeBags = o(g, r, a), t.safeContents.push(y);
    } } function s(t, e) { var r = {}, a = []; if (!l.validate(t, c.pkcs7.asn1.encryptedDataValidator, r, a)) {
        var n = new Error("Cannot read EncryptedContentInfo.");
        throw n.errors = a, n;
    } var s = l.derToOid(r.contentType); if (s !== h.oids.data) {
        var n = new Error("PKCS#12 EncryptedContentInfo ContentType is not Data.");
        throw n.oid = s, n;
    } s = l.derToOid(r.encAlgorithm); var o = h.pbe.getCipher(s, r.encParameter, e), u = i(r.encryptedContentAsn1), p = c.util.createBuffer(u.value); if (o.update(p), !o.finish())
        throw new Error("Failed to decrypt PKCS#12 SafeContents."); return o.output.getBytes(); } function o(t, e, r) { if (!e && 0 === t.length)
        return []; if (t = l.fromDer(t, e), t.tagClass !== l.Class.UNIVERSAL || t.type !== l.Type.SEQUENCE || !0 !== t.constructed)
        throw new Error("PKCS#12 SafeContents expected to be a SEQUENCE OF SafeBag."); for (var a = [], i = 0; i < t.value.length; i++) {
        var n = t.value[i], s = {}, o = [];
        if (!l.validate(n, y, s, o)) {
            var c = new Error("Cannot read SafeBag.");
            throw c.errors = o, c;
        }
        var p = { type: l.derToOid(s.bagId), attributes: u(s.bagAttributes) };
        a.push(p);
        var f, d, g = s.bagValue.value[0];
        switch (p.type) {
            case h.oids.pkcs8ShroudedKeyBag: if (null === (g = h.decryptPrivateKeyInfo(g, r)))
                throw new Error("Unable to decrypt PKCS#8 ShroudedKeyBag, wrong password?");
            case h.oids.keyBag:
                try {
                    p.key = h.privateKeyFromAsn1(g);
                }
                catch (t) {
                    p.key = null, p.asn1 = g;
                }
                continue;
            case h.oids.certBag:
                f = m, d = function () { if (l.derToOid(s.certId) !== h.oids.x509Certificate) {
                    var t = new Error("Unsupported certificate type, only X.509 supported.");
                    throw t.oid = l.derToOid(s.certId), t;
                } var r = l.fromDer(s.cert, e); try {
                    p.cert = h.certificateFromAsn1(r, !0);
                }
                catch (t) {
                    p.cert = null, p.asn1 = r;
                } };
                break;
            default:
                var c = new Error("Unsupported PKCS#12 SafeBag type.");
                throw c.oid = p.type, c;
        }
        if (void 0 !== f && !l.validate(g, f, s, o)) {
            var c = new Error("Cannot read PKCS#12 " + f.name);
            throw c.errors = o, c;
        }
        d();
    } return a; } function u(t) { var e = {}; if (void 0 !== t)
        for (var r = 0; r < t.length; ++r) {
            var a = {}, i = [];
            if (!l.validate(t[r], g, a, i)) {
                var n = new Error("Cannot read PKCS#12 BagAttribute.");
                throw n.errors = i, n;
            }
            var s = l.derToOid(a.oid);
            if (void 0 !== h.oids[s]) {
                e[h.oids[s]] = [];
                for (var o = 0; o < a.values.length; ++o)
                    e[h.oids[s]].push(a.values[o].value);
            }
        } return e; } var c = r(0); r(2), r(15), r(3), r(30), r(13), r(5), r(7), r(18), r(1), r(19); var l = c.asn1, h = c.pki, p = t.exports = c.pkcs12 = c.pkcs12 || {}, f = { name: "ContentInfo", tagClass: l.Class.UNIVERSAL, type: l.Type.SEQUENCE, constructed: !0, value: [{ name: "ContentInfo.contentType", tagClass: l.Class.UNIVERSAL, type: l.Type.OID, constructed: !1, capture: "contentType" }, { name: "ContentInfo.content", tagClass: l.Class.CONTEXT_SPECIFIC, constructed: !0, captureAsn1: "content" }] }, d = { name: "PFX", tagClass: l.Class.UNIVERSAL, type: l.Type.SEQUENCE, constructed: !0, value: [{ name: "PFX.version", tagClass: l.Class.UNIVERSAL, type: l.Type.INTEGER, constructed: !1, capture: "version" }, f, { name: "PFX.macData", tagClass: l.Class.UNIVERSAL, type: l.Type.SEQUENCE, constructed: !0, optional: !0, captureAsn1: "mac", value: [{ name: "PFX.macData.mac", tagClass: l.Class.UNIVERSAL, type: l.Type.SEQUENCE, constructed: !0, value: [{ name: "PFX.macData.mac.digestAlgorithm", tagClass: l.Class.UNIVERSAL, type: l.Type.SEQUENCE, constructed: !0, value: [{ name: "PFX.macData.mac.digestAlgorithm.algorithm", tagClass: l.Class.UNIVERSAL, type: l.Type.OID, constructed: !1, capture: "macAlgorithm" }, { name: "PFX.macData.mac.digestAlgorithm.parameters", tagClass: l.Class.UNIVERSAL, captureAsn1: "macAlgorithmParameters" }] }, { name: "PFX.macData.mac.digest", tagClass: l.Class.UNIVERSAL, type: l.Type.OCTETSTRING, constructed: !1, capture: "macDigest" }] }, { name: "PFX.macData.macSalt", tagClass: l.Class.UNIVERSAL, type: l.Type.OCTETSTRING, constructed: !1, capture: "macSalt" }, { name: "PFX.macData.iterations", tagClass: l.Class.UNIVERSAL, type: l.Type.INTEGER, constructed: !1, optional: !0, capture: "macIterations" }] }] }, y = { name: "SafeBag", tagClass: l.Class.UNIVERSAL, type: l.Type.SEQUENCE, constructed: !0, value: [{ name: "SafeBag.bagId", tagClass: l.Class.UNIVERSAL, type: l.Type.OID, constructed: !1, capture: "bagId" }, { name: "SafeBag.bagValue", tagClass: l.Class.CONTEXT_SPECIFIC, constructed: !0, captureAsn1: "bagValue" }, { name: "SafeBag.bagAttributes", tagClass: l.Class.UNIVERSAL, type: l.Type.SET, constructed: !0, optional: !0, capture: "bagAttributes" }] }, g = { name: "Attribute", tagClass: l.Class.UNIVERSAL, type: l.Type.SEQUENCE, constructed: !0, value: [{ name: "Attribute.attrId", tagClass: l.Class.UNIVERSAL, type: l.Type.OID, constructed: !1, capture: "oid" }, { name: "Attribute.attrValues", tagClass: l.Class.UNIVERSAL, type: l.Type.SET, constructed: !0, capture: "values" }] }, m = { name: "CertBag", tagClass: l.Class.UNIVERSAL, type: l.Type.SEQUENCE, constructed: !0, value: [{ name: "CertBag.certId", tagClass: l.Class.UNIVERSAL, type: l.Type.OID, constructed: !1, capture: "certId" }, { name: "CertBag.certValue", tagClass: l.Class.CONTEXT_SPECIFIC, constructed: !0, value: [{ name: "CertBag.certValue[0]", tagClass: l.Class.UNIVERSAL, type: l.Class.OCTETSTRING, constructed: !1, capture: "cert" }] }] }; p.pkcs12FromAsn1 = function (t, e, r) { "string" == typeof e ? (r = e, e = !0) : void 0 === e && (e = !0); var s = {}, o = []; if (!l.validate(t, d, s, o)) {
        var u = new Error("Cannot read PKCS#12 PFX. ASN.1 object is not an PKCS#12 PFX.");
        throw u.errors = u, u;
    } var f = { version: s.version.charCodeAt(0), safeContents: [], getBags: function (t) { var e, r = {}; return "localKeyId" in t ? e = t.localKeyId : "localKeyIdHex" in t && (e = c.util.hexToBytes(t.localKeyIdHex)), void 0 === e && !("friendlyName" in t) && "bagType" in t && (r[t.bagType] = a(f.safeContents, null, null, t.bagType)), void 0 !== e && (r.localKeyId = a(f.safeContents, "localKeyId", e, t.bagType)), "friendlyName" in t && (r.friendlyName = a(f.safeContents, "friendlyName", t.friendlyName, t.bagType)), r; }, getBagsByFriendlyName: function (t, e) { return a(f.safeContents, "friendlyName", t, e); }, getBagsByLocalKeyId: function (t, e) { return a(f.safeContents, "localKeyId", t, e); } }; if (3 !== s.version.charCodeAt(0)) {
        var u = new Error("PKCS#12 PFX of version other than 3 not supported.");
        throw u.version = s.version.charCodeAt(0), u;
    } if (l.derToOid(s.contentType) !== h.oids.data) {
        var u = new Error("Only PKCS#12 PFX in password integrity mode supported.");
        throw u.oid = l.derToOid(s.contentType), u;
    } var y = s.content.value[0]; if (y.tagClass !== l.Class.UNIVERSAL || y.type !== l.Type.OCTETSTRING)
        throw new Error("PKCS#12 authSafe content data is not an OCTET STRING."); if (y = i(y), s.mac) {
        var g = null, m = 0, v = l.derToOid(s.macAlgorithm);
        switch (v) {
            case h.oids.sha1:
                g = c.md.sha1.create(), m = 20;
                break;
            case h.oids.sha256:
                g = c.md.sha256.create(), m = 32;
                break;
            case h.oids.sha384:
                g = c.md.sha384.create(), m = 48;
                break;
            case h.oids.sha512:
                g = c.md.sha512.create(), m = 64;
                break;
            case h.oids.md5: g = c.md.md5.create(), m = 16;
        }
        if (null === g)
            throw new Error("PKCS#12 uses unsupported MAC algorithm: " + v);
        var C = new c.util.ByteBuffer(s.macSalt), E = "macIterations" in s ? parseInt(c.util.bytesToHex(s.macIterations), 16) : 1, S = p.generateKey(r, C, 3, E, m, g), T = c.hmac.create();
        T.start(g, S), T.update(y.value);
        if (T.getMac().getBytes() !== s.macDigest)
            throw new Error("PKCS#12 MAC could not be verified. Invalid password?");
    } return n(f, y.value, e, r), f; }, p.toPkcs12Asn1 = function (t, e, r, a) { a = a || {}, a.saltSize = a.saltSize || 8, a.count = a.count || 2048, a.algorithm = a.algorithm || a.encAlgorithm || "aes128", "useMac" in a || (a.useMac = !0), "localKeyId" in a || (a.localKeyId = null), "generateLocalKeyId" in a || (a.generateLocalKeyId = !0); var i, n = a.localKeyId; if (null !== n)
        n = c.util.hexToBytes(n);
    else if (a.generateLocalKeyId)
        if (e) {
            var s = c.util.isArray(e) ? e[0] : e;
            "string" == typeof s && (s = h.certificateFromPem(s));
            var o = c.md.sha1.create();
            o.update(l.toDer(h.certificateToAsn1(s)).getBytes()), n = o.digest().getBytes();
        }
        else
            n = c.random.getBytes(20); var u = []; null !== n && u.push(l.create(l.Class.UNIVERSAL, l.Type.SEQUENCE, !0, [l.create(l.Class.UNIVERSAL, l.Type.OID, !1, l.oidToDer(h.oids.localKeyId).getBytes()), l.create(l.Class.UNIVERSAL, l.Type.SET, !0, [l.create(l.Class.UNIVERSAL, l.Type.OCTETSTRING, !1, n)])])), "friendlyName" in a && u.push(l.create(l.Class.UNIVERSAL, l.Type.SEQUENCE, !0, [l.create(l.Class.UNIVERSAL, l.Type.OID, !1, l.oidToDer(h.oids.friendlyName).getBytes()), l.create(l.Class.UNIVERSAL, l.Type.SET, !0, [l.create(l.Class.UNIVERSAL, l.Type.BMPSTRING, !1, a.friendlyName)])])), u.length > 0 && (i = l.create(l.Class.UNIVERSAL, l.Type.SET, !0, u)); var f = [], d = []; null !== e && (d = c.util.isArray(e) ? e : [e]); for (var y = [], g = 0; g < d.length; ++g) {
        e = d[g], "string" == typeof e && (e = h.certificateFromPem(e));
        var m = 0 === g ? i : void 0, v = h.certificateToAsn1(e), C = l.create(l.Class.UNIVERSAL, l.Type.SEQUENCE, !0, [l.create(l.Class.UNIVERSAL, l.Type.OID, !1, l.oidToDer(h.oids.certBag).getBytes()), l.create(l.Class.CONTEXT_SPECIFIC, 0, !0, [l.create(l.Class.UNIVERSAL, l.Type.SEQUENCE, !0, [l.create(l.Class.UNIVERSAL, l.Type.OID, !1, l.oidToDer(h.oids.x509Certificate).getBytes()), l.create(l.Class.CONTEXT_SPECIFIC, 0, !0, [l.create(l.Class.UNIVERSAL, l.Type.OCTETSTRING, !1, l.toDer(v).getBytes())])])]), m]);
        y.push(C);
    } if (y.length > 0) {
        var E = l.create(l.Class.UNIVERSAL, l.Type.SEQUENCE, !0, y), S = l.create(l.Class.UNIVERSAL, l.Type.SEQUENCE, !0, [l.create(l.Class.UNIVERSAL, l.Type.OID, !1, l.oidToDer(h.oids.data).getBytes()), l.create(l.Class.CONTEXT_SPECIFIC, 0, !0, [l.create(l.Class.UNIVERSAL, l.Type.OCTETSTRING, !1, l.toDer(E).getBytes())])]);
        f.push(S);
    } var T = null; if (null !== t) {
        var I = h.wrapRsaPrivateKey(h.privateKeyToAsn1(t));
        T = null === r ? l.create(l.Class.UNIVERSAL, l.Type.SEQUENCE, !0, [l.create(l.Class.UNIVERSAL, l.Type.OID, !1, l.oidToDer(h.oids.keyBag).getBytes()), l.create(l.Class.CONTEXT_SPECIFIC, 0, !0, [I]), i]) : l.create(l.Class.UNIVERSAL, l.Type.SEQUENCE, !0, [l.create(l.Class.UNIVERSAL, l.Type.OID, !1, l.oidToDer(h.oids.pkcs8ShroudedKeyBag).getBytes()), l.create(l.Class.CONTEXT_SPECIFIC, 0, !0, [h.encryptPrivateKeyInfo(I, r, a)]), i]);
        var b = l.create(l.Class.UNIVERSAL, l.Type.SEQUENCE, !0, [T]), A = l.create(l.Class.UNIVERSAL, l.Type.SEQUENCE, !0, [l.create(l.Class.UNIVERSAL, l.Type.OID, !1, l.oidToDer(h.oids.data).getBytes()), l.create(l.Class.CONTEXT_SPECIFIC, 0, !0, [l.create(l.Class.UNIVERSAL, l.Type.OCTETSTRING, !1, l.toDer(b).getBytes())])]);
        f.push(A);
    } var B, N = l.create(l.Class.UNIVERSAL, l.Type.SEQUENCE, !0, f); if (a.useMac) {
        var o = c.md.sha1.create(), R = new c.util.ByteBuffer(c.random.getBytes(a.saltSize)), w = a.count, t = p.generateKey(r, R, 3, w, 20), U = c.hmac.create();
        U.start(o, t), U.update(l.toDer(N).getBytes());
        var L = U.getMac();
        B = l.create(l.Class.UNIVERSAL, l.Type.SEQUENCE, !0, [l.create(l.Class.UNIVERSAL, l.Type.SEQUENCE, !0, [l.create(l.Class.UNIVERSAL, l.Type.SEQUENCE, !0, [l.create(l.Class.UNIVERSAL, l.Type.OID, !1, l.oidToDer(h.oids.sha1).getBytes()), l.create(l.Class.UNIVERSAL, l.Type.NULL, !1, "")]), l.create(l.Class.UNIVERSAL, l.Type.OCTETSTRING, !1, L.getBytes())]), l.create(l.Class.UNIVERSAL, l.Type.OCTETSTRING, !1, R.getBytes()), l.create(l.Class.UNIVERSAL, l.Type.INTEGER, !1, l.integerToDer(w).getBytes())]);
    } return l.create(l.Class.UNIVERSAL, l.Type.SEQUENCE, !0, [l.create(l.Class.UNIVERSAL, l.Type.INTEGER, !1, l.integerToDer(3).getBytes()), l.create(l.Class.UNIVERSAL, l.Type.SEQUENCE, !0, [l.create(l.Class.UNIVERSAL, l.Type.OID, !1, l.oidToDer(h.oids.data).getBytes()), l.create(l.Class.CONTEXT_SPECIFIC, 0, !0, [l.create(l.Class.UNIVERSAL, l.Type.OCTETSTRING, !1, l.toDer(N).getBytes())])]), B]); }, p.generateKey = c.pbe.generatePkcs12Key; }, function (t, e, r) { var a = r(0); r(2), r(1); var i = a.asn1, n = t.exports = a.pkcs7asn1 = a.pkcs7asn1 || {}; a.pkcs7 = a.pkcs7 || {}, a.pkcs7.asn1 = n; var s = { name: "ContentInfo", tagClass: i.Class.UNIVERSAL, type: i.Type.SEQUENCE, constructed: !0, value: [{ name: "ContentInfo.ContentType", tagClass: i.Class.UNIVERSAL, type: i.Type.OID, constructed: !1, capture: "contentType" }, { name: "ContentInfo.content", tagClass: i.Class.CONTEXT_SPECIFIC, type: 0, constructed: !0, optional: !0, captureAsn1: "content" }] }; n.contentInfoValidator = s; var o = { name: "EncryptedContentInfo", tagClass: i.Class.UNIVERSAL, type: i.Type.SEQUENCE, constructed: !0, value: [{ name: "EncryptedContentInfo.contentType", tagClass: i.Class.UNIVERSAL, type: i.Type.OID, constructed: !1, capture: "contentType" }, { name: "EncryptedContentInfo.contentEncryptionAlgorithm", tagClass: i.Class.UNIVERSAL, type: i.Type.SEQUENCE, constructed: !0, value: [{ name: "EncryptedContentInfo.contentEncryptionAlgorithm.algorithm", tagClass: i.Class.UNIVERSAL, type: i.Type.OID, constructed: !1, capture: "encAlgorithm" }, { name: "EncryptedContentInfo.contentEncryptionAlgorithm.parameter", tagClass: i.Class.UNIVERSAL, captureAsn1: "encParameter" }] }, { name: "EncryptedContentInfo.encryptedContent", tagClass: i.Class.CONTEXT_SPECIFIC, type: 0, capture: "encryptedContent", captureAsn1: "encryptedContentAsn1" }] }; n.envelopedDataValidator = { name: "EnvelopedData", tagClass: i.Class.UNIVERSAL, type: i.Type.SEQUENCE, constructed: !0, value: [{ name: "EnvelopedData.Version", tagClass: i.Class.UNIVERSAL, type: i.Type.INTEGER, constructed: !1, capture: "version" }, { name: "EnvelopedData.RecipientInfos", tagClass: i.Class.UNIVERSAL, type: i.Type.SET, constructed: !0, captureAsn1: "recipientInfos" }].concat(o) }, n.encryptedDataValidator = { name: "EncryptedData", tagClass: i.Class.UNIVERSAL, type: i.Type.SEQUENCE, constructed: !0, value: [{ name: "EncryptedData.Version", tagClass: i.Class.UNIVERSAL, type: i.Type.INTEGER, constructed: !1, capture: "version" }].concat(o) }; var u = { name: "SignerInfo", tagClass: i.Class.UNIVERSAL, type: i.Type.SEQUENCE, constructed: !0, value: [{ name: "SignerInfo.version", tagClass: i.Class.UNIVERSAL, type: i.Type.INTEGER, constructed: !1 }, { name: "SignerInfo.issuerAndSerialNumber", tagClass: i.Class.UNIVERSAL, type: i.Type.SEQUENCE, constructed: !0, value: [{ name: "SignerInfo.issuerAndSerialNumber.issuer", tagClass: i.Class.UNIVERSAL, type: i.Type.SEQUENCE, constructed: !0, captureAsn1: "issuer" }, { name: "SignerInfo.issuerAndSerialNumber.serialNumber", tagClass: i.Class.UNIVERSAL, type: i.Type.INTEGER, constructed: !1, capture: "serial" }] }, { name: "SignerInfo.digestAlgorithm", tagClass: i.Class.UNIVERSAL, type: i.Type.SEQUENCE, constructed: !0, value: [{ name: "SignerInfo.digestAlgorithm.algorithm", tagClass: i.Class.UNIVERSAL, type: i.Type.OID, constructed: !1, capture: "digestAlgorithm" }, { name: "SignerInfo.digestAlgorithm.parameter", tagClass: i.Class.UNIVERSAL, constructed: !1, captureAsn1: "digestParameter", optional: !0 }] }, { name: "SignerInfo.authenticatedAttributes", tagClass: i.Class.CONTEXT_SPECIFIC, type: 0, constructed: !0, optional: !0, capture: "authenticatedAttributes" }, { name: "SignerInfo.digestEncryptionAlgorithm", tagClass: i.Class.UNIVERSAL, type: i.Type.SEQUENCE, constructed: !0, capture: "signatureAlgorithm" }, { name: "SignerInfo.encryptedDigest", tagClass: i.Class.UNIVERSAL, type: i.Type.OCTETSTRING, constructed: !1, capture: "signature" }, { name: "SignerInfo.unauthenticatedAttributes", tagClass: i.Class.CONTEXT_SPECIFIC, type: 1, constructed: !0, optional: !0, capture: "unauthenticatedAttributes" }] }; n.signedDataValidator = { name: "SignedData", tagClass: i.Class.UNIVERSAL, type: i.Type.SEQUENCE, constructed: !0, value: [{ name: "SignedData.Version", tagClass: i.Class.UNIVERSAL, type: i.Type.INTEGER, constructed: !1, capture: "version" }, { name: "SignedData.DigestAlgorithms", tagClass: i.Class.UNIVERSAL, type: i.Type.SET, constructed: !0, captureAsn1: "digestAlgorithms" }, s, { name: "SignedData.Certificates", tagClass: i.Class.CONTEXT_SPECIFIC, type: 0, optional: !0, captureAsn1: "certificates" }, { name: "SignedData.CertificateRevocationLists", tagClass: i.Class.CONTEXT_SPECIFIC, type: 1, optional: !0, captureAsn1: "crls" }, { name: "SignedData.SignerInfos", tagClass: i.Class.UNIVERSAL, type: i.Type.SET, capture: "signerInfos", optional: !0, value: [u] }] }, n.recipientInfoValidator = { name: "RecipientInfo", tagClass: i.Class.UNIVERSAL, type: i.Type.SEQUENCE, constructed: !0, value: [{ name: "RecipientInfo.version", tagClass: i.Class.UNIVERSAL, type: i.Type.INTEGER, constructed: !1, capture: "version" }, { name: "RecipientInfo.issuerAndSerial", tagClass: i.Class.UNIVERSAL, type: i.Type.SEQUENCE, constructed: !0, value: [{ name: "RecipientInfo.issuerAndSerial.issuer", tagClass: i.Class.UNIVERSAL, type: i.Type.SEQUENCE, constructed: !0, captureAsn1: "issuer" }, { name: "RecipientInfo.issuerAndSerial.serialNumber", tagClass: i.Class.UNIVERSAL, type: i.Type.INTEGER, constructed: !1, capture: "serial" }] }, { name: "RecipientInfo.keyEncryptionAlgorithm", tagClass: i.Class.UNIVERSAL, type: i.Type.SEQUENCE, constructed: !0, value: [{ name: "RecipientInfo.keyEncryptionAlgorithm.algorithm", tagClass: i.Class.UNIVERSAL, type: i.Type.OID, constructed: !1, capture: "encAlgorithm" }, { name: "RecipientInfo.keyEncryptionAlgorithm.parameter", tagClass: i.Class.UNIVERSAL, constructed: !1, captureAsn1: "encParameter" }] }, { name: "RecipientInfo.encryptedKey", tagClass: i.Class.UNIVERSAL, type: i.Type.OCTETSTRING, constructed: !1, capture: "encKey" }] }; }, function (t, e, r) { var a = r(0); r(32), t.exports = a.mgf = a.mgf || {}, a.mgf.mgf1 = a.mgf1; }, function (t, e, r) { var a = r(0); r(1), a.mgf = a.mgf || {}, (t.exports = a.mgf.mgf1 = a.mgf1 = a.mgf1 || {}).create = function (t) { return { generate: function (e, r) { for (var i = new a.util.ByteBuffer, n = Math.ceil(r / t.digestLength), s = 0; s < n; s++) {
            var o = new a.util.ByteBuffer;
            o.putInt32(s), t.start(), t.update(e + o.getBytes()), i.putBuffer(t.digest());
        } return i.truncate(i.length() - r), i.getBytes(); } }; }; }]); });

}).call(this,require('_process'),require("buffer").Buffer,require("timers").setImmediate)
},{"_process":18,"buffer":16,"timers":23}],5:[function(require,module,exports){
"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.SRP = {
    '1024': {
        g: 2,
        N: `EEAF0AB9 ADB38DD6 9C33F80A FA8FC5E8 60726187 75FF3C0B 9EA2314C 9C256576
 D674DF74 96EA81D3 383B4813 D692C6E0 E0D5D8E2 50B98BE4 8E495C1D 6089DAD1 5DC7D7B4
 6154D6B6 CE8EF4AD 69B15D49 82559B29 7BCF1885 C529F566 660E57EC 68EDBC3C 05726CC0
 2FD4CBF4 976EAA9A FD5138FE 8376435B 9FC61D2F C0EB06E3`
    },
    '1536': {
        g: 2,
        N: `9DEF3CAF B939277A B1F12A86 17A47BBB DBA51DF4 99AC4C80 BEEEA961 4B19CC4D
 5F4F5F55 6E27CBDE 51C6A94B E4607A29 1558903B A0D0F843 80B655BB 9A22E8DC DF028A7C
 EC67F0D0 8134B1C8 B9798914 9B609E0B E3BAB63D 47548381 DBC5B1FC 764E3F4B 53DD9DA1
 158BFD3E 2B9C8CF5 6EDF0195 39349627 DB2FD53D 24B7C486 65772E43 7D6C7F8C E442734A
 F7CCB7AE 837C264A E3A9BEB8 7F8A2FE9 B8B5292E 5A021FFF 5E91479E 8CE7A28C 2442C6F3
 15180F93 499A234D CF76E3FE D135F9BB`
    },
    '2048': {
        g: 2,
        N: `AC6BDB41 324A9A9B F166DE5E 1389582F AF72B665 1987EE07 FC319294 3DB56050
 A37329CB B4A099ED 8193E075 7767A13D D52312AB 4B03310D CD7F48A9 DA04FD50 E8083969
 EDB767B0 CF609517 9A163AB3 661A05FB D5FAAAE8 2918A996 2F0B93B8 55F97993 EC975EEA
 A80D740A DBF4FF74 7359D041 D5C33EA7 1D281E44 6B14773B CA97B43A 23FB8016 76BD207A
 436C6481 F1D2B907 8717461A 5B9D32E6 88F87748 544523B5 24B0D57D 5EA77A27 75D2ECFA
 032CFBDB F52FB378 61602790 04E57AE6 AF874E73 03CE5329 9CCC041C 7BC308D8 2A5698F3
 A8D0C382 71AE35F8 E9DBFBB6 94B5C803 D89F7AE4 35DE236D 525F5475 9B65E372 FCD68EF2
 0FA7111F 9E4AFF73`
    },
    '3072': {
        g: 5,
        N: `FFFFFFFF FFFFFFFF C90FDAA2 2168C234 C4C6628B 80DC1CD1 29024E08 8A67CC74
 020BBEA6 3B139B22 514A0879 8E3404DD EF9519B3 CD3A431B 302B0A6D F25F1437 4FE1356D
 6D51C245 E485B576 625E7EC6 F44C42E9 A637ED6B 0BFF5CB6 F406B7ED EE386BFB 5A899FA5
 AE9F2411 7C4B1FE6 49286651 ECE45B3D C2007CB8 A163BF05 98DA4836 1C55D39A 69163FA8
 FD24CF5F 83655D23 DCA3AD96 1C62F356 208552BB 9ED52907 7096966D 670C354E 4ABC9804
 F1746C08 CA18217C 32905E46 2E36CE3B E39E772C 180E8603 9B2783A2 EC07A28F B5C55DF0
 6F4C52C9 DE2BCBF6 95581718 3995497C EA956AE5 15D22618 98FA0510 15728E5A 8AAAC42D
 AD33170D 04507A33 A85521AB DF1CBA64 ECFB8504 58DBEF0A 8AEA7157 5D060C7D B3970F85
 A6E1E4C7 ABF5AE8C DB0933D7 1E8C94E0 4A25619D CEE3D226 1AD2EE6B F12FFA06 D98A0864
 D8760273 3EC86A64 521F2B18 177B200C BBE11757 7A615D6C 770988C0 BAD946E2 08E24FA0
 74E5AB31 43DB5BFC E0FD108E 4B82D120 A93AD2CA FFFFFFFF FFFFFFFF`
    },
    '4096': {
        g: 5,
        N: `FFFFFFFF FFFFFFFF C90FDAA2 2168C234 C4C6628B 80DC1CD1 29024E08 8A67CC74
 020BBEA6 3B139B22 514A0879 8E3404DD EF9519B3 CD3A431B 302B0A6D F25F1437 4FE1356D
 6D51C245 E485B576 625E7EC6 F44C42E9 A637ED6B 0BFF5CB6 F406B7ED EE386BFB 5A899FA5
 AE9F2411 7C4B1FE6 49286651 ECE45B3D C2007CB8 A163BF05 98DA4836 1C55D39A 69163FA8
 FD24CF5F 83655D23 DCA3AD96 1C62F356 208552BB 9ED52907 7096966D 670C354E 4ABC9804
 F1746C08 CA18217C 32905E46 2E36CE3B E39E772C 180E8603 9B2783A2 EC07A28F B5C55DF0
 6F4C52C9 DE2BCBF6 95581718 3995497C EA956AE5 15D22618 98FA0510 15728E5A 8AAAC42D
 AD33170D 04507A33 A85521AB DF1CBA64 ECFB8504 58DBEF0A 8AEA7157 5D060C7D B3970F85
 A6E1E4C7 ABF5AE8C DB0933D7 1E8C94E0 4A25619D CEE3D226 1AD2EE6B F12FFA06 D98A0864
 D8760273 3EC86A64 521F2B18 177B200C BBE11757 7A615D6C 770988C0 BAD946E2 08E24FA0
 74E5AB31 43DB5BFC E0FD108E 4B82D120 A9210801 1A723C12 A787E6D7 88719A10 BDBA5B26
 99C32718 6AF4E23C 1A946834 B6150BDA 2583E9CA 2AD44CE8 DBBBC2DB 04DE8EF9 2E8EFC14
 1FBECAA6 287C5947 4E6BC05D 99B2964F A090C3A2 233BA186 515BE7ED 1F612970 CEE2D7AF
 B81BDD76 2170481C D0069127 D5B05AA9 93B4EA98 8D8FDDC1 86FFB7DC 90A6C08F 4DF435C9
 34063199 FFFFFFFF FFFFFFFF`
    }
};

},{}],6:[function(require,module,exports){
"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
class bitArray {
    static concat(a1, a2) {
        if (a1.length === 0 || a2.length === 0) {
            return a1.concat(a2);
        }
        var last = a1[a1.length - 1], shift = bitArray.getPartial(last);
        if (shift === 32) {
            return a1.concat(a2);
        }
        else {
            return bitArray._shiftRight(a2, shift, last | 0, a1.slice(0, a1.length - 1));
        }
    }
    static bitLength(a) {
        var l = a.length, x;
        if (l === 0) {
            return 0;
        }
        x = a[l - 1];
        return (l - 1) * 32 + bitArray.getPartial(x);
    }
    static clamp(a, len) {
        if (a.length * 32 < len) {
            return a;
        }
        a = a.slice(0, Math.ceil(len / 32));
        var l = a.length;
        len = len & 31;
        if (l > 0 && len) {
            a[l - 1] = bitArray.partial(len, a[l - 1] & 0x80000000 >> (len - 1), 1);
        }
        return a;
    }
    static partial(len, x, _end = 0) {
        if (len === 32) {
            return x;
        }
        return (_end ? x | 0 : x << (32 - len)) + len * 0x10000000000;
    }
    static getPartial(x) {
        return Math.round(x / 0x10000000000) || 32;
    }
    static equal(a, b) {
        if (bitArray.bitLength(a) !== bitArray.bitLength(b)) {
            return false;
        }
        var x = 0, i;
        for (i = 0; i < a.length; i++) {
            x |= a[i] ^ b[i];
        }
        return (x === 0);
    }
    static _shiftRight(a, shift, carry, out) {
        var i, last2 = 0, shift2;
        if (out === undefined) {
            out = [];
        }
        for (; shift >= 32; shift -= 32) {
            out.push(carry);
            carry = 0;
        }
        if (shift === 0) {
            return out.concat(a);
        }
        for (i = 0; i < a.length; i++) {
            out.push(carry | a[i] >>> shift);
            carry = a[i] << (32 - shift);
        }
        last2 = a.length ? a[a.length - 1] : 0;
        shift2 = bitArray.getPartial(last2);
        const p2 = (shift + shift2 > 32) ? carry : out.pop();
        out.push(bitArray.partial(shift + shift2 & 31, p2, 1));
        return out;
    }
}
exports.bitArray = bitArray;
class codecHex {
    static fromBits(arr) {
        var out = "", i;
        for (i = 0; i < arr.length; i++) {
            out += ((arr[i] | 0) + 0xF00000000000).toString(16).substr(4);
        }
        return out.substr(0, bitArray.bitLength(arr) / 4);
    }
    static toBits(str) {
        var i, out = [], len;
        str = str.replace(/\s|0x/g, "");
        len = str.length;
        str = str + "00000000";
        for (i = 0; i < str.length; i += 8) {
            out.push(parseInt(str.substr(i, 8), 16) ^ 0);
        }
        return bitArray.clamp(out, len * 4);
    }
}
exports.codecHex = codecHex;
class codecUtf8String {
    static fromBits(arr) {
        var out = "", bl = bitArray.bitLength(arr), i, tmp;
        for (i = 0; i < bl / 8; i++) {
            if ((i & 3) === 0) {
                tmp = arr[i / 4];
            }
            out += String.fromCharCode(tmp >>> 24);
            tmp <<= 8;
        }
        return decodeURIComponent(escape(out));
    }
    static toBits(str) {
        str = unescape(encodeURIComponent(str));
        var out = [], i, tmp = 0;
        for (i = 0; i < str.length; i++) {
            tmp = tmp << 8 | str.charCodeAt(i);
            if ((i & 3) === 3) {
                out.push(tmp);
                tmp = 0;
            }
        }
        if (i & 3) {
            out.push(bitArray.partial(8 * (i & 3), tmp));
        }
        return out;
    }
}
exports.codecUtf8String = codecUtf8String;
class SHA512 {
    constructor(hash = null) {
        this.blockSize = 1024;
        this._init = [];
        this._initr = [0xbcc908, 0xcaa73b, 0x94f82b, 0x1d36f1, 0xe682d1, 0x3e6c1f, 0x41bd6b, 0x7e2179];
        this._key = [];
        this._keyr = [0x28ae22, 0xef65cd, 0x4d3b2f, 0x89dbbc, 0x48b538, 0x05d019, 0x194f9b, 0x6d8118,
            0x030242, 0x706fbe, 0xe4b28c, 0xffb4e2, 0x7b896f, 0x1696b1, 0xc71235, 0x692694,
            0xf14ad2, 0x4f25e3, 0x8cd5b5, 0xac9c65, 0x2b0275, 0xa6e483, 0x41fbd4, 0x1153b5,
            0x66dfab, 0xb43210, 0xfb213f, 0xef0ee4, 0xa88fc2, 0x0aa725, 0x03826f, 0x0e6e70,
            0xd22ffc, 0x26c926, 0xc42aed, 0x95b3df, 0xaf63de, 0x77b2a8, 0xedaee6, 0x82353b,
            0xf10364, 0x423001, 0xf89791, 0x54be30, 0xef5218, 0x65a910, 0x71202a, 0xbbd1b8,
            0xd2d0c8, 0x41ab53, 0x8eeb99, 0x9b48a8, 0xc95a63, 0x418acb, 0x63e373, 0xb2b8a3,
            0xefb2fc, 0x172f60, 0xf0ab72, 0x6439ec, 0x631e28, 0x82bde9, 0xc67915, 0x72532b,
            0x26619c, 0xc0c207, 0xe0eb1e, 0x6ed178, 0x176fba, 0xc898a6, 0xf90dae, 0x1c471b,
            0x047d84, 0xc72493, 0xc9bebc, 0x100d4c, 0x3e42b6, 0x657e2a, 0xd6faec, 0x475817];
        if (!this._key[0]) {
            this._precompute();
        }
        if (hash) {
            this._h = hash._h.slice(0);
            this._buffer = hash._buffer.slice(0);
            this._length = hash._length;
        }
        else {
            this.reset();
        }
    }
    static hash(data) {
        return (new SHA512()).update(data).finalize();
    }
    reset() {
        this._h = this._init.slice(0);
        this._buffer = [];
        this._length = 0;
        return this;
    }
    update(data) {
        if (typeof data === "string") {
            data = codecUtf8String.toBits(data);
        }
        var i, b = this._buffer = bitArray.concat(this._buffer, data), ol = this._length, nl = this._length = ol + bitArray.bitLength(data);
        if (nl > 9007199254740991) {
            throw new Error("Cannot hash more than 2^53 - 1 bits");
        }
        if (typeof Uint32Array !== 'undefined') {
            var c = new Uint32Array(b);
            var j = 0;
            for (i = 1024 + ol - ((1024 + ol) & 1023); i <= nl; i += 1024) {
                this._block(c.subarray(32 * j, 32 * (j + 1)));
                j += 1;
            }
            b.splice(0, 32 * j);
        }
        else {
            for (i = 1024 + ol - ((1024 + ol) & 1023); i <= nl; i += 1024) {
                this._block(b.splice(0, 32));
            }
        }
        return this;
    }
    finalize() {
        var i, b = this._buffer, h = this._h;
        b = bitArray.concat(b, [bitArray.partial(1, 1)]);
        for (i = b.length + 4; i & 31; i++) {
            b.push(0);
        }
        b.push(0);
        b.push(0);
        b.push(Math.floor(this._length / 0x100000000));
        b.push(this._length | 0);
        while (b.length) {
            this._block(b.splice(0, 32));
        }
        this.reset();
        return h;
    }
    _precompute() {
        var i = 0, prime = 2, factor, isPrime;
        function frac(x) { return (x - Math.floor(x)) * 0x100000000 | 0; }
        function frac2(x) { return (x - Math.floor(x)) * 0x10000000000 & 0xff; }
        for (; i < 80; prime++) {
            isPrime = true;
            for (factor = 2; factor * factor <= prime; factor++) {
                if (prime % factor === 0) {
                    isPrime = false;
                    break;
                }
            }
            if (isPrime) {
                if (i < 8) {
                    this._init[i * 2] = frac(Math.pow(prime, 1 / 2));
                    this._init[i * 2 + 1] = (frac2(Math.pow(prime, 1 / 2)) << 24) | this._initr[i];
                }
                this._key[i * 2] = frac(Math.pow(prime, 1 / 3));
                this._key[i * 2 + 1] = (frac2(Math.pow(prime, 1 / 3)) << 24) | this._keyr[i];
                i++;
            }
        }
    }
    _block(words) {
        var i, wrh, wrl, h = this._h, k = this._key, h0h = h[0], h0l = h[1], h1h = h[2], h1l = h[3], h2h = h[4], h2l = h[5], h3h = h[6], h3l = h[7], h4h = h[8], h4l = h[9], h5h = h[10], h5l = h[11], h6h = h[12], h6l = h[13], h7h = h[14], h7l = h[15];
        var w;
        if (typeof Uint32Array !== 'undefined') {
            w = Array(160);
            for (var j = 0; j < 32; j++) {
                w[j] = words[j];
            }
        }
        else {
            w = words;
        }
        var ah = h0h, al = h0l, bh = h1h, bl = h1l, ch = h2h, cl = h2l, dh = h3h, dl = h3l, eh = h4h, el = h4l, fh = h5h, fl = h5l, gh = h6h, gl = h6l, hh = h7h, hl = h7l;
        for (i = 0; i < 80; i++) {
            if (i < 16) {
                wrh = w[i * 2];
                wrl = w[i * 2 + 1];
            }
            else {
                var gamma0xh = w[(i - 15) * 2];
                var gamma0xl = w[(i - 15) * 2 + 1];
                var gamma0h = ((gamma0xl << 31) | (gamma0xh >>> 1)) ^
                    ((gamma0xl << 24) | (gamma0xh >>> 8)) ^
                    (gamma0xh >>> 7);
                var gamma0l = ((gamma0xh << 31) | (gamma0xl >>> 1)) ^
                    ((gamma0xh << 24) | (gamma0xl >>> 8)) ^
                    ((gamma0xh << 25) | (gamma0xl >>> 7));
                var gamma1xh = w[(i - 2) * 2];
                var gamma1xl = w[(i - 2) * 2 + 1];
                var gamma1h = ((gamma1xl << 13) | (gamma1xh >>> 19)) ^
                    ((gamma1xh << 3) | (gamma1xl >>> 29)) ^
                    (gamma1xh >>> 6);
                var gamma1l = ((gamma1xh << 13) | (gamma1xl >>> 19)) ^
                    ((gamma1xl << 3) | (gamma1xh >>> 29)) ^
                    ((gamma1xh << 26) | (gamma1xl >>> 6));
                var wr7h = w[(i - 7) * 2];
                var wr7l = w[(i - 7) * 2 + 1];
                var wr16h = w[(i - 16) * 2];
                var wr16l = w[(i - 16) * 2 + 1];
                wrl = gamma0l + wr7l;
                wrh = gamma0h + wr7h + ((wrl >>> 0) < (gamma0l >>> 0) ? 1 : 0);
                wrl += gamma1l;
                wrh += gamma1h + ((wrl >>> 0) < (gamma1l >>> 0) ? 1 : 0);
                wrl += wr16l;
                wrh += wr16h + ((wrl >>> 0) < (wr16l >>> 0) ? 1 : 0);
            }
            w[i * 2] = wrh |= 0;
            w[i * 2 + 1] = wrl |= 0;
            var chh = (eh & fh) ^ (~eh & gh);
            var chl = (el & fl) ^ (~el & gl);
            var majh = (ah & bh) ^ (ah & ch) ^ (bh & ch);
            var majl = (al & bl) ^ (al & cl) ^ (bl & cl);
            var sigma0h = ((al << 4) | (ah >>> 28)) ^ ((ah << 30) | (al >>> 2)) ^ ((ah << 25) | (al >>> 7));
            var sigma0l = ((ah << 4) | (al >>> 28)) ^ ((al << 30) | (ah >>> 2)) ^ ((al << 25) | (ah >>> 7));
            var sigma1h = ((el << 18) | (eh >>> 14)) ^ ((el << 14) | (eh >>> 18)) ^ ((eh << 23) | (el >>> 9));
            var sigma1l = ((eh << 18) | (el >>> 14)) ^ ((eh << 14) | (el >>> 18)) ^ ((el << 23) | (eh >>> 9));
            var krh = k[i * 2];
            var krl = k[i * 2 + 1];
            var t1l = hl + sigma1l;
            var t1h = hh + sigma1h + ((t1l >>> 0) < (hl >>> 0) ? 1 : 0);
            t1l += chl;
            t1h += chh + ((t1l >>> 0) < (chl >>> 0) ? 1 : 0);
            t1l += krl;
            t1h += krh + ((t1l >>> 0) < (krl >>> 0) ? 1 : 0);
            t1l = t1l + wrl | 0;
            t1h += wrh + ((t1l >>> 0) < (wrl >>> 0) ? 1 : 0);
            var t2l = sigma0l + majl;
            var t2h = sigma0h + majh + ((t2l >>> 0) < (sigma0l >>> 0) ? 1 : 0);
            hh = gh;
            hl = gl;
            gh = fh;
            gl = fl;
            fh = eh;
            fl = el;
            el = (dl + t1l) | 0;
            eh = (dh + t1h + ((el >>> 0) < (dl >>> 0) ? 1 : 0)) | 0;
            dh = ch;
            dl = cl;
            ch = bh;
            cl = bl;
            bh = ah;
            bl = al;
            al = (t1l + t2l) | 0;
            ah = (t1h + t2h + ((al >>> 0) < (t1l >>> 0) ? 1 : 0)) | 0;
        }
        h0l = h[1] = (h0l + al) | 0;
        h[0] = (h0h + ah + ((h0l >>> 0) < (al >>> 0) ? 1 : 0)) | 0;
        h1l = h[3] = (h1l + bl) | 0;
        h[2] = (h1h + bh + ((h1l >>> 0) < (bl >>> 0) ? 1 : 0)) | 0;
        h2l = h[5] = (h2l + cl) | 0;
        h[4] = (h2h + ch + ((h2l >>> 0) < (cl >>> 0) ? 1 : 0)) | 0;
        h3l = h[7] = (h3l + dl) | 0;
        h[6] = (h3h + dh + ((h3l >>> 0) < (dl >>> 0) ? 1 : 0)) | 0;
        h4l = h[9] = (h4l + el) | 0;
        h[8] = (h4h + eh + ((h4l >>> 0) < (el >>> 0) ? 1 : 0)) | 0;
        h5l = h[11] = (h5l + fl) | 0;
        h[10] = (h5h + fh + ((h5l >>> 0) < (fl >>> 0) ? 1 : 0)) | 0;
        h6l = h[13] = (h6l + gl) | 0;
        h[12] = (h6h + gh + ((h6l >>> 0) < (gl >>> 0) ? 1 : 0)) | 0;
        h7l = h[15] = (h7l + hl) | 0;
        h[14] = (h7h + hh + ((h7l >>> 0) < (hl >>> 0) ? 1 : 0)) | 0;
    }
}
exports.SHA512 = SHA512;

},{}],7:[function(require,module,exports){
"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
function isIdentical(a, b) {
    return (a === b ||
        (a !== a && b !== b));
}
exports.isIdentical = isIdentical;

},{}],8:[function(require,module,exports){
"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
function parseQueryString(input) {
    const query = {};
    const splits = input.split('&');
    for (let i = 0; i < splits.length; i++) {
        const entry = splits[i];
        const indexOfFirstEquals = entry.indexOf('=');
        let key;
        let value = '';
        if (indexOfFirstEquals >= 0) {
            key = entry.slice(0, indexOfFirstEquals);
            value = entry.slice(indexOfFirstEquals + 1);
        }
        else {
            key = entry;
        }
        key = key ? decodeURIComponent(key) : '';
        value = value ? decodeURIComponent(value) : '';
        if (key in query) {
            query[key].push(value);
        }
        else {
            query[key] = [value];
        }
    }
    return query;
}
class UrlSearchParams {
    constructor(input) {
        let list = {};
        if (input instanceof UrlSearchParams) {
            list = JSON.parse(JSON.stringify(input._list));
        }
        else if (typeof input === 'object') {
            list = {};
            for (const key in input) {
                const value = input[key];
                if (Array.isArray(value)) {
                    list[key] = value.length ? value.slice() : [''];
                }
                else if (value == null) {
                    list[key] = [''];
                }
                else {
                    list[key] = [value];
                }
            }
        }
        else if (typeof input === 'string') {
            list = parseQueryString(input);
        }
        this._list = list;
    }
    append(key, value) {
        if (!this.has(key)) {
            this.set(key, value);
        }
        else {
            const values = this._list[key];
            if (values) {
                values.push(value);
            }
        }
    }
    delete(key) {
        this._list[key] = undefined;
    }
    get(key) {
        if (!this.has(key)) {
            return undefined;
        }
        const value = this._list[key];
        return value ? value[0] : undefined;
    }
    getAll(key) {
        if (!this.has(key)) {
            return undefined;
        }
        return this._list[key];
    }
    has(key) {
        return Array.isArray(this._list[key]);
    }
    keys() {
        const keys = [];
        for (const key in this._list) {
            if (this.has(key)) {
                keys.push(key);
            }
        }
        return keys;
    }
    set(key, value) {
        this._list[key] = [value];
    }
    toString() {
        const query = [];
        for (const key in this._list) {
            if (!this.has(key)) {
                continue;
            }
            const values = this._list[key];
            if (values) {
                const encodedKey = encodeURIComponent(key);
                for (let i = 0; i < values.length; i++) {
                    query.push(encodedKey + (values[i] ? '=' + encodeURIComponent(values[i]) : ''));
                }
            }
        }
        return query.join('&');
    }
}
exports.UrlSearchParams = UrlSearchParams;
exports.default = UrlSearchParams;

},{}],9:[function(require,module,exports){
"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const has_1 = require("@dojo/framework/core/has");
const isIdentical_1 = require("../isIdentical");
const UrlSearchParams_1 = require("./UrlSearchParams");
const _url = (has_1.default('host-node')) ? require('url') : window.URL;
class Parameters extends UrlSearchParams_1.UrlSearchParams {
    constructor(input) {
        super(input);
    }
    get(key = '') {
        if (!this.has(key)) {
            return Object.keys(this._list).reduce((_o, key) => {
                if (key !== '') {
                    _o[key] = this._list[key][0];
                }
                return _o;
            }, {});
        }
        return this._list[key][0];
    }
}
exports.Parameters = Parameters;
class url {
    static format(urlAny) {
        if (has_1.default('host-node')) {
            return _url.format(urlAny);
        }
        ;
        return (new _url(urlAny)).toString();
    }
    static parse(urlStr, parseQuery = false, slashesDenoteHost = false) {
        urlStr = urlStr.trim();
        const proto = url.protocolPattern.exec(urlStr);
        const defProto = url.defaultProtocolPattern.exec(urlStr);
        if (!proto || defProto) {
            urlStr = `https:${defProto ? '' : '//'}${urlStr}`;
        }
        if (has_1.default('host-node')) {
            const parsed = _url.parse(urlStr, parseQuery, slashesDenoteHost);
            parsed.originalUrl = urlStr;
            return (!!(parseQuery) && !(parsed.host) && !Object.keys(parsed.query).length) ? Object.assign(Object.assign({}, parsed), { query: url.parameters(urlStr).get() }) : parsed;
        }
        var U;
        try {
            U = new _url(urlStr);
        }
        catch (e) {
            return {};
        }
        U.originalUrl = urlStr;
        U.path = [U.pathname || '', U.search || ''].join('');
        U.auth = (typeof U.username === 'string' && U.username.length) ?
            [U.username, U.password] : '';
        if (parseQuery) {
            U.query = (typeof U.searchParams === 'object') ?
                U.searchParams : new Parameters(U.search || '').get();
        }
        else {
            U.query = U.search;
        }
        if (proto) {
            var lowerProto = proto[0].toLowerCase();
            U.protocol = lowerProto;
            urlStr = urlStr.substr(proto[0].length);
        }
        if (slashesDenoteHost || proto || urlStr.match(/^\/\/[^@\/]+@[^@\/]+/)) {
            var slashes = (urlStr.substr(0, 2) === '//');
            var lowerProto = proto[0].toLowerCase();
            if (slashes && !(lowerProto && url.hostlessProtocol[lowerProto])) {
                urlStr = urlStr.substr(2);
                U.slashes = true;
            }
        }
        return U;
    }
    static parameters(input) {
        const U = (typeof input === 'string') ? url.parse(input) : input;
        if (!U.host && !U.search) {
            U.search = U.pathname;
        }
        return (new Parameters((!U.search) ? '' : U.search.replace('?', '')));
    }
    static withParameters(baseUrl, queryObj) {
        const t = (typeof baseUrl);
        if (t !== 'string' && t !== 'object') {
            return '';
        }
        let parsed = (t === 'string') ? url.parse(baseUrl, true, false) : baseUrl;
        parsed.query = Object.assign(Object.assign({}, (parsed.query || {})), (queryObj || {}));
        return url.format(parsed);
    }
    static concat(baseUrl, path) {
        return ((baseUrl.slice(-1) === '/') ? baseUrl.slice(0, -1) : baseUrl) +
            ((path.slice(0, 1) !== '/') ? ('/' + path) : path);
    }
    static resolve(from, to) {
        if (has_1.default('host-node')) {
            return _url.resolve(from, to);
        }
        ;
    }
    static resolveRelative(mainUrl, u) {
        const _u = url.parse(u);
        if (!(_u.protocol) && !(_u.host) && (!!(_u.path) || _u.href.charAt(0) === '#')) {
            return url.resolve(mainUrl, u);
        }
        return u;
    }
    static normalizeUrl(u, inclQuery = true, defaultProtocol = 'https:', forceProtocol = false) {
        u = (typeof u === 'string') ? url.parse(u, true) : u;
        const port = (!!u.port && ((u.protocol === 'http:' && u.port != '80') ||
            (u.protocol === 'https:' && u.port != '443'))) ?
            [':', u.port].join('') : '';
        if (!(u.protocol) && !(u.host) && !!(u.pathname)) {
            const h = JSON.parse(JSON.stringify(u.pathname));
            if (!!(u.query)) {
                delete u.query[h];
            }
            u = Object.assign(Object.assign({}, u), { host: h, hostname: h, path: '/', pathname: '/' });
        }
        if (!!forceProtocol) {
            u = Object.assign(Object.assign({}, u), { protocol: defaultProtocol });
        }
        else if (typeof defaultProtocol === 'string' && !u.protocol) {
            u = Object.assign(Object.assign({}, u), { protocol: (defaultProtocol + ':') });
        }
        if (!inclQuery) {
            u.search = '';
        }
        if (!u.pathname || u.pathname === '') {
            u.pathname = '/';
        }
        if (!u.hostname) {
            return u.pathname;
        }
        return url.format(u);
    }
    static hasIdentical(urls, myUrl) {
        if (typeof urls === 'string') {
            urls = [urls];
        }
        if (Array.isArray(urls) && urls.length && typeof myUrl === 'string' && myUrl.trim().length) {
            var nUrl = url.normalizeUrl(myUrl);
            var i, u;
            for (i = 0; i < urls.length; i++) {
                u = url.resolveRelative(myUrl, urls[i]);
                u = url.normalizeUrl(u);
                if (typeof u === 'string' && u.trim().length && isIdentical_1.isIdentical(u, nUrl)) {
                    return true;
                }
            }
        }
        return false;
    }
}
url.protocolPattern = /^([a-z0-9.+-]+:)/i;
url.defaultProtocolPattern = /^(\/\/)/i;
url.hostlessProtocol = {
    'javascript': true,
    'javascript:': true
};
url.slashedProtocol = {
    'http': true,
    'https': true,
    'ftp': true,
    'gopher': true,
    'file': true
};
exports.default = url;

},{"../isIdentical":7,"./UrlSearchParams":8,"@dojo/framework/core/has":10,"url":24}],10:[function(require,module,exports){
(function (process){
(function (factory) {
    if (typeof module === "object" && typeof module.exports === "object") {
        var v = factory(require, exports);
        if (v !== undefined) module.exports = v;
    }
    else if (typeof define === "function" && define.amd) {
        define(["require", "exports", "tslib", "../shim/global"], factory);
    }
})(function (require, exports) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    var tslib_1 = require("tslib");
    var global_1 = require("../shim/global");
    /**
     * A cache of results of feature tests
     */
    exports.testCache = {};
    /**
     * A cache of the un-resolved feature tests
     */
    exports.testFunctions = {};
    /* Grab the staticFeatures if there are available */
    var staticFeatures = (global_1.default.DojoHasEnvironment || {}).staticFeatures;
    /* Cleaning up the DojoHasEnviornment */
    if ('DojoHasEnvironment' in global_1.default) {
        delete global_1.default.DojoHasEnvironment;
    }
    /**
     * Custom type guard to narrow the `staticFeatures` to either a map or a function that
     * returns a map.
     *
     * @param value The value to guard for
     */
    function isStaticFeatureFunction(value) {
        return typeof value === 'function';
    }
    /**
     * The cache of asserted features that were available in the global scope when the
     * module loaded
     */
    var staticCache = staticFeatures
        ? isStaticFeatureFunction(staticFeatures)
            ? staticFeatures.apply(global_1.default)
            : staticFeatures
        : {}; /* Providing an empty cache, if none was in the environment


/**
 * AMD plugin function.
 *
 * Resolves resourceId into a module id based on possibly-nested tenary expression that branches on has feature test
 * value(s).
 *
 * @param resourceId The id of the module
 * @param normalize Resolves a relative module id into an absolute module id
 */
    function normalize(resourceId, normalize) {
        var tokens = resourceId.match(/[\?:]|[^:\?]*/g) || [];
        var i = 0;
        function get(skip) {
            var term = tokens[i++];
            if (term === ':') {
                // empty string module name, resolves to null
                return null;
            }
            else {
                // postfixed with a ? means it is a feature to branch on, the term is the name of the feature
                if (tokens[i++] === '?') {
                    if (!skip && has(term)) {
                        // matched the feature, get the first value from the options
                        return get();
                    }
                    else {
                        // did not match, get the second value, passing over the first
                        get(true);
                        return get(skip);
                    }
                }
                // a module
                return term;
            }
        }
        var id = get();
        return id && normalize(id);
    }
    exports.normalize = normalize;
    /**
     * Check if a feature has already been registered
     *
     * @param feature the name of the feature
     */
    function exists(feature) {
        var normalizedFeature = feature.toLowerCase();
        return Boolean(normalizedFeature in staticCache || normalizedFeature in exports.testCache || exports.testFunctions[normalizedFeature]);
    }
    exports.exists = exists;
    /**
     * Register a new test for a named feature.
     *
     * @example
     * has.add('dom-addeventlistener', !!document.addEventListener);
     *
     * @example
     * has.add('touch-events', function () {
     *    return 'ontouchstart' in document
     * });
     *
     * @param feature the name of the feature
     * @param value the value reported of the feature, or a function that will be executed once on first test
     * @param overwrite if an existing value should be overwritten. Defaults to false.
     */
    function add(feature, value, overwrite) {
        if (overwrite === void 0) { overwrite = false; }
        var normalizedFeature = feature.toLowerCase();
        if (exists(normalizedFeature) && !overwrite && !(normalizedFeature in staticCache)) {
            throw new TypeError("Feature \"" + feature + "\" exists and overwrite not true.");
        }
        if (typeof value === 'function') {
            exports.testFunctions[normalizedFeature] = value;
        }
        else {
            exports.testCache[normalizedFeature] = value;
            delete exports.testFunctions[normalizedFeature];
        }
    }
    exports.add = add;
    /**
     * Return the current value of a named feature.
     *
     * @param feature The name of the feature to test.
     */
    function has(feature, strict) {
        if (strict === void 0) { strict = false; }
        var result;
        var normalizedFeature = feature.toLowerCase();
        if (normalizedFeature in staticCache) {
            result = staticCache[normalizedFeature];
        }
        else if (exports.testFunctions[normalizedFeature]) {
            result = exports.testCache[normalizedFeature] = exports.testFunctions[normalizedFeature].call(null);
            delete exports.testFunctions[normalizedFeature];
        }
        else if (normalizedFeature in exports.testCache) {
            result = exports.testCache[normalizedFeature];
        }
        else if (strict) {
            throw new TypeError("Attempt to detect unregistered has feature \"" + feature + "\"");
        }
        return result;
    }
    exports.default = has;
    /*
     * Out of the box feature tests
     */
    add('public-path', undefined);
    /* flag for dojo debug, default to false */
    add('dojo-debug', false);
    /* Detects if the environment is "browser like" */
    add('host-browser', typeof document !== 'undefined' && typeof location !== 'undefined');
    /* Detects if the environment appears to be NodeJS */
    add('host-node', function () {
        if (typeof process === 'object' && process.versions && process.versions.node) {
            return process.versions.node;
        }
    });
    add('fetch', 'fetch' in global_1.default && typeof global_1.default.fetch === 'function', true);
    add('es6-array', function () {
        return (['from', 'of'].every(function (key) { return key in global_1.default.Array; }) &&
            ['findIndex', 'find', 'copyWithin'].every(function (key) { return key in global_1.default.Array.prototype; }));
    }, true);
    add('es6-array-fill', function () {
        if ('fill' in global_1.default.Array.prototype) {
            /* Some versions of Safari do not properly implement this */
            return [1].fill(9, Number.POSITIVE_INFINITY)[0] === 1;
        }
        return false;
    }, true);
    add('es7-array', function () { return 'includes' in global_1.default.Array.prototype; }, true);
    /* Map */
    add('es6-map', function () {
        if (typeof global_1.default.Map === 'function') {
            /*
        IE11 and older versions of Safari are missing critical ES6 Map functionality
        We wrap this in a try/catch because sometimes the Map constructor exists, but does not
        take arguments (iOS 8.4)
         */
            try {
                var map = new global_1.default.Map([[0, 1]]);
                return (map.has(0) &&
                    typeof map.keys === 'function' &&
                    has('es6-symbol') &&
                    typeof map.values === 'function' &&
                    typeof map.entries === 'function');
            }
            catch (e) {
                /* istanbul ignore next: not testing on iOS at the moment */
                return false;
            }
        }
        return false;
    }, true);
    add('es6-iterator', function () { return has('es6-map'); });
    /* Math */
    add('es6-math', function () {
        return [
            'clz32',
            'sign',
            'log10',
            'log2',
            'log1p',
            'expm1',
            'cosh',
            'sinh',
            'tanh',
            'acosh',
            'asinh',
            'atanh',
            'trunc',
            'fround',
            'cbrt',
            'hypot'
        ].every(function (name) { return typeof global_1.default.Math[name] === 'function'; });
    }, true);
    add('es6-math-imul', function () {
        if ('imul' in global_1.default.Math) {
            /* Some versions of Safari on ios do not properly implement this */
            return Math.imul(0xffffffff, 5) === -5;
        }
        return false;
    }, true);
    /* Object */
    add('es6-object', function () {
        return (has('es6-symbol') &&
            ['assign', 'is', 'getOwnPropertySymbols', 'setPrototypeOf'].every(function (name) { return typeof global_1.default.Object[name] === 'function'; }));
    }, true);
    add('es2017-object', function () {
        return ['values', 'entries', 'getOwnPropertyDescriptors'].every(function (name) { return typeof global_1.default.Object[name] === 'function'; });
    }, true);
    /* Observable */
    add('es-observable', function () { return typeof global_1.default.Observable !== 'undefined'; }, true);
    /* Promise */
    add('es6-promise', function () { return typeof global_1.default.Promise !== 'undefined' && has('es6-symbol'); }, true);
    add('es2018-promise-finally', function () { return has('es6-promise') && typeof global_1.default.Promise.prototype.finally !== 'undefined'; }, true);
    /* Set */
    add('es6-set', function () {
        if (typeof global_1.default.Set === 'function') {
            /* IE11 and older versions of Safari are missing critical ES6 Set functionality */
            var set = new global_1.default.Set([1]);
            return set.has(1) && 'keys' in set && typeof set.keys === 'function' && has('es6-symbol');
        }
        return false;
    }, true);
    /* String */
    add('es6-string', function () {
        return ([
            /* static methods */
            'fromCodePoint'
        ].every(function (key) { return typeof global_1.default.String[key] === 'function'; }) &&
            [
                /* instance methods */
                'codePointAt',
                'normalize',
                'repeat',
                'startsWith',
                'endsWith',
                'includes'
            ].every(function (key) { return typeof global_1.default.String.prototype[key] === 'function'; }));
    }, true);
    add('es6-string-raw', function () {
        function getCallSite(callSite) {
            var substitutions = [];
            for (var _i = 1; _i < arguments.length; _i++) {
                substitutions[_i - 1] = arguments[_i];
            }
            var result = tslib_1.__spread(callSite);
            result.raw = callSite.raw;
            return result;
        }
        if ('raw' in global_1.default.String) {
            var b = 1;
            var callSite = getCallSite(templateObject_1 || (templateObject_1 = tslib_1.__makeTemplateObject(["a\n", ""], ["a\\n", ""])), b);
            callSite.raw = ['a\\n'];
            var supportsTrunc = global_1.default.String.raw(callSite, 42) === 'a\\n';
            return supportsTrunc;
        }
        return false;
    }, true);
    add('es2017-string', function () {
        return ['padStart', 'padEnd'].every(function (key) { return typeof global_1.default.String.prototype[key] === 'function'; });
    }, true);
    /* Symbol */
    add('es6-symbol', function () { return typeof global_1.default.Symbol !== 'undefined' && typeof Symbol() === 'symbol'; }, true);
    /* WeakMap */
    add('es6-weakmap', function () {
        if (typeof global_1.default.WeakMap !== 'undefined') {
            /* IE11 and older versions of Safari are missing critical ES6 Map functionality */
            var key1 = {};
            var key2 = {};
            var map = new global_1.default.WeakMap([[key1, 1]]);
            Object.freeze(key1);
            return map.get(key1) === 1 && map.set(key2, 2) === map && has('es6-symbol');
        }
        return false;
    }, true);
    /* Miscellaneous features */
    add('microtasks', function () { return has('es6-promise') || has('host-node') || has('dom-mutationobserver'); }, true);
    add('postmessage', function () {
        // If window is undefined, and we have postMessage, it probably means we're in a web worker. Web workers have
        // post message but it doesn't work how we expect it to, so it's best just to pretend it doesn't exist.
        return typeof global_1.default.window !== 'undefined' && typeof global_1.default.postMessage === 'function';
    }, true);
    add('raf', function () { return typeof global_1.default.requestAnimationFrame === 'function'; }, true);
    add('setimmediate', function () { return typeof global_1.default.setImmediate !== 'undefined'; }, true);
    /* DOM Features */
    add('dom-mutationobserver', function () {
        if (has('host-browser') && Boolean(global_1.default.MutationObserver || global_1.default.WebKitMutationObserver)) {
            // IE11 has an unreliable MutationObserver implementation where setProperty() does not
            // generate a mutation event, observers can crash, and the queue does not drain
            // reliably. The following feature test was adapted from
            // https://gist.github.com/t10ko/4aceb8c71681fdb275e33efe5e576b14
            var example = document.createElement('div');
            /* tslint:disable-next-line:variable-name */
            var HostMutationObserver = global_1.default.MutationObserver || global_1.default.WebKitMutationObserver;
            var observer = new HostMutationObserver(function () { });
            observer.observe(example, { attributes: true });
            example.style.setProperty('display', 'block');
            return Boolean(observer.takeRecords().length);
        }
        return false;
    }, true);
    add('dom-webanimation', function () { return has('host-browser') && global_1.default.Animation !== undefined && global_1.default.KeyframeEffect !== undefined; }, true);
    add('abort-controller', function () { return typeof global_1.default.AbortController !== 'undefined'; });
    add('abort-signal', function () { return typeof global_1.default.AbortSignal !== 'undefined'; });
    add('dom-intersection-observer', function () { return has('host-browser') && global_1.default.IntersectionObserver !== undefined; }, true);
    add('dom-resize-observer', function () { return has('host-browser') && global_1.default.ResizeObserver !== undefined; }, true);
    add('dom-pointer-events', function () { return has('host-browser') && global_1.default.onpointerdown !== undefined; }, true);
    add('build-elide', false);
    add('test', false);
    add('global-this', function () { return typeof global_1.default.globalThis !== 'undefined'; });
    var templateObject_1;
});

}).call(this,require('_process'))
},{"../shim/global":12,"_process":18,"tslib":11}],11:[function(require,module,exports){
(function (global){
/*! *****************************************************************************
Copyright (c) Microsoft Corporation. All rights reserved.
Licensed under the Apache License, Version 2.0 (the "License"); you may not use
this file except in compliance with the License. You may obtain a copy of the
License at http://www.apache.org/licenses/LICENSE-2.0

THIS CODE IS PROVIDED ON AN *AS IS* BASIS, WITHOUT WARRANTIES OR CONDITIONS OF ANY
KIND, EITHER EXPRESS OR IMPLIED, INCLUDING WITHOUT LIMITATION ANY IMPLIED
WARRANTIES OR CONDITIONS OF TITLE, FITNESS FOR A PARTICULAR PURPOSE,
MERCHANTABLITY OR NON-INFRINGEMENT.

See the Apache Version 2.0 License for specific language governing permissions
and limitations under the License.
***************************************************************************** */
/* global global, define, System, Reflect, Promise */
var __extends;
var __assign;
var __rest;
var __decorate;
var __param;
var __metadata;
var __awaiter;
var __generator;
var __exportStar;
var __values;
var __read;
var __spread;
var __await;
var __asyncGenerator;
var __asyncDelegator;
var __asyncValues;
var __makeTemplateObject;
var __importStar;
var __importDefault;
(function (factory) {
    var root = typeof global === "object" ? global : typeof self === "object" ? self : typeof this === "object" ? this : {};
    if (typeof define === "function" && define.amd) {
        define("tslib", ["exports"], function (exports) { factory(createExporter(root, createExporter(exports))); });
    }
    else if (typeof module === "object" && typeof module.exports === "object") {
        factory(createExporter(root, createExporter(module.exports)));
    }
    else {
        factory(createExporter(root));
    }
    function createExporter(exports, previous) {
        if (exports !== root) {
            if (typeof Object.create === "function") {
                Object.defineProperty(exports, "__esModule", { value: true });
            }
            else {
                exports.__esModule = true;
            }
        }
        return function (id, v) { return exports[id] = previous ? previous(id, v) : v; };
    }
})
(function (exporter) {
    var extendStatics = Object.setPrototypeOf ||
        ({ __proto__: [] } instanceof Array && function (d, b) { d.__proto__ = b; }) ||
        function (d, b) { for (var p in b) if (b.hasOwnProperty(p)) d[p] = b[p]; };

    __extends = function (d, b) {
        extendStatics(d, b);
        function __() { this.constructor = d; }
        d.prototype = b === null ? Object.create(b) : (__.prototype = b.prototype, new __());
    };

    __assign = Object.assign || function (t) {
        for (var s, i = 1, n = arguments.length; i < n; i++) {
            s = arguments[i];
            for (var p in s) if (Object.prototype.hasOwnProperty.call(s, p)) t[p] = s[p];
        }
        return t;
    };

    __rest = function (s, e) {
        var t = {};
        for (var p in s) if (Object.prototype.hasOwnProperty.call(s, p) && e.indexOf(p) < 0)
            t[p] = s[p];
        if (s != null && typeof Object.getOwnPropertySymbols === "function")
            for (var i = 0, p = Object.getOwnPropertySymbols(s); i < p.length; i++) if (e.indexOf(p[i]) < 0)
                t[p[i]] = s[p[i]];
        return t;
    };

    __decorate = function (decorators, target, key, desc) {
        var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
        if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
        else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
        return c > 3 && r && Object.defineProperty(target, key, r), r;
    };

    __param = function (paramIndex, decorator) {
        return function (target, key) { decorator(target, key, paramIndex); }
    };

    __metadata = function (metadataKey, metadataValue) {
        if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(metadataKey, metadataValue);
    };

    __awaiter = function (thisArg, _arguments, P, generator) {
        return new (P || (P = Promise))(function (resolve, reject) {
            function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
            function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
            function step(result) { result.done ? resolve(result.value) : new P(function (resolve) { resolve(result.value); }).then(fulfilled, rejected); }
            step((generator = generator.apply(thisArg, _arguments || [])).next());
        });
    };

    __generator = function (thisArg, body) {
        var _ = { label: 0, sent: function() { if (t[0] & 1) throw t[1]; return t[1]; }, trys: [], ops: [] }, f, y, t, g;
        return g = { next: verb(0), "throw": verb(1), "return": verb(2) }, typeof Symbol === "function" && (g[Symbol.iterator] = function() { return this; }), g;
        function verb(n) { return function (v) { return step([n, v]); }; }
        function step(op) {
            if (f) throw new TypeError("Generator is already executing.");
            while (_) try {
                if (f = 1, y && (t = op[0] & 2 ? y["return"] : op[0] ? y["throw"] || ((t = y["return"]) && t.call(y), 0) : y.next) && !(t = t.call(y, op[1])).done) return t;
                if (y = 0, t) op = [op[0] & 2, t.value];
                switch (op[0]) {
                    case 0: case 1: t = op; break;
                    case 4: _.label++; return { value: op[1], done: false };
                    case 5: _.label++; y = op[1]; op = [0]; continue;
                    case 7: op = _.ops.pop(); _.trys.pop(); continue;
                    default:
                        if (!(t = _.trys, t = t.length > 0 && t[t.length - 1]) && (op[0] === 6 || op[0] === 2)) { _ = 0; continue; }
                        if (op[0] === 3 && (!t || (op[1] > t[0] && op[1] < t[3]))) { _.label = op[1]; break; }
                        if (op[0] === 6 && _.label < t[1]) { _.label = t[1]; t = op; break; }
                        if (t && _.label < t[2]) { _.label = t[2]; _.ops.push(op); break; }
                        if (t[2]) _.ops.pop();
                        _.trys.pop(); continue;
                }
                op = body.call(thisArg, _);
            } catch (e) { op = [6, e]; y = 0; } finally { f = t = 0; }
            if (op[0] & 5) throw op[1]; return { value: op[0] ? op[1] : void 0, done: true };
        }
    };

    __exportStar = function (m, exports) {
        for (var p in m) if (!exports.hasOwnProperty(p)) exports[p] = m[p];
    };

    __values = function (o) {
        var m = typeof Symbol === "function" && o[Symbol.iterator], i = 0;
        if (m) return m.call(o);
        return {
            next: function () {
                if (o && i >= o.length) o = void 0;
                return { value: o && o[i++], done: !o };
            }
        };
    };

    __read = function (o, n) {
        var m = typeof Symbol === "function" && o[Symbol.iterator];
        if (!m) return o;
        var i = m.call(o), r, ar = [], e;
        try {
            while ((n === void 0 || n-- > 0) && !(r = i.next()).done) ar.push(r.value);
        }
        catch (error) { e = { error: error }; }
        finally {
            try {
                if (r && !r.done && (m = i["return"])) m.call(i);
            }
            finally { if (e) throw e.error; }
        }
        return ar;
    };

    __spread = function () {
        for (var ar = [], i = 0; i < arguments.length; i++)
            ar = ar.concat(__read(arguments[i]));
        return ar;
    };

    __await = function (v) {
        return this instanceof __await ? (this.v = v, this) : new __await(v);
    };

    __asyncGenerator = function (thisArg, _arguments, generator) {
        if (!Symbol.asyncIterator) throw new TypeError("Symbol.asyncIterator is not defined.");
        var g = generator.apply(thisArg, _arguments || []), i, q = [];
        return i = {}, verb("next"), verb("throw"), verb("return"), i[Symbol.asyncIterator] = function () { return this; }, i;
        function verb(n) { if (g[n]) i[n] = function (v) { return new Promise(function (a, b) { q.push([n, v, a, b]) > 1 || resume(n, v); }); }; }
        function resume(n, v) { try { step(g[n](v)); } catch (e) { settle(q[0][3], e); } }
        function step(r) { r.value instanceof __await ? Promise.resolve(r.value.v).then(fulfill, reject) : settle(q[0][2], r);  }
        function fulfill(value) { resume("next", value); }
        function reject(value) { resume("throw", value); }
        function settle(f, v) { if (f(v), q.shift(), q.length) resume(q[0][0], q[0][1]); }
    };

    __asyncDelegator = function (o) {
        var i, p;
        return i = {}, verb("next"), verb("throw", function (e) { throw e; }), verb("return"), i[Symbol.iterator] = function () { return this; }, i;
        function verb(n, f) { i[n] = o[n] ? function (v) { return (p = !p) ? { value: __await(o[n](v)), done: n === "return" } : f ? f(v) : v; } : f; }
    };

    __asyncValues = function (o) {
        if (!Symbol.asyncIterator) throw new TypeError("Symbol.asyncIterator is not defined.");
        var m = o[Symbol.asyncIterator], i;
        return m ? m.call(o) : (o = typeof __values === "function" ? __values(o) : o[Symbol.iterator](), i = {}, verb("next"), verb("throw"), verb("return"), i[Symbol.asyncIterator] = function () { return this; }, i);
        function verb(n) { i[n] = o[n] && function (v) { return new Promise(function (resolve, reject) { v = o[n](v), settle(resolve, reject, v.done, v.value); }); }; }
        function settle(resolve, reject, d, v) { Promise.resolve(v).then(function(v) { resolve({ value: v, done: d }); }, reject); }
    };

    __makeTemplateObject = function (cooked, raw) {
        if (Object.defineProperty) { Object.defineProperty(cooked, "raw", { value: raw }); } else { cooked.raw = raw; }
        return cooked;
    };

    __importStar = function (mod) {
        if (mod && mod.__esModule) return mod;
        var result = {};
        if (mod != null) for (var k in mod) if (Object.hasOwnProperty.call(mod, k)) result[k] = mod[k];
        result["default"] = mod;
        return result;
    };

    __importDefault = function (mod) {
        return (mod && mod.__esModule) ? mod : { "default": mod };
    };

    exporter("__extends", __extends);
    exporter("__assign", __assign);
    exporter("__rest", __rest);
    exporter("__decorate", __decorate);
    exporter("__param", __param);
    exporter("__metadata", __metadata);
    exporter("__awaiter", __awaiter);
    exporter("__generator", __generator);
    exporter("__exportStar", __exportStar);
    exporter("__values", __values);
    exporter("__read", __read);
    exporter("__spread", __spread);
    exporter("__await", __await);
    exporter("__asyncGenerator", __asyncGenerator);
    exporter("__asyncDelegator", __asyncDelegator);
    exporter("__asyncValues", __asyncValues);
    exporter("__makeTemplateObject", __makeTemplateObject);
    exporter("__importStar", __importStar);
    exporter("__importDefault", __importDefault);
});

}).call(this,typeof global !== "undefined" ? global : typeof self !== "undefined" ? self : typeof window !== "undefined" ? window : {})
},{}],12:[function(require,module,exports){
(function (global){
(function (factory) {
    if (typeof module === "object" && typeof module.exports === "object") {
        var v = factory(require, exports);
        if (v !== undefined) module.exports = v;
    }
    else if (typeof define === "function" && define.amd) {
        define(["require", "exports"], factory);
    }
})(function (require, exports) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    var globalObject = (function () {
        // the only reliable means to get the global object is
        // `Function('return this')()`
        // However, this causes CSP violations in Chrome apps.
        if (typeof window !== 'undefined' && window.navigator.userAgent.indexOf('jsdom') > -1) {
            return window;
        }
        if (typeof globalThis !== 'undefined') {
            return globalThis;
        }
        if (typeof self !== 'undefined') {
            return self;
        }
        if (typeof window !== 'undefined') {
            return window;
        }
        if (typeof global !== 'undefined') {
            return global;
        }
    })();
    exports.default = globalObject;
});

}).call(this,typeof global !== "undefined" ? global : typeof self !== "undefined" ? self : typeof window !== "undefined" ? window : {})
},{}],13:[function(require,module,exports){
(function(){

    // Copyright (c) 2005  Tom Wu
    // All Rights Reserved.
    // See "LICENSE" for details.

    // Basic JavaScript BN library - subset useful for RSA encryption.

    // Bits per digit
    var dbits;

    // JavaScript engine analysis
    var canary = 0xdeadbeefcafe;
    var j_lm = ((canary&0xffffff)==0xefcafe);

    // (public) Constructor
    function BigInteger(a,b,c) {
      if(a != null)
        if("number" == typeof a) this.fromNumber(a,b,c);
        else if(b == null && "string" != typeof a) this.fromString(a,256);
        else this.fromString(a,b);
    }

    // return new, unset BigInteger
    function nbi() { return new BigInteger(null); }

    // am: Compute w_j += (x*this_i), propagate carries,
    // c is initial carry, returns final carry.
    // c < 3*dvalue, x < 2*dvalue, this_i < dvalue
    // We need to select the fastest one that works in this environment.

    // am1: use a single mult and divide to get the high bits,
    // max digit bits should be 26 because
    // max internal value = 2*dvalue^2-2*dvalue (< 2^53)
    function am1(i,x,w,j,c,n) {
      while(--n >= 0) {
        var v = x*this[i++]+w[j]+c;
        c = Math.floor(v/0x4000000);
        w[j++] = v&0x3ffffff;
      }
      return c;
    }
    // am2 avoids a big mult-and-extract completely.
    // Max digit bits should be <= 30 because we do bitwise ops
    // on values up to 2*hdvalue^2-hdvalue-1 (< 2^31)
    function am2(i,x,w,j,c,n) {
      var xl = x&0x7fff, xh = x>>15;
      while(--n >= 0) {
        var l = this[i]&0x7fff;
        var h = this[i++]>>15;
        var m = xh*l+h*xl;
        l = xl*l+((m&0x7fff)<<15)+w[j]+(c&0x3fffffff);
        c = (l>>>30)+(m>>>15)+xh*h+(c>>>30);
        w[j++] = l&0x3fffffff;
      }
      return c;
    }
    // Alternately, set max digit bits to 28 since some
    // browsers slow down when dealing with 32-bit numbers.
    function am3(i,x,w,j,c,n) {
      var xl = x&0x3fff, xh = x>>14;
      while(--n >= 0) {
        var l = this[i]&0x3fff;
        var h = this[i++]>>14;
        var m = xh*l+h*xl;
        l = xl*l+((m&0x3fff)<<14)+w[j]+c;
        c = (l>>28)+(m>>14)+xh*h;
        w[j++] = l&0xfffffff;
      }
      return c;
    }
    var inBrowser = typeof navigator !== "undefined";
    if(inBrowser && j_lm && (navigator.appName == "Microsoft Internet Explorer")) {
      BigInteger.prototype.am = am2;
      dbits = 30;
    }
    else if(inBrowser && j_lm && (navigator.appName != "Netscape")) {
      BigInteger.prototype.am = am1;
      dbits = 26;
    }
    else { // Mozilla/Netscape seems to prefer am3
      BigInteger.prototype.am = am3;
      dbits = 28;
    }

    BigInteger.prototype.DB = dbits;
    BigInteger.prototype.DM = ((1<<dbits)-1);
    BigInteger.prototype.DV = (1<<dbits);

    var BI_FP = 52;
    BigInteger.prototype.FV = Math.pow(2,BI_FP);
    BigInteger.prototype.F1 = BI_FP-dbits;
    BigInteger.prototype.F2 = 2*dbits-BI_FP;

    // Digit conversions
    var BI_RM = "0123456789abcdefghijklmnopqrstuvwxyz";
    var BI_RC = new Array();
    var rr,vv;
    rr = "0".charCodeAt(0);
    for(vv = 0; vv <= 9; ++vv) BI_RC[rr++] = vv;
    rr = "a".charCodeAt(0);
    for(vv = 10; vv < 36; ++vv) BI_RC[rr++] = vv;
    rr = "A".charCodeAt(0);
    for(vv = 10; vv < 36; ++vv) BI_RC[rr++] = vv;

    function int2char(n) { return BI_RM.charAt(n); }
    function intAt(s,i) {
      var c = BI_RC[s.charCodeAt(i)];
      return (c==null)?-1:c;
    }

    // (protected) copy this to r
    function bnpCopyTo(r) {
      for(var i = this.t-1; i >= 0; --i) r[i] = this[i];
      r.t = this.t;
      r.s = this.s;
    }

    // (protected) set from integer value x, -DV <= x < DV
    function bnpFromInt(x) {
      this.t = 1;
      this.s = (x<0)?-1:0;
      if(x > 0) this[0] = x;
      else if(x < -1) this[0] = x+this.DV;
      else this.t = 0;
    }

    // return bigint initialized to value
    function nbv(i) { var r = nbi(); r.fromInt(i); return r; }

    // (protected) set from string and radix
    function bnpFromString(s,b) {
      var k;
      if(b == 16) k = 4;
      else if(b == 8) k = 3;
      else if(b == 256) k = 8; // byte array
      else if(b == 2) k = 1;
      else if(b == 32) k = 5;
      else if(b == 4) k = 2;
      else { this.fromRadix(s,b); return; }
      this.t = 0;
      this.s = 0;
      var i = s.length, mi = false, sh = 0;
      while(--i >= 0) {
        var x = (k==8)?s[i]&0xff:intAt(s,i);
        if(x < 0) {
          if(s.charAt(i) == "-") mi = true;
          continue;
        }
        mi = false;
        if(sh == 0)
          this[this.t++] = x;
        else if(sh+k > this.DB) {
          this[this.t-1] |= (x&((1<<(this.DB-sh))-1))<<sh;
          this[this.t++] = (x>>(this.DB-sh));
        }
        else
          this[this.t-1] |= x<<sh;
        sh += k;
        if(sh >= this.DB) sh -= this.DB;
      }
      if(k == 8 && (s[0]&0x80) != 0) {
        this.s = -1;
        if(sh > 0) this[this.t-1] |= ((1<<(this.DB-sh))-1)<<sh;
      }
      this.clamp();
      if(mi) BigInteger.ZERO.subTo(this,this);
    }

    // (protected) clamp off excess high words
    function bnpClamp() {
      var c = this.s&this.DM;
      while(this.t > 0 && this[this.t-1] == c) --this.t;
    }

    // (public) return string representation in given radix
    function bnToString(b) {
      if(this.s < 0) return "-"+this.negate().toString(b);
      var k;
      if(b == 16) k = 4;
      else if(b == 8) k = 3;
      else if(b == 2) k = 1;
      else if(b == 32) k = 5;
      else if(b == 4) k = 2;
      else return this.toRadix(b);
      var km = (1<<k)-1, d, m = false, r = "", i = this.t;
      var p = this.DB-(i*this.DB)%k;
      if(i-- > 0) {
        if(p < this.DB && (d = this[i]>>p) > 0) { m = true; r = int2char(d); }
        while(i >= 0) {
          if(p < k) {
            d = (this[i]&((1<<p)-1))<<(k-p);
            d |= this[--i]>>(p+=this.DB-k);
          }
          else {
            d = (this[i]>>(p-=k))&km;
            if(p <= 0) { p += this.DB; --i; }
          }
          if(d > 0) m = true;
          if(m) r += int2char(d);
        }
      }
      return m?r:"0";
    }

    // (public) -this
    function bnNegate() { var r = nbi(); BigInteger.ZERO.subTo(this,r); return r; }

    // (public) |this|
    function bnAbs() { return (this.s<0)?this.negate():this; }

    // (public) return + if this > a, - if this < a, 0 if equal
    function bnCompareTo(a) {
      var r = this.s-a.s;
      if(r != 0) return r;
      var i = this.t;
      r = i-a.t;
      if(r != 0) return (this.s<0)?-r:r;
      while(--i >= 0) if((r=this[i]-a[i]) != 0) return r;
      return 0;
    }

    // returns bit length of the integer x
    function nbits(x) {
      var r = 1, t;
      if((t=x>>>16) != 0) { x = t; r += 16; }
      if((t=x>>8) != 0) { x = t; r += 8; }
      if((t=x>>4) != 0) { x = t; r += 4; }
      if((t=x>>2) != 0) { x = t; r += 2; }
      if((t=x>>1) != 0) { x = t; r += 1; }
      return r;
    }

    // (public) return the number of bits in "this"
    function bnBitLength() {
      if(this.t <= 0) return 0;
      return this.DB*(this.t-1)+nbits(this[this.t-1]^(this.s&this.DM));
    }

    // (protected) r = this << n*DB
    function bnpDLShiftTo(n,r) {
      var i;
      for(i = this.t-1; i >= 0; --i) r[i+n] = this[i];
      for(i = n-1; i >= 0; --i) r[i] = 0;
      r.t = this.t+n;
      r.s = this.s;
    }

    // (protected) r = this >> n*DB
    function bnpDRShiftTo(n,r) {
      for(var i = n; i < this.t; ++i) r[i-n] = this[i];
      r.t = Math.max(this.t-n,0);
      r.s = this.s;
    }

    // (protected) r = this << n
    function bnpLShiftTo(n,r) {
      var bs = n%this.DB;
      var cbs = this.DB-bs;
      var bm = (1<<cbs)-1;
      var ds = Math.floor(n/this.DB), c = (this.s<<bs)&this.DM, i;
      for(i = this.t-1; i >= 0; --i) {
        r[i+ds+1] = (this[i]>>cbs)|c;
        c = (this[i]&bm)<<bs;
      }
      for(i = ds-1; i >= 0; --i) r[i] = 0;
      r[ds] = c;
      r.t = this.t+ds+1;
      r.s = this.s;
      r.clamp();
    }

    // (protected) r = this >> n
    function bnpRShiftTo(n,r) {
      r.s = this.s;
      var ds = Math.floor(n/this.DB);
      if(ds >= this.t) { r.t = 0; return; }
      var bs = n%this.DB;
      var cbs = this.DB-bs;
      var bm = (1<<bs)-1;
      r[0] = this[ds]>>bs;
      for(var i = ds+1; i < this.t; ++i) {
        r[i-ds-1] |= (this[i]&bm)<<cbs;
        r[i-ds] = this[i]>>bs;
      }
      if(bs > 0) r[this.t-ds-1] |= (this.s&bm)<<cbs;
      r.t = this.t-ds;
      r.clamp();
    }

    // (protected) r = this - a
    function bnpSubTo(a,r) {
      var i = 0, c = 0, m = Math.min(a.t,this.t);
      while(i < m) {
        c += this[i]-a[i];
        r[i++] = c&this.DM;
        c >>= this.DB;
      }
      if(a.t < this.t) {
        c -= a.s;
        while(i < this.t) {
          c += this[i];
          r[i++] = c&this.DM;
          c >>= this.DB;
        }
        c += this.s;
      }
      else {
        c += this.s;
        while(i < a.t) {
          c -= a[i];
          r[i++] = c&this.DM;
          c >>= this.DB;
        }
        c -= a.s;
      }
      r.s = (c<0)?-1:0;
      if(c < -1) r[i++] = this.DV+c;
      else if(c > 0) r[i++] = c;
      r.t = i;
      r.clamp();
    }

    // (protected) r = this * a, r != this,a (HAC 14.12)
    // "this" should be the larger one if appropriate.
    function bnpMultiplyTo(a,r) {
      var x = this.abs(), y = a.abs();
      var i = x.t;
      r.t = i+y.t;
      while(--i >= 0) r[i] = 0;
      for(i = 0; i < y.t; ++i) r[i+x.t] = x.am(0,y[i],r,i,0,x.t);
      r.s = 0;
      r.clamp();
      if(this.s != a.s) BigInteger.ZERO.subTo(r,r);
    }

    // (protected) r = this^2, r != this (HAC 14.16)
    function bnpSquareTo(r) {
      var x = this.abs();
      var i = r.t = 2*x.t;
      while(--i >= 0) r[i] = 0;
      for(i = 0; i < x.t-1; ++i) {
        var c = x.am(i,x[i],r,2*i,0,1);
        if((r[i+x.t]+=x.am(i+1,2*x[i],r,2*i+1,c,x.t-i-1)) >= x.DV) {
          r[i+x.t] -= x.DV;
          r[i+x.t+1] = 1;
        }
      }
      if(r.t > 0) r[r.t-1] += x.am(i,x[i],r,2*i,0,1);
      r.s = 0;
      r.clamp();
    }

    // (protected) divide this by m, quotient and remainder to q, r (HAC 14.20)
    // r != q, this != m.  q or r may be null.
    function bnpDivRemTo(m,q,r) {
      var pm = m.abs();
      if(pm.t <= 0) return;
      var pt = this.abs();
      if(pt.t < pm.t) {
        if(q != null) q.fromInt(0);
        if(r != null) this.copyTo(r);
        return;
      }
      if(r == null) r = nbi();
      var y = nbi(), ts = this.s, ms = m.s;
      var nsh = this.DB-nbits(pm[pm.t-1]);   // normalize modulus
      if(nsh > 0) { pm.lShiftTo(nsh,y); pt.lShiftTo(nsh,r); }
      else { pm.copyTo(y); pt.copyTo(r); }
      var ys = y.t;
      var y0 = y[ys-1];
      if(y0 == 0) return;
      var yt = y0*(1<<this.F1)+((ys>1)?y[ys-2]>>this.F2:0);
      var d1 = this.FV/yt, d2 = (1<<this.F1)/yt, e = 1<<this.F2;
      var i = r.t, j = i-ys, t = (q==null)?nbi():q;
      y.dlShiftTo(j,t);
      if(r.compareTo(t) >= 0) {
        r[r.t++] = 1;
        r.subTo(t,r);
      }
      BigInteger.ONE.dlShiftTo(ys,t);
      t.subTo(y,y);  // "negative" y so we can replace sub with am later
      while(y.t < ys) y[y.t++] = 0;
      while(--j >= 0) {
        // Estimate quotient digit
        var qd = (r[--i]==y0)?this.DM:Math.floor(r[i]*d1+(r[i-1]+e)*d2);
        if((r[i]+=y.am(0,qd,r,j,0,ys)) < qd) {   // Try it out
          y.dlShiftTo(j,t);
          r.subTo(t,r);
          while(r[i] < --qd) r.subTo(t,r);
        }
      }
      if(q != null) {
        r.drShiftTo(ys,q);
        if(ts != ms) BigInteger.ZERO.subTo(q,q);
      }
      r.t = ys;
      r.clamp();
      if(nsh > 0) r.rShiftTo(nsh,r); // Denormalize remainder
      if(ts < 0) BigInteger.ZERO.subTo(r,r);
    }

    // (public) this mod a
    function bnMod(a) {
      var r = nbi();
      this.abs().divRemTo(a,null,r);
      if(this.s < 0 && r.compareTo(BigInteger.ZERO) > 0) a.subTo(r,r);
      return r;
    }

    // Modular reduction using "classic" algorithm
    function Classic(m) { this.m = m; }
    function cConvert(x) {
      if(x.s < 0 || x.compareTo(this.m) >= 0) return x.mod(this.m);
      else return x;
    }
    function cRevert(x) { return x; }
    function cReduce(x) { x.divRemTo(this.m,null,x); }
    function cMulTo(x,y,r) { x.multiplyTo(y,r); this.reduce(r); }
    function cSqrTo(x,r) { x.squareTo(r); this.reduce(r); }

    Classic.prototype.convert = cConvert;
    Classic.prototype.revert = cRevert;
    Classic.prototype.reduce = cReduce;
    Classic.prototype.mulTo = cMulTo;
    Classic.prototype.sqrTo = cSqrTo;

    // (protected) return "-1/this % 2^DB"; useful for Mont. reduction
    // justification:
    //         xy == 1 (mod m)
    //         xy =  1+km
    //   xy(2-xy) = (1+km)(1-km)
    // x[y(2-xy)] = 1-k^2m^2
    // x[y(2-xy)] == 1 (mod m^2)
    // if y is 1/x mod m, then y(2-xy) is 1/x mod m^2
    // should reduce x and y(2-xy) by m^2 at each step to keep size bounded.
    // JS multiply "overflows" differently from C/C++, so care is needed here.
    function bnpInvDigit() {
      if(this.t < 1) return 0;
      var x = this[0];
      if((x&1) == 0) return 0;
      var y = x&3;       // y == 1/x mod 2^2
      y = (y*(2-(x&0xf)*y))&0xf; // y == 1/x mod 2^4
      y = (y*(2-(x&0xff)*y))&0xff;   // y == 1/x mod 2^8
      y = (y*(2-(((x&0xffff)*y)&0xffff)))&0xffff;    // y == 1/x mod 2^16
      // last step - calculate inverse mod DV directly;
      // assumes 16 < DB <= 32 and assumes ability to handle 48-bit ints
      y = (y*(2-x*y%this.DV))%this.DV;       // y == 1/x mod 2^dbits
      // we really want the negative inverse, and -DV < y < DV
      return (y>0)?this.DV-y:-y;
    }

    // Montgomery reduction
    function Montgomery(m) {
      this.m = m;
      this.mp = m.invDigit();
      this.mpl = this.mp&0x7fff;
      this.mph = this.mp>>15;
      this.um = (1<<(m.DB-15))-1;
      this.mt2 = 2*m.t;
    }

    // xR mod m
    function montConvert(x) {
      var r = nbi();
      x.abs().dlShiftTo(this.m.t,r);
      r.divRemTo(this.m,null,r);
      if(x.s < 0 && r.compareTo(BigInteger.ZERO) > 0) this.m.subTo(r,r);
      return r;
    }

    // x/R mod m
    function montRevert(x) {
      var r = nbi();
      x.copyTo(r);
      this.reduce(r);
      return r;
    }

    // x = x/R mod m (HAC 14.32)
    function montReduce(x) {
      while(x.t <= this.mt2) // pad x so am has enough room later
        x[x.t++] = 0;
      for(var i = 0; i < this.m.t; ++i) {
        // faster way of calculating u0 = x[i]*mp mod DV
        var j = x[i]&0x7fff;
        var u0 = (j*this.mpl+(((j*this.mph+(x[i]>>15)*this.mpl)&this.um)<<15))&x.DM;
        // use am to combine the multiply-shift-add into one call
        j = i+this.m.t;
        x[j] += this.m.am(0,u0,x,i,0,this.m.t);
        // propagate carry
        while(x[j] >= x.DV) { x[j] -= x.DV; x[++j]++; }
      }
      x.clamp();
      x.drShiftTo(this.m.t,x);
      if(x.compareTo(this.m) >= 0) x.subTo(this.m,x);
    }

    // r = "x^2/R mod m"; x != r
    function montSqrTo(x,r) { x.squareTo(r); this.reduce(r); }

    // r = "xy/R mod m"; x,y != r
    function montMulTo(x,y,r) { x.multiplyTo(y,r); this.reduce(r); }

    Montgomery.prototype.convert = montConvert;
    Montgomery.prototype.revert = montRevert;
    Montgomery.prototype.reduce = montReduce;
    Montgomery.prototype.mulTo = montMulTo;
    Montgomery.prototype.sqrTo = montSqrTo;

    // (protected) true iff this is even
    function bnpIsEven() { return ((this.t>0)?(this[0]&1):this.s) == 0; }

    // (protected) this^e, e < 2^32, doing sqr and mul with "r" (HAC 14.79)
    function bnpExp(e,z) {
      if(e > 0xffffffff || e < 1) return BigInteger.ONE;
      var r = nbi(), r2 = nbi(), g = z.convert(this), i = nbits(e)-1;
      g.copyTo(r);
      while(--i >= 0) {
        z.sqrTo(r,r2);
        if((e&(1<<i)) > 0) z.mulTo(r2,g,r);
        else { var t = r; r = r2; r2 = t; }
      }
      return z.revert(r);
    }

    // (public) this^e % m, 0 <= e < 2^32
    function bnModPowInt(e,m) {
      var z;
      if(e < 256 || m.isEven()) z = new Classic(m); else z = new Montgomery(m);
      return this.exp(e,z);
    }

    // protected
    BigInteger.prototype.copyTo = bnpCopyTo;
    BigInteger.prototype.fromInt = bnpFromInt;
    BigInteger.prototype.fromString = bnpFromString;
    BigInteger.prototype.clamp = bnpClamp;
    BigInteger.prototype.dlShiftTo = bnpDLShiftTo;
    BigInteger.prototype.drShiftTo = bnpDRShiftTo;
    BigInteger.prototype.lShiftTo = bnpLShiftTo;
    BigInteger.prototype.rShiftTo = bnpRShiftTo;
    BigInteger.prototype.subTo = bnpSubTo;
    BigInteger.prototype.multiplyTo = bnpMultiplyTo;
    BigInteger.prototype.squareTo = bnpSquareTo;
    BigInteger.prototype.divRemTo = bnpDivRemTo;
    BigInteger.prototype.invDigit = bnpInvDigit;
    BigInteger.prototype.isEven = bnpIsEven;
    BigInteger.prototype.exp = bnpExp;

    // public
    BigInteger.prototype.toString = bnToString;
    BigInteger.prototype.negate = bnNegate;
    BigInteger.prototype.abs = bnAbs;
    BigInteger.prototype.compareTo = bnCompareTo;
    BigInteger.prototype.bitLength = bnBitLength;
    BigInteger.prototype.mod = bnMod;
    BigInteger.prototype.modPowInt = bnModPowInt;

    // "constants"
    BigInteger.ZERO = nbv(0);
    BigInteger.ONE = nbv(1);

    // Copyright (c) 2005-2009  Tom Wu
    // All Rights Reserved.
    // See "LICENSE" for details.

    // Extended JavaScript BN functions, required for RSA private ops.

    // Version 1.1: new BigInteger("0", 10) returns "proper" zero
    // Version 1.2: square() API, isProbablePrime fix

    // (public)
    function bnClone() { var r = nbi(); this.copyTo(r); return r; }

    // (public) return value as integer
    function bnIntValue() {
      if(this.s < 0) {
        if(this.t == 1) return this[0]-this.DV;
        else if(this.t == 0) return -1;
      }
      else if(this.t == 1) return this[0];
      else if(this.t == 0) return 0;
      // assumes 16 < DB < 32
      return ((this[1]&((1<<(32-this.DB))-1))<<this.DB)|this[0];
    }

    // (public) return value as byte
    function bnByteValue() { return (this.t==0)?this.s:(this[0]<<24)>>24; }

    // (public) return value as short (assumes DB>=16)
    function bnShortValue() { return (this.t==0)?this.s:(this[0]<<16)>>16; }

    // (protected) return x s.t. r^x < DV
    function bnpChunkSize(r) { return Math.floor(Math.LN2*this.DB/Math.log(r)); }

    // (public) 0 if this == 0, 1 if this > 0
    function bnSigNum() {
      if(this.s < 0) return -1;
      else if(this.t <= 0 || (this.t == 1 && this[0] <= 0)) return 0;
      else return 1;
    }

    // (protected) convert to radix string
    function bnpToRadix(b) {
      if(b == null) b = 10;
      if(this.signum() == 0 || b < 2 || b > 36) return "0";
      var cs = this.chunkSize(b);
      var a = Math.pow(b,cs);
      var d = nbv(a), y = nbi(), z = nbi(), r = "";
      this.divRemTo(d,y,z);
      while(y.signum() > 0) {
        r = (a+z.intValue()).toString(b).substr(1) + r;
        y.divRemTo(d,y,z);
      }
      return z.intValue().toString(b) + r;
    }

    // (protected) convert from radix string
    function bnpFromRadix(s,b) {
      this.fromInt(0);
      if(b == null) b = 10;
      var cs = this.chunkSize(b);
      var d = Math.pow(b,cs), mi = false, j = 0, w = 0;
      for(var i = 0; i < s.length; ++i) {
        var x = intAt(s,i);
        if(x < 0) {
          if(s.charAt(i) == "-" && this.signum() == 0) mi = true;
          continue;
        }
        w = b*w+x;
        if(++j >= cs) {
          this.dMultiply(d);
          this.dAddOffset(w,0);
          j = 0;
          w = 0;
        }
      }
      if(j > 0) {
        this.dMultiply(Math.pow(b,j));
        this.dAddOffset(w,0);
      }
      if(mi) BigInteger.ZERO.subTo(this,this);
    }

    // (protected) alternate constructor
    function bnpFromNumber(a,b,c) {
      if("number" == typeof b) {
        // new BigInteger(int,int,RNG)
        if(a < 2) this.fromInt(1);
        else {
          this.fromNumber(a,c);
          if(!this.testBit(a-1))    // force MSB set
            this.bitwiseTo(BigInteger.ONE.shiftLeft(a-1),op_or,this);
          if(this.isEven()) this.dAddOffset(1,0); // force odd
          while(!this.isProbablePrime(b)) {
            this.dAddOffset(2,0);
            if(this.bitLength() > a) this.subTo(BigInteger.ONE.shiftLeft(a-1),this);
          }
        }
      }
      else {
        // new BigInteger(int,RNG)
        var x = new Array(), t = a&7;
        x.length = (a>>3)+1;
        b.nextBytes(x);
        if(t > 0) x[0] &= ((1<<t)-1); else x[0] = 0;
        this.fromString(x,256);
      }
    }

    // (public) convert to bigendian byte array
    function bnToByteArray() {
      var i = this.t, r = new Array();
      r[0] = this.s;
      var p = this.DB-(i*this.DB)%8, d, k = 0;
      if(i-- > 0) {
        if(p < this.DB && (d = this[i]>>p) != (this.s&this.DM)>>p)
          r[k++] = d|(this.s<<(this.DB-p));
        while(i >= 0) {
          if(p < 8) {
            d = (this[i]&((1<<p)-1))<<(8-p);
            d |= this[--i]>>(p+=this.DB-8);
          }
          else {
            d = (this[i]>>(p-=8))&0xff;
            if(p <= 0) { p += this.DB; --i; }
          }
          if((d&0x80) != 0) d |= -256;
          if(k == 0 && (this.s&0x80) != (d&0x80)) ++k;
          if(k > 0 || d != this.s) r[k++] = d;
        }
      }
      return r;
    }

    function bnEquals(a) { return(this.compareTo(a)==0); }
    function bnMin(a) { return(this.compareTo(a)<0)?this:a; }
    function bnMax(a) { return(this.compareTo(a)>0)?this:a; }

    // (protected) r = this op a (bitwise)
    function bnpBitwiseTo(a,op,r) {
      var i, f, m = Math.min(a.t,this.t);
      for(i = 0; i < m; ++i) r[i] = op(this[i],a[i]);
      if(a.t < this.t) {
        f = a.s&this.DM;
        for(i = m; i < this.t; ++i) r[i] = op(this[i],f);
        r.t = this.t;
      }
      else {
        f = this.s&this.DM;
        for(i = m; i < a.t; ++i) r[i] = op(f,a[i]);
        r.t = a.t;
      }
      r.s = op(this.s,a.s);
      r.clamp();
    }

    // (public) this & a
    function op_and(x,y) { return x&y; }
    function bnAnd(a) { var r = nbi(); this.bitwiseTo(a,op_and,r); return r; }

    // (public) this | a
    function op_or(x,y) { return x|y; }
    function bnOr(a) { var r = nbi(); this.bitwiseTo(a,op_or,r); return r; }

    // (public) this ^ a
    function op_xor(x,y) { return x^y; }
    function bnXor(a) { var r = nbi(); this.bitwiseTo(a,op_xor,r); return r; }

    // (public) this & ~a
    function op_andnot(x,y) { return x&~y; }
    function bnAndNot(a) { var r = nbi(); this.bitwiseTo(a,op_andnot,r); return r; }

    // (public) ~this
    function bnNot() {
      var r = nbi();
      for(var i = 0; i < this.t; ++i) r[i] = this.DM&~this[i];
      r.t = this.t;
      r.s = ~this.s;
      return r;
    }

    // (public) this << n
    function bnShiftLeft(n) {
      var r = nbi();
      if(n < 0) this.rShiftTo(-n,r); else this.lShiftTo(n,r);
      return r;
    }

    // (public) this >> n
    function bnShiftRight(n) {
      var r = nbi();
      if(n < 0) this.lShiftTo(-n,r); else this.rShiftTo(n,r);
      return r;
    }

    // return index of lowest 1-bit in x, x < 2^31
    function lbit(x) {
      if(x == 0) return -1;
      var r = 0;
      if((x&0xffff) == 0) { x >>= 16; r += 16; }
      if((x&0xff) == 0) { x >>= 8; r += 8; }
      if((x&0xf) == 0) { x >>= 4; r += 4; }
      if((x&3) == 0) { x >>= 2; r += 2; }
      if((x&1) == 0) ++r;
      return r;
    }

    // (public) returns index of lowest 1-bit (or -1 if none)
    function bnGetLowestSetBit() {
      for(var i = 0; i < this.t; ++i)
        if(this[i] != 0) return i*this.DB+lbit(this[i]);
      if(this.s < 0) return this.t*this.DB;
      return -1;
    }

    // return number of 1 bits in x
    function cbit(x) {
      var r = 0;
      while(x != 0) { x &= x-1; ++r; }
      return r;
    }

    // (public) return number of set bits
    function bnBitCount() {
      var r = 0, x = this.s&this.DM;
      for(var i = 0; i < this.t; ++i) r += cbit(this[i]^x);
      return r;
    }

    // (public) true iff nth bit is set
    function bnTestBit(n) {
      var j = Math.floor(n/this.DB);
      if(j >= this.t) return(this.s!=0);
      return((this[j]&(1<<(n%this.DB)))!=0);
    }

    // (protected) this op (1<<n)
    function bnpChangeBit(n,op) {
      var r = BigInteger.ONE.shiftLeft(n);
      this.bitwiseTo(r,op,r);
      return r;
    }

    // (public) this | (1<<n)
    function bnSetBit(n) { return this.changeBit(n,op_or); }

    // (public) this & ~(1<<n)
    function bnClearBit(n) { return this.changeBit(n,op_andnot); }

    // (public) this ^ (1<<n)
    function bnFlipBit(n) { return this.changeBit(n,op_xor); }

    // (protected) r = this + a
    function bnpAddTo(a,r) {
      var i = 0, c = 0, m = Math.min(a.t,this.t);
      while(i < m) {
        c += this[i]+a[i];
        r[i++] = c&this.DM;
        c >>= this.DB;
      }
      if(a.t < this.t) {
        c += a.s;
        while(i < this.t) {
          c += this[i];
          r[i++] = c&this.DM;
          c >>= this.DB;
        }
        c += this.s;
      }
      else {
        c += this.s;
        while(i < a.t) {
          c += a[i];
          r[i++] = c&this.DM;
          c >>= this.DB;
        }
        c += a.s;
      }
      r.s = (c<0)?-1:0;
      if(c > 0) r[i++] = c;
      else if(c < -1) r[i++] = this.DV+c;
      r.t = i;
      r.clamp();
    }

    // (public) this + a
    function bnAdd(a) { var r = nbi(); this.addTo(a,r); return r; }

    // (public) this - a
    function bnSubtract(a) { var r = nbi(); this.subTo(a,r); return r; }

    // (public) this * a
    function bnMultiply(a) { var r = nbi(); this.multiplyTo(a,r); return r; }

    // (public) this^2
    function bnSquare() { var r = nbi(); this.squareTo(r); return r; }

    // (public) this / a
    function bnDivide(a) { var r = nbi(); this.divRemTo(a,r,null); return r; }

    // (public) this % a
    function bnRemainder(a) { var r = nbi(); this.divRemTo(a,null,r); return r; }

    // (public) [this/a,this%a]
    function bnDivideAndRemainder(a) {
      var q = nbi(), r = nbi();
      this.divRemTo(a,q,r);
      return new Array(q,r);
    }

    // (protected) this *= n, this >= 0, 1 < n < DV
    function bnpDMultiply(n) {
      this[this.t] = this.am(0,n-1,this,0,0,this.t);
      ++this.t;
      this.clamp();
    }

    // (protected) this += n << w words, this >= 0
    function bnpDAddOffset(n,w) {
      if(n == 0) return;
      while(this.t <= w) this[this.t++] = 0;
      this[w] += n;
      while(this[w] >= this.DV) {
        this[w] -= this.DV;
        if(++w >= this.t) this[this.t++] = 0;
        ++this[w];
      }
    }

    // A "null" reducer
    function NullExp() {}
    function nNop(x) { return x; }
    function nMulTo(x,y,r) { x.multiplyTo(y,r); }
    function nSqrTo(x,r) { x.squareTo(r); }

    NullExp.prototype.convert = nNop;
    NullExp.prototype.revert = nNop;
    NullExp.prototype.mulTo = nMulTo;
    NullExp.prototype.sqrTo = nSqrTo;

    // (public) this^e
    function bnPow(e) { return this.exp(e,new NullExp()); }

    // (protected) r = lower n words of "this * a", a.t <= n
    // "this" should be the larger one if appropriate.
    function bnpMultiplyLowerTo(a,n,r) {
      var i = Math.min(this.t+a.t,n);
      r.s = 0; // assumes a,this >= 0
      r.t = i;
      while(i > 0) r[--i] = 0;
      var j;
      for(j = r.t-this.t; i < j; ++i) r[i+this.t] = this.am(0,a[i],r,i,0,this.t);
      for(j = Math.min(a.t,n); i < j; ++i) this.am(0,a[i],r,i,0,n-i);
      r.clamp();
    }

    // (protected) r = "this * a" without lower n words, n > 0
    // "this" should be the larger one if appropriate.
    function bnpMultiplyUpperTo(a,n,r) {
      --n;
      var i = r.t = this.t+a.t-n;
      r.s = 0; // assumes a,this >= 0
      while(--i >= 0) r[i] = 0;
      for(i = Math.max(n-this.t,0); i < a.t; ++i)
        r[this.t+i-n] = this.am(n-i,a[i],r,0,0,this.t+i-n);
      r.clamp();
      r.drShiftTo(1,r);
    }

    // Barrett modular reduction
    function Barrett(m) {
      // setup Barrett
      this.r2 = nbi();
      this.q3 = nbi();
      BigInteger.ONE.dlShiftTo(2*m.t,this.r2);
      this.mu = this.r2.divide(m);
      this.m = m;
    }

    function barrettConvert(x) {
      if(x.s < 0 || x.t > 2*this.m.t) return x.mod(this.m);
      else if(x.compareTo(this.m) < 0) return x;
      else { var r = nbi(); x.copyTo(r); this.reduce(r); return r; }
    }

    function barrettRevert(x) { return x; }

    // x = x mod m (HAC 14.42)
    function barrettReduce(x) {
      x.drShiftTo(this.m.t-1,this.r2);
      if(x.t > this.m.t+1) { x.t = this.m.t+1; x.clamp(); }
      this.mu.multiplyUpperTo(this.r2,this.m.t+1,this.q3);
      this.m.multiplyLowerTo(this.q3,this.m.t+1,this.r2);
      while(x.compareTo(this.r2) < 0) x.dAddOffset(1,this.m.t+1);
      x.subTo(this.r2,x);
      while(x.compareTo(this.m) >= 0) x.subTo(this.m,x);
    }

    // r = x^2 mod m; x != r
    function barrettSqrTo(x,r) { x.squareTo(r); this.reduce(r); }

    // r = x*y mod m; x,y != r
    function barrettMulTo(x,y,r) { x.multiplyTo(y,r); this.reduce(r); }

    Barrett.prototype.convert = barrettConvert;
    Barrett.prototype.revert = barrettRevert;
    Barrett.prototype.reduce = barrettReduce;
    Barrett.prototype.mulTo = barrettMulTo;
    Barrett.prototype.sqrTo = barrettSqrTo;

    // (public) this^e % m (HAC 14.85)
    function bnModPow(e,m) {
      var i = e.bitLength(), k, r = nbv(1), z;
      if(i <= 0) return r;
      else if(i < 18) k = 1;
      else if(i < 48) k = 3;
      else if(i < 144) k = 4;
      else if(i < 768) k = 5;
      else k = 6;
      if(i < 8)
        z = new Classic(m);
      else if(m.isEven())
        z = new Barrett(m);
      else
        z = new Montgomery(m);

      // precomputation
      var g = new Array(), n = 3, k1 = k-1, km = (1<<k)-1;
      g[1] = z.convert(this);
      if(k > 1) {
        var g2 = nbi();
        z.sqrTo(g[1],g2);
        while(n <= km) {
          g[n] = nbi();
          z.mulTo(g2,g[n-2],g[n]);
          n += 2;
        }
      }

      var j = e.t-1, w, is1 = true, r2 = nbi(), t;
      i = nbits(e[j])-1;
      while(j >= 0) {
        if(i >= k1) w = (e[j]>>(i-k1))&km;
        else {
          w = (e[j]&((1<<(i+1))-1))<<(k1-i);
          if(j > 0) w |= e[j-1]>>(this.DB+i-k1);
        }

        n = k;
        while((w&1) == 0) { w >>= 1; --n; }
        if((i -= n) < 0) { i += this.DB; --j; }
        if(is1) {    // ret == 1, don't bother squaring or multiplying it
          g[w].copyTo(r);
          is1 = false;
        }
        else {
          while(n > 1) { z.sqrTo(r,r2); z.sqrTo(r2,r); n -= 2; }
          if(n > 0) z.sqrTo(r,r2); else { t = r; r = r2; r2 = t; }
          z.mulTo(r2,g[w],r);
        }

        while(j >= 0 && (e[j]&(1<<i)) == 0) {
          z.sqrTo(r,r2); t = r; r = r2; r2 = t;
          if(--i < 0) { i = this.DB-1; --j; }
        }
      }
      return z.revert(r);
    }

    // (public) gcd(this,a) (HAC 14.54)
    function bnGCD(a) {
      var x = (this.s<0)?this.negate():this.clone();
      var y = (a.s<0)?a.negate():a.clone();
      if(x.compareTo(y) < 0) { var t = x; x = y; y = t; }
      var i = x.getLowestSetBit(), g = y.getLowestSetBit();
      if(g < 0) return x;
      if(i < g) g = i;
      if(g > 0) {
        x.rShiftTo(g,x);
        y.rShiftTo(g,y);
      }
      while(x.signum() > 0) {
        if((i = x.getLowestSetBit()) > 0) x.rShiftTo(i,x);
        if((i = y.getLowestSetBit()) > 0) y.rShiftTo(i,y);
        if(x.compareTo(y) >= 0) {
          x.subTo(y,x);
          x.rShiftTo(1,x);
        }
        else {
          y.subTo(x,y);
          y.rShiftTo(1,y);
        }
      }
      if(g > 0) y.lShiftTo(g,y);
      return y;
    }

    // (protected) this % n, n < 2^26
    function bnpModInt(n) {
      if(n <= 0) return 0;
      var d = this.DV%n, r = (this.s<0)?n-1:0;
      if(this.t > 0)
        if(d == 0) r = this[0]%n;
        else for(var i = this.t-1; i >= 0; --i) r = (d*r+this[i])%n;
      return r;
    }

    // (public) 1/this % m (HAC 14.61)
    function bnModInverse(m) {
      var ac = m.isEven();
      if((this.isEven() && ac) || m.signum() == 0) return BigInteger.ZERO;
      var u = m.clone(), v = this.clone();
      var a = nbv(1), b = nbv(0), c = nbv(0), d = nbv(1);
      while(u.signum() != 0) {
        while(u.isEven()) {
          u.rShiftTo(1,u);
          if(ac) {
            if(!a.isEven() || !b.isEven()) { a.addTo(this,a); b.subTo(m,b); }
            a.rShiftTo(1,a);
          }
          else if(!b.isEven()) b.subTo(m,b);
          b.rShiftTo(1,b);
        }
        while(v.isEven()) {
          v.rShiftTo(1,v);
          if(ac) {
            if(!c.isEven() || !d.isEven()) { c.addTo(this,c); d.subTo(m,d); }
            c.rShiftTo(1,c);
          }
          else if(!d.isEven()) d.subTo(m,d);
          d.rShiftTo(1,d);
        }
        if(u.compareTo(v) >= 0) {
          u.subTo(v,u);
          if(ac) a.subTo(c,a);
          b.subTo(d,b);
        }
        else {
          v.subTo(u,v);
          if(ac) c.subTo(a,c);
          d.subTo(b,d);
        }
      }
      if(v.compareTo(BigInteger.ONE) != 0) return BigInteger.ZERO;
      if(d.compareTo(m) >= 0) return d.subtract(m);
      if(d.signum() < 0) d.addTo(m,d); else return d;
      if(d.signum() < 0) return d.add(m); else return d;
    }

    var lowprimes = [2,3,5,7,11,13,17,19,23,29,31,37,41,43,47,53,59,61,67,71,73,79,83,89,97,101,103,107,109,113,127,131,137,139,149,151,157,163,167,173,179,181,191,193,197,199,211,223,227,229,233,239,241,251,257,263,269,271,277,281,283,293,307,311,313,317,331,337,347,349,353,359,367,373,379,383,389,397,401,409,419,421,431,433,439,443,449,457,461,463,467,479,487,491,499,503,509,521,523,541,547,557,563,569,571,577,587,593,599,601,607,613,617,619,631,641,643,647,653,659,661,673,677,683,691,701,709,719,727,733,739,743,751,757,761,769,773,787,797,809,811,821,823,827,829,839,853,857,859,863,877,881,883,887,907,911,919,929,937,941,947,953,967,971,977,983,991,997];
    var lplim = (1<<26)/lowprimes[lowprimes.length-1];

    // (public) test primality with certainty >= 1-.5^t
    function bnIsProbablePrime(t) {
      var i, x = this.abs();
      if(x.t == 1 && x[0] <= lowprimes[lowprimes.length-1]) {
        for(i = 0; i < lowprimes.length; ++i)
          if(x[0] == lowprimes[i]) return true;
        return false;
      }
      if(x.isEven()) return false;
      i = 1;
      while(i < lowprimes.length) {
        var m = lowprimes[i], j = i+1;
        while(j < lowprimes.length && m < lplim) m *= lowprimes[j++];
        m = x.modInt(m);
        while(i < j) if(m%lowprimes[i++] == 0) return false;
      }
      return x.millerRabin(t);
    }

    // (protected) true if probably prime (HAC 4.24, Miller-Rabin)
    function bnpMillerRabin(t) {
      var n1 = this.subtract(BigInteger.ONE);
      var k = n1.getLowestSetBit();
      if(k <= 0) return false;
      var r = n1.shiftRight(k);
      t = (t+1)>>1;
      if(t > lowprimes.length) t = lowprimes.length;
      var a = nbi();
      for(var i = 0; i < t; ++i) {
        //Pick bases at random, instead of starting at 2
        a.fromInt(lowprimes[Math.floor(Math.random()*lowprimes.length)]);
        var y = a.modPow(r,this);
        if(y.compareTo(BigInteger.ONE) != 0 && y.compareTo(n1) != 0) {
          var j = 1;
          while(j++ < k && y.compareTo(n1) != 0) {
            y = y.modPowInt(2,this);
            if(y.compareTo(BigInteger.ONE) == 0) return false;
          }
          if(y.compareTo(n1) != 0) return false;
        }
      }
      return true;
    }

    // protected
    BigInteger.prototype.chunkSize = bnpChunkSize;
    BigInteger.prototype.toRadix = bnpToRadix;
    BigInteger.prototype.fromRadix = bnpFromRadix;
    BigInteger.prototype.fromNumber = bnpFromNumber;
    BigInteger.prototype.bitwiseTo = bnpBitwiseTo;
    BigInteger.prototype.changeBit = bnpChangeBit;
    BigInteger.prototype.addTo = bnpAddTo;
    BigInteger.prototype.dMultiply = bnpDMultiply;
    BigInteger.prototype.dAddOffset = bnpDAddOffset;
    BigInteger.prototype.multiplyLowerTo = bnpMultiplyLowerTo;
    BigInteger.prototype.multiplyUpperTo = bnpMultiplyUpperTo;
    BigInteger.prototype.modInt = bnpModInt;
    BigInteger.prototype.millerRabin = bnpMillerRabin;

    // public
    BigInteger.prototype.clone = bnClone;
    BigInteger.prototype.intValue = bnIntValue;
    BigInteger.prototype.byteValue = bnByteValue;
    BigInteger.prototype.shortValue = bnShortValue;
    BigInteger.prototype.signum = bnSigNum;
    BigInteger.prototype.toByteArray = bnToByteArray;
    BigInteger.prototype.equals = bnEquals;
    BigInteger.prototype.min = bnMin;
    BigInteger.prototype.max = bnMax;
    BigInteger.prototype.and = bnAnd;
    BigInteger.prototype.or = bnOr;
    BigInteger.prototype.xor = bnXor;
    BigInteger.prototype.andNot = bnAndNot;
    BigInteger.prototype.not = bnNot;
    BigInteger.prototype.shiftLeft = bnShiftLeft;
    BigInteger.prototype.shiftRight = bnShiftRight;
    BigInteger.prototype.getLowestSetBit = bnGetLowestSetBit;
    BigInteger.prototype.bitCount = bnBitCount;
    BigInteger.prototype.testBit = bnTestBit;
    BigInteger.prototype.setBit = bnSetBit;
    BigInteger.prototype.clearBit = bnClearBit;
    BigInteger.prototype.flipBit = bnFlipBit;
    BigInteger.prototype.add = bnAdd;
    BigInteger.prototype.subtract = bnSubtract;
    BigInteger.prototype.multiply = bnMultiply;
    BigInteger.prototype.divide = bnDivide;
    BigInteger.prototype.remainder = bnRemainder;
    BigInteger.prototype.divideAndRemainder = bnDivideAndRemainder;
    BigInteger.prototype.modPow = bnModPow;
    BigInteger.prototype.modInverse = bnModInverse;
    BigInteger.prototype.pow = bnPow;
    BigInteger.prototype.gcd = bnGCD;
    BigInteger.prototype.isProbablePrime = bnIsProbablePrime;

    // JSBN-specific extension
    BigInteger.prototype.square = bnSquare;

    // Expose the Barrett function
    BigInteger.prototype.Barrett = Barrett

    // BigInteger interfaces not implemented in jsbn:

    // BigInteger(int signum, byte[] magnitude)
    // double doubleValue()
    // float floatValue()
    // int hashCode()
    // long longValue()
    // static BigInteger valueOf(long val)

    // Random number generator - requires a PRNG backend, e.g. prng4.js

    // For best results, put code like
    // <body onClick='rng_seed_time();' onKeyPress='rng_seed_time();'>
    // in your main HTML document.

    var rng_state;
    var rng_pool;
    var rng_pptr;

    // Mix in a 32-bit integer into the pool
    function rng_seed_int(x) {
      rng_pool[rng_pptr++] ^= x & 255;
      rng_pool[rng_pptr++] ^= (x >> 8) & 255;
      rng_pool[rng_pptr++] ^= (x >> 16) & 255;
      rng_pool[rng_pptr++] ^= (x >> 24) & 255;
      if(rng_pptr >= rng_psize) rng_pptr -= rng_psize;
    }

    // Mix in the current time (w/milliseconds) into the pool
    function rng_seed_time() {
      rng_seed_int(new Date().getTime());
    }

    // Initialize the pool with junk if needed.
    if(rng_pool == null) {
      rng_pool = new Array();
      rng_pptr = 0;
      var t;
      if(typeof window !== "undefined" && window.crypto) {
        if (window.crypto.getRandomValues) {
          // Use webcrypto if available
          var ua = new Uint8Array(32);
          window.crypto.getRandomValues(ua);
          for(t = 0; t < 32; ++t)
            rng_pool[rng_pptr++] = ua[t];
        }
        else if(navigator.appName == "Netscape" && navigator.appVersion < "5") {
          // Extract entropy (256 bits) from NS4 RNG if available
          var z = window.crypto.random(32);
          for(t = 0; t < z.length; ++t)
            rng_pool[rng_pptr++] = z.charCodeAt(t) & 255;
        }
      }
      while(rng_pptr < rng_psize) {  // extract some randomness from Math.random()
        t = Math.floor(65536 * Math.random());
        rng_pool[rng_pptr++] = t >>> 8;
        rng_pool[rng_pptr++] = t & 255;
      }
      rng_pptr = 0;
      rng_seed_time();
      //rng_seed_int(window.screenX);
      //rng_seed_int(window.screenY);
    }

    function rng_get_byte() {
      if(rng_state == null) {
        rng_seed_time();
        rng_state = prng_newstate();
        rng_state.init(rng_pool);
        for(rng_pptr = 0; rng_pptr < rng_pool.length; ++rng_pptr)
          rng_pool[rng_pptr] = 0;
        rng_pptr = 0;
        //rng_pool = null;
      }
      // TODO: allow reseeding after first request
      return rng_state.next();
    }

    function rng_get_bytes(ba) {
      var i;
      for(i = 0; i < ba.length; ++i) ba[i] = rng_get_byte();
    }

    function SecureRandom() {}

    SecureRandom.prototype.nextBytes = rng_get_bytes;

    // prng4.js - uses Arcfour as a PRNG

    function Arcfour() {
      this.i = 0;
      this.j = 0;
      this.S = new Array();
    }

    // Initialize arcfour context from key, an array of ints, each from [0..255]
    function ARC4init(key) {
      var i, j, t;
      for(i = 0; i < 256; ++i)
        this.S[i] = i;
      j = 0;
      for(i = 0; i < 256; ++i) {
        j = (j + this.S[i] + key[i % key.length]) & 255;
        t = this.S[i];
        this.S[i] = this.S[j];
        this.S[j] = t;
      }
      this.i = 0;
      this.j = 0;
    }

    function ARC4next() {
      var t;
      this.i = (this.i + 1) & 255;
      this.j = (this.j + this.S[this.i]) & 255;
      t = this.S[this.i];
      this.S[this.i] = this.S[this.j];
      this.S[this.j] = t;
      return this.S[(t + this.S[this.i]) & 255];
    }

    Arcfour.prototype.init = ARC4init;
    Arcfour.prototype.next = ARC4next;

    // Plug in your RNG constructor here
    function prng_newstate() {
      return new Arcfour();
    }

    // Pool size must be a multiple of 4 and greater than 32.
    // An array of bytes the size of the pool will be passed to init()
    var rng_psize = 256;

    if (typeof exports !== 'undefined') {
        exports = module.exports = {
            default: BigInteger,
            BigInteger: BigInteger,
            SecureRandom: SecureRandom,
        };
    } else {
        this.jsbn = {
          BigInteger: BigInteger,
          SecureRandom: SecureRandom
        };
    }

}).call(this);

},{}],14:[function(require,module,exports){
(function (global){
/*! *****************************************************************************
Copyright (c) Microsoft Corporation. All rights reserved.
Licensed under the Apache License, Version 2.0 (the "License"); you may not use
this file except in compliance with the License. You may obtain a copy of the
License at http://www.apache.org/licenses/LICENSE-2.0

THIS CODE IS PROVIDED ON AN *AS IS* BASIS, WITHOUT WARRANTIES OR CONDITIONS OF ANY
KIND, EITHER EXPRESS OR IMPLIED, INCLUDING WITHOUT LIMITATION ANY IMPLIED
WARRANTIES OR CONDITIONS OF TITLE, FITNESS FOR A PARTICULAR PURPOSE,
MERCHANTABLITY OR NON-INFRINGEMENT.

See the Apache Version 2.0 License for specific language governing permissions
and limitations under the License.
***************************************************************************** */
/* global global, define, System, Reflect, Promise */
var __extends;
var __assign;
var __rest;
var __decorate;
var __param;
var __metadata;
var __awaiter;
var __generator;
var __exportStar;
var __values;
var __read;
var __spread;
var __spreadArrays;
var __await;
var __asyncGenerator;
var __asyncDelegator;
var __asyncValues;
var __makeTemplateObject;
var __importStar;
var __importDefault;
(function (factory) {
    var root = typeof global === "object" ? global : typeof self === "object" ? self : typeof this === "object" ? this : {};
    if (typeof define === "function" && define.amd) {
        define("tslib", ["exports"], function (exports) { factory(createExporter(root, createExporter(exports))); });
    }
    else if (typeof module === "object" && typeof module.exports === "object") {
        factory(createExporter(root, createExporter(module.exports)));
    }
    else {
        factory(createExporter(root));
    }
    function createExporter(exports, previous) {
        if (exports !== root) {
            if (typeof Object.create === "function") {
                Object.defineProperty(exports, "__esModule", { value: true });
            }
            else {
                exports.__esModule = true;
            }
        }
        return function (id, v) { return exports[id] = previous ? previous(id, v) : v; };
    }
})
(function (exporter) {
    var extendStatics = Object.setPrototypeOf ||
        ({ __proto__: [] } instanceof Array && function (d, b) { d.__proto__ = b; }) ||
        function (d, b) { for (var p in b) if (b.hasOwnProperty(p)) d[p] = b[p]; };

    __extends = function (d, b) {
        extendStatics(d, b);
        function __() { this.constructor = d; }
        d.prototype = b === null ? Object.create(b) : (__.prototype = b.prototype, new __());
    };

    __assign = Object.assign || function (t) {
        for (var s, i = 1, n = arguments.length; i < n; i++) {
            s = arguments[i];
            for (var p in s) if (Object.prototype.hasOwnProperty.call(s, p)) t[p] = s[p];
        }
        return t;
    };

    __rest = function (s, e) {
        var t = {};
        for (var p in s) if (Object.prototype.hasOwnProperty.call(s, p) && e.indexOf(p) < 0)
            t[p] = s[p];
        if (s != null && typeof Object.getOwnPropertySymbols === "function")
            for (var i = 0, p = Object.getOwnPropertySymbols(s); i < p.length; i++) {
                if (e.indexOf(p[i]) < 0 && Object.prototype.propertyIsEnumerable.call(s, p[i]))
                    t[p[i]] = s[p[i]];
            }
        return t;
    };

    __decorate = function (decorators, target, key, desc) {
        var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
        if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
        else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
        return c > 3 && r && Object.defineProperty(target, key, r), r;
    };

    __param = function (paramIndex, decorator) {
        return function (target, key) { decorator(target, key, paramIndex); }
    };

    __metadata = function (metadataKey, metadataValue) {
        if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(metadataKey, metadataValue);
    };

    __awaiter = function (thisArg, _arguments, P, generator) {
        return new (P || (P = Promise))(function (resolve, reject) {
            function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
            function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
            function step(result) { result.done ? resolve(result.value) : new P(function (resolve) { resolve(result.value); }).then(fulfilled, rejected); }
            step((generator = generator.apply(thisArg, _arguments || [])).next());
        });
    };

    __generator = function (thisArg, body) {
        var _ = { label: 0, sent: function() { if (t[0] & 1) throw t[1]; return t[1]; }, trys: [], ops: [] }, f, y, t, g;
        return g = { next: verb(0), "throw": verb(1), "return": verb(2) }, typeof Symbol === "function" && (g[Symbol.iterator] = function() { return this; }), g;
        function verb(n) { return function (v) { return step([n, v]); }; }
        function step(op) {
            if (f) throw new TypeError("Generator is already executing.");
            while (_) try {
                if (f = 1, y && (t = op[0] & 2 ? y["return"] : op[0] ? y["throw"] || ((t = y["return"]) && t.call(y), 0) : y.next) && !(t = t.call(y, op[1])).done) return t;
                if (y = 0, t) op = [op[0] & 2, t.value];
                switch (op[0]) {
                    case 0: case 1: t = op; break;
                    case 4: _.label++; return { value: op[1], done: false };
                    case 5: _.label++; y = op[1]; op = [0]; continue;
                    case 7: op = _.ops.pop(); _.trys.pop(); continue;
                    default:
                        if (!(t = _.trys, t = t.length > 0 && t[t.length - 1]) && (op[0] === 6 || op[0] === 2)) { _ = 0; continue; }
                        if (op[0] === 3 && (!t || (op[1] > t[0] && op[1] < t[3]))) { _.label = op[1]; break; }
                        if (op[0] === 6 && _.label < t[1]) { _.label = t[1]; t = op; break; }
                        if (t && _.label < t[2]) { _.label = t[2]; _.ops.push(op); break; }
                        if (t[2]) _.ops.pop();
                        _.trys.pop(); continue;
                }
                op = body.call(thisArg, _);
            } catch (e) { op = [6, e]; y = 0; } finally { f = t = 0; }
            if (op[0] & 5) throw op[1]; return { value: op[0] ? op[1] : void 0, done: true };
        }
    };

    __exportStar = function (m, exports) {
        for (var p in m) if (!exports.hasOwnProperty(p)) exports[p] = m[p];
    };

    __values = function (o) {
        var m = typeof Symbol === "function" && o[Symbol.iterator], i = 0;
        if (m) return m.call(o);
        return {
            next: function () {
                if (o && i >= o.length) o = void 0;
                return { value: o && o[i++], done: !o };
            }
        };
    };

    __read = function (o, n) {
        var m = typeof Symbol === "function" && o[Symbol.iterator];
        if (!m) return o;
        var i = m.call(o), r, ar = [], e;
        try {
            while ((n === void 0 || n-- > 0) && !(r = i.next()).done) ar.push(r.value);
        }
        catch (error) { e = { error: error }; }
        finally {
            try {
                if (r && !r.done && (m = i["return"])) m.call(i);
            }
            finally { if (e) throw e.error; }
        }
        return ar;
    };

    __spread = function () {
        for (var ar = [], i = 0; i < arguments.length; i++)
            ar = ar.concat(__read(arguments[i]));
        return ar;
    };

    __spreadArrays = function () {
        for (var s = 0, i = 0, il = arguments.length; i < il; i++) s += arguments[i].length;
        for (var r = Array(s), k = 0, i = 0; i < il; i++)
            for (var a = arguments[i], j = 0, jl = a.length; j < jl; j++, k++)
                r[k] = a[j];
        return r;
    };

    __await = function (v) {
        return this instanceof __await ? (this.v = v, this) : new __await(v);
    };

    __asyncGenerator = function (thisArg, _arguments, generator) {
        if (!Symbol.asyncIterator) throw new TypeError("Symbol.asyncIterator is not defined.");
        var g = generator.apply(thisArg, _arguments || []), i, q = [];
        return i = {}, verb("next"), verb("throw"), verb("return"), i[Symbol.asyncIterator] = function () { return this; }, i;
        function verb(n) { if (g[n]) i[n] = function (v) { return new Promise(function (a, b) { q.push([n, v, a, b]) > 1 || resume(n, v); }); }; }
        function resume(n, v) { try { step(g[n](v)); } catch (e) { settle(q[0][3], e); } }
        function step(r) { r.value instanceof __await ? Promise.resolve(r.value.v).then(fulfill, reject) : settle(q[0][2], r);  }
        function fulfill(value) { resume("next", value); }
        function reject(value) { resume("throw", value); }
        function settle(f, v) { if (f(v), q.shift(), q.length) resume(q[0][0], q[0][1]); }
    };

    __asyncDelegator = function (o) {
        var i, p;
        return i = {}, verb("next"), verb("throw", function (e) { throw e; }), verb("return"), i[Symbol.iterator] = function () { return this; }, i;
        function verb(n, f) { i[n] = o[n] ? function (v) { return (p = !p) ? { value: __await(o[n](v)), done: n === "return" } : f ? f(v) : v; } : f; }
    };

    __asyncValues = function (o) {
        if (!Symbol.asyncIterator) throw new TypeError("Symbol.asyncIterator is not defined.");
        var m = o[Symbol.asyncIterator], i;
        return m ? m.call(o) : (o = typeof __values === "function" ? __values(o) : o[Symbol.iterator](), i = {}, verb("next"), verb("throw"), verb("return"), i[Symbol.asyncIterator] = function () { return this; }, i);
        function verb(n) { i[n] = o[n] && function (v) { return new Promise(function (resolve, reject) { v = o[n](v), settle(resolve, reject, v.done, v.value); }); }; }
        function settle(resolve, reject, d, v) { Promise.resolve(v).then(function(v) { resolve({ value: v, done: d }); }, reject); }
    };

    __makeTemplateObject = function (cooked, raw) {
        if (Object.defineProperty) { Object.defineProperty(cooked, "raw", { value: raw }); } else { cooked.raw = raw; }
        return cooked;
    };

    __importStar = function (mod) {
        if (mod && mod.__esModule) return mod;
        var result = {};
        if (mod != null) for (var k in mod) if (Object.hasOwnProperty.call(mod, k)) result[k] = mod[k];
        result["default"] = mod;
        return result;
    };

    __importDefault = function (mod) {
        return (mod && mod.__esModule) ? mod : { "default": mod };
    };

    exporter("__extends", __extends);
    exporter("__assign", __assign);
    exporter("__rest", __rest);
    exporter("__decorate", __decorate);
    exporter("__param", __param);
    exporter("__metadata", __metadata);
    exporter("__awaiter", __awaiter);
    exporter("__generator", __generator);
    exporter("__exportStar", __exportStar);
    exporter("__values", __values);
    exporter("__read", __read);
    exporter("__spread", __spread);
    exporter("__spreadArrays", __spreadArrays);
    exporter("__await", __await);
    exporter("__asyncGenerator", __asyncGenerator);
    exporter("__asyncDelegator", __asyncDelegator);
    exporter("__asyncValues", __asyncValues);
    exporter("__makeTemplateObject", __makeTemplateObject);
    exporter("__importStar", __importStar);
    exporter("__importDefault", __importDefault);
});

}).call(this,typeof global !== "undefined" ? global : typeof self !== "undefined" ? self : typeof window !== "undefined" ? window : {})
},{}],15:[function(require,module,exports){
'use strict'

exports.byteLength = byteLength
exports.toByteArray = toByteArray
exports.fromByteArray = fromByteArray

var lookup = []
var revLookup = []
var Arr = typeof Uint8Array !== 'undefined' ? Uint8Array : Array

var code = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789+/'
for (var i = 0, len = code.length; i < len; ++i) {
  lookup[i] = code[i]
  revLookup[code.charCodeAt(i)] = i
}

// Support decoding URL-safe base64 strings, as Node.js does.
// See: https://en.wikipedia.org/wiki/Base64#URL_applications
revLookup['-'.charCodeAt(0)] = 62
revLookup['_'.charCodeAt(0)] = 63

function getLens (b64) {
  var len = b64.length

  if (len % 4 > 0) {
    throw new Error('Invalid string. Length must be a multiple of 4')
  }

  // Trim off extra bytes after placeholder bytes are found
  // See: https://github.com/beatgammit/base64-js/issues/42
  var validLen = b64.indexOf('=')
  if (validLen === -1) validLen = len

  var placeHoldersLen = validLen === len
    ? 0
    : 4 - (validLen % 4)

  return [validLen, placeHoldersLen]
}

// base64 is 4/3 + up to two characters of the original data
function byteLength (b64) {
  var lens = getLens(b64)
  var validLen = lens[0]
  var placeHoldersLen = lens[1]
  return ((validLen + placeHoldersLen) * 3 / 4) - placeHoldersLen
}

function _byteLength (b64, validLen, placeHoldersLen) {
  return ((validLen + placeHoldersLen) * 3 / 4) - placeHoldersLen
}

function toByteArray (b64) {
  var tmp
  var lens = getLens(b64)
  var validLen = lens[0]
  var placeHoldersLen = lens[1]

  var arr = new Arr(_byteLength(b64, validLen, placeHoldersLen))

  var curByte = 0

  // if there are placeholders, only get up to the last complete 4 chars
  var len = placeHoldersLen > 0
    ? validLen - 4
    : validLen

  var i
  for (i = 0; i < len; i += 4) {
    tmp =
      (revLookup[b64.charCodeAt(i)] << 18) |
      (revLookup[b64.charCodeAt(i + 1)] << 12) |
      (revLookup[b64.charCodeAt(i + 2)] << 6) |
      revLookup[b64.charCodeAt(i + 3)]
    arr[curByte++] = (tmp >> 16) & 0xFF
    arr[curByte++] = (tmp >> 8) & 0xFF
    arr[curByte++] = tmp & 0xFF
  }

  if (placeHoldersLen === 2) {
    tmp =
      (revLookup[b64.charCodeAt(i)] << 2) |
      (revLookup[b64.charCodeAt(i + 1)] >> 4)
    arr[curByte++] = tmp & 0xFF
  }

  if (placeHoldersLen === 1) {
    tmp =
      (revLookup[b64.charCodeAt(i)] << 10) |
      (revLookup[b64.charCodeAt(i + 1)] << 4) |
      (revLookup[b64.charCodeAt(i + 2)] >> 2)
    arr[curByte++] = (tmp >> 8) & 0xFF
    arr[curByte++] = tmp & 0xFF
  }

  return arr
}

function tripletToBase64 (num) {
  return lookup[num >> 18 & 0x3F] +
    lookup[num >> 12 & 0x3F] +
    lookup[num >> 6 & 0x3F] +
    lookup[num & 0x3F]
}

function encodeChunk (uint8, start, end) {
  var tmp
  var output = []
  for (var i = start; i < end; i += 3) {
    tmp =
      ((uint8[i] << 16) & 0xFF0000) +
      ((uint8[i + 1] << 8) & 0xFF00) +
      (uint8[i + 2] & 0xFF)
    output.push(tripletToBase64(tmp))
  }
  return output.join('')
}

function fromByteArray (uint8) {
  var tmp
  var len = uint8.length
  var extraBytes = len % 3 // if we have 1 byte left, pad 2 bytes
  var parts = []
  var maxChunkLength = 16383 // must be multiple of 3

  // go through the array every three bytes, we'll deal with trailing stuff later
  for (var i = 0, len2 = len - extraBytes; i < len2; i += maxChunkLength) {
    parts.push(encodeChunk(
      uint8, i, (i + maxChunkLength) > len2 ? len2 : (i + maxChunkLength)
    ))
  }

  // pad the end with zeros, but make sure to not forget the extra bytes
  if (extraBytes === 1) {
    tmp = uint8[len - 1]
    parts.push(
      lookup[tmp >> 2] +
      lookup[(tmp << 4) & 0x3F] +
      '=='
    )
  } else if (extraBytes === 2) {
    tmp = (uint8[len - 2] << 8) + uint8[len - 1]
    parts.push(
      lookup[tmp >> 10] +
      lookup[(tmp >> 4) & 0x3F] +
      lookup[(tmp << 2) & 0x3F] +
      '='
    )
  }

  return parts.join('')
}

},{}],16:[function(require,module,exports){
(function (Buffer){
/*!
 * The buffer module from node.js, for the browser.
 *
 * @author   Feross Aboukhadijeh <https://feross.org>
 * @license  MIT
 */
/* eslint-disable no-proto */

'use strict'

var base64 = require('base64-js')
var ieee754 = require('ieee754')
var customInspectSymbol =
  (typeof Symbol === 'function' && typeof Symbol.for === 'function')
    ? Symbol.for('nodejs.util.inspect.custom')
    : null

exports.Buffer = Buffer
exports.SlowBuffer = SlowBuffer
exports.INSPECT_MAX_BYTES = 50

var K_MAX_LENGTH = 0x7fffffff
exports.kMaxLength = K_MAX_LENGTH

/**
 * If `Buffer.TYPED_ARRAY_SUPPORT`:
 *   === true    Use Uint8Array implementation (fastest)
 *   === false   Print warning and recommend using `buffer` v4.x which has an Object
 *               implementation (most compatible, even IE6)
 *
 * Browsers that support typed arrays are IE 10+, Firefox 4+, Chrome 7+, Safari 5.1+,
 * Opera 11.6+, iOS 4.2+.
 *
 * We report that the browser does not support typed arrays if the are not subclassable
 * using __proto__. Firefox 4-29 lacks support for adding new properties to `Uint8Array`
 * (See: https://bugzilla.mozilla.org/show_bug.cgi?id=695438). IE 10 lacks support
 * for __proto__ and has a buggy typed array implementation.
 */
Buffer.TYPED_ARRAY_SUPPORT = typedArraySupport()

if (!Buffer.TYPED_ARRAY_SUPPORT && typeof console !== 'undefined' &&
    typeof console.error === 'function') {
  console.error(
    'This browser lacks typed array (Uint8Array) support which is required by ' +
    '`buffer` v5.x. Use `buffer` v4.x if you require old browser support.'
  )
}

function typedArraySupport () {
  // Can typed array instances can be augmented?
  try {
    var arr = new Uint8Array(1)
    var proto = { foo: function () { return 42 } }
    Object.setPrototypeOf(proto, Uint8Array.prototype)
    Object.setPrototypeOf(arr, proto)
    return arr.foo() === 42
  } catch (e) {
    return false
  }
}

Object.defineProperty(Buffer.prototype, 'parent', {
  enumerable: true,
  get: function () {
    if (!Buffer.isBuffer(this)) return undefined
    return this.buffer
  }
})

Object.defineProperty(Buffer.prototype, 'offset', {
  enumerable: true,
  get: function () {
    if (!Buffer.isBuffer(this)) return undefined
    return this.byteOffset
  }
})

function createBuffer (length) {
  if (length > K_MAX_LENGTH) {
    throw new RangeError('The value "' + length + '" is invalid for option "size"')
  }
  // Return an augmented `Uint8Array` instance
  var buf = new Uint8Array(length)
  Object.setPrototypeOf(buf, Buffer.prototype)
  return buf
}

/**
 * The Buffer constructor returns instances of `Uint8Array` that have their
 * prototype changed to `Buffer.prototype`. Furthermore, `Buffer` is a subclass of
 * `Uint8Array`, so the returned instances will have all the node `Buffer` methods
 * and the `Uint8Array` methods. Square bracket notation works as expected -- it
 * returns a single octet.
 *
 * The `Uint8Array` prototype remains unmodified.
 */

function Buffer (arg, encodingOrOffset, length) {
  // Common case.
  if (typeof arg === 'number') {
    if (typeof encodingOrOffset === 'string') {
      throw new TypeError(
        'The "string" argument must be of type string. Received type number'
      )
    }
    return allocUnsafe(arg)
  }
  return from(arg, encodingOrOffset, length)
}

// Fix subarray() in ES2016. See: https://github.com/feross/buffer/pull/97
if (typeof Symbol !== 'undefined' && Symbol.species != null &&
    Buffer[Symbol.species] === Buffer) {
  Object.defineProperty(Buffer, Symbol.species, {
    value: null,
    configurable: true,
    enumerable: false,
    writable: false
  })
}

Buffer.poolSize = 8192 // not used by this implementation

function from (value, encodingOrOffset, length) {
  if (typeof value === 'string') {
    return fromString(value, encodingOrOffset)
  }

  if (ArrayBuffer.isView(value)) {
    return fromArrayLike(value)
  }

  if (value == null) {
    throw new TypeError(
      'The first argument must be one of type string, Buffer, ArrayBuffer, Array, ' +
      'or Array-like Object. Received type ' + (typeof value)
    )
  }

  if (isInstance(value, ArrayBuffer) ||
      (value && isInstance(value.buffer, ArrayBuffer))) {
    return fromArrayBuffer(value, encodingOrOffset, length)
  }

  if (typeof value === 'number') {
    throw new TypeError(
      'The "value" argument must not be of type number. Received type number'
    )
  }

  var valueOf = value.valueOf && value.valueOf()
  if (valueOf != null && valueOf !== value) {
    return Buffer.from(valueOf, encodingOrOffset, length)
  }

  var b = fromObject(value)
  if (b) return b

  if (typeof Symbol !== 'undefined' && Symbol.toPrimitive != null &&
      typeof value[Symbol.toPrimitive] === 'function') {
    return Buffer.from(
      value[Symbol.toPrimitive]('string'), encodingOrOffset, length
    )
  }

  throw new TypeError(
    'The first argument must be one of type string, Buffer, ArrayBuffer, Array, ' +
    'or Array-like Object. Received type ' + (typeof value)
  )
}

/**
 * Functionally equivalent to Buffer(arg, encoding) but throws a TypeError
 * if value is a number.
 * Buffer.from(str[, encoding])
 * Buffer.from(array)
 * Buffer.from(buffer)
 * Buffer.from(arrayBuffer[, byteOffset[, length]])
 **/
Buffer.from = function (value, encodingOrOffset, length) {
  return from(value, encodingOrOffset, length)
}

// Note: Change prototype *after* Buffer.from is defined to workaround Chrome bug:
// https://github.com/feross/buffer/pull/148
Object.setPrototypeOf(Buffer.prototype, Uint8Array.prototype)
Object.setPrototypeOf(Buffer, Uint8Array)

function assertSize (size) {
  if (typeof size !== 'number') {
    throw new TypeError('"size" argument must be of type number')
  } else if (size < 0) {
    throw new RangeError('The value "' + size + '" is invalid for option "size"')
  }
}

function alloc (size, fill, encoding) {
  assertSize(size)
  if (size <= 0) {
    return createBuffer(size)
  }
  if (fill !== undefined) {
    // Only pay attention to encoding if it's a string. This
    // prevents accidentally sending in a number that would
    // be interpretted as a start offset.
    return typeof encoding === 'string'
      ? createBuffer(size).fill(fill, encoding)
      : createBuffer(size).fill(fill)
  }
  return createBuffer(size)
}

/**
 * Creates a new filled Buffer instance.
 * alloc(size[, fill[, encoding]])
 **/
Buffer.alloc = function (size, fill, encoding) {
  return alloc(size, fill, encoding)
}

function allocUnsafe (size) {
  assertSize(size)
  return createBuffer(size < 0 ? 0 : checked(size) | 0)
}

/**
 * Equivalent to Buffer(num), by default creates a non-zero-filled Buffer instance.
 * */
Buffer.allocUnsafe = function (size) {
  return allocUnsafe(size)
}
/**
 * Equivalent to SlowBuffer(num), by default creates a non-zero-filled Buffer instance.
 */
Buffer.allocUnsafeSlow = function (size) {
  return allocUnsafe(size)
}

function fromString (string, encoding) {
  if (typeof encoding !== 'string' || encoding === '') {
    encoding = 'utf8'
  }

  if (!Buffer.isEncoding(encoding)) {
    throw new TypeError('Unknown encoding: ' + encoding)
  }

  var length = byteLength(string, encoding) | 0
  var buf = createBuffer(length)

  var actual = buf.write(string, encoding)

  if (actual !== length) {
    // Writing a hex string, for example, that contains invalid characters will
    // cause everything after the first invalid character to be ignored. (e.g.
    // 'abxxcd' will be treated as 'ab')
    buf = buf.slice(0, actual)
  }

  return buf
}

function fromArrayLike (array) {
  var length = array.length < 0 ? 0 : checked(array.length) | 0
  var buf = createBuffer(length)
  for (var i = 0; i < length; i += 1) {
    buf[i] = array[i] & 255
  }
  return buf
}

function fromArrayBuffer (array, byteOffset, length) {
  if (byteOffset < 0 || array.byteLength < byteOffset) {
    throw new RangeError('"offset" is outside of buffer bounds')
  }

  if (array.byteLength < byteOffset + (length || 0)) {
    throw new RangeError('"length" is outside of buffer bounds')
  }

  var buf
  if (byteOffset === undefined && length === undefined) {
    buf = new Uint8Array(array)
  } else if (length === undefined) {
    buf = new Uint8Array(array, byteOffset)
  } else {
    buf = new Uint8Array(array, byteOffset, length)
  }

  // Return an augmented `Uint8Array` instance
  Object.setPrototypeOf(buf, Buffer.prototype)

  return buf
}

function fromObject (obj) {
  if (Buffer.isBuffer(obj)) {
    var len = checked(obj.length) | 0
    var buf = createBuffer(len)

    if (buf.length === 0) {
      return buf
    }

    obj.copy(buf, 0, 0, len)
    return buf
  }

  if (obj.length !== undefined) {
    if (typeof obj.length !== 'number' || numberIsNaN(obj.length)) {
      return createBuffer(0)
    }
    return fromArrayLike(obj)
  }

  if (obj.type === 'Buffer' && Array.isArray(obj.data)) {
    return fromArrayLike(obj.data)
  }
}

function checked (length) {
  // Note: cannot use `length < K_MAX_LENGTH` here because that fails when
  // length is NaN (which is otherwise coerced to zero.)
  if (length >= K_MAX_LENGTH) {
    throw new RangeError('Attempt to allocate Buffer larger than maximum ' +
                         'size: 0x' + K_MAX_LENGTH.toString(16) + ' bytes')
  }
  return length | 0
}

function SlowBuffer (length) {
  if (+length != length) { // eslint-disable-line eqeqeq
    length = 0
  }
  return Buffer.alloc(+length)
}

Buffer.isBuffer = function isBuffer (b) {
  return b != null && b._isBuffer === true &&
    b !== Buffer.prototype // so Buffer.isBuffer(Buffer.prototype) will be false
}

Buffer.compare = function compare (a, b) {
  if (isInstance(a, Uint8Array)) a = Buffer.from(a, a.offset, a.byteLength)
  if (isInstance(b, Uint8Array)) b = Buffer.from(b, b.offset, b.byteLength)
  if (!Buffer.isBuffer(a) || !Buffer.isBuffer(b)) {
    throw new TypeError(
      'The "buf1", "buf2" arguments must be one of type Buffer or Uint8Array'
    )
  }

  if (a === b) return 0

  var x = a.length
  var y = b.length

  for (var i = 0, len = Math.min(x, y); i < len; ++i) {
    if (a[i] !== b[i]) {
      x = a[i]
      y = b[i]
      break
    }
  }

  if (x < y) return -1
  if (y < x) return 1
  return 0
}

Buffer.isEncoding = function isEncoding (encoding) {
  switch (String(encoding).toLowerCase()) {
    case 'hex':
    case 'utf8':
    case 'utf-8':
    case 'ascii':
    case 'latin1':
    case 'binary':
    case 'base64':
    case 'ucs2':
    case 'ucs-2':
    case 'utf16le':
    case 'utf-16le':
      return true
    default:
      return false
  }
}

Buffer.concat = function concat (list, length) {
  if (!Array.isArray(list)) {
    throw new TypeError('"list" argument must be an Array of Buffers')
  }

  if (list.length === 0) {
    return Buffer.alloc(0)
  }

  var i
  if (length === undefined) {
    length = 0
    for (i = 0; i < list.length; ++i) {
      length += list[i].length
    }
  }

  var buffer = Buffer.allocUnsafe(length)
  var pos = 0
  for (i = 0; i < list.length; ++i) {
    var buf = list[i]
    if (isInstance(buf, Uint8Array)) {
      buf = Buffer.from(buf)
    }
    if (!Buffer.isBuffer(buf)) {
      throw new TypeError('"list" argument must be an Array of Buffers')
    }
    buf.copy(buffer, pos)
    pos += buf.length
  }
  return buffer
}

function byteLength (string, encoding) {
  if (Buffer.isBuffer(string)) {
    return string.length
  }
  if (ArrayBuffer.isView(string) || isInstance(string, ArrayBuffer)) {
    return string.byteLength
  }
  if (typeof string !== 'string') {
    throw new TypeError(
      'The "string" argument must be one of type string, Buffer, or ArrayBuffer. ' +
      'Received type ' + typeof string
    )
  }

  var len = string.length
  var mustMatch = (arguments.length > 2 && arguments[2] === true)
  if (!mustMatch && len === 0) return 0

  // Use a for loop to avoid recursion
  var loweredCase = false
  for (;;) {
    switch (encoding) {
      case 'ascii':
      case 'latin1':
      case 'binary':
        return len
      case 'utf8':
      case 'utf-8':
        return utf8ToBytes(string).length
      case 'ucs2':
      case 'ucs-2':
      case 'utf16le':
      case 'utf-16le':
        return len * 2
      case 'hex':
        return len >>> 1
      case 'base64':
        return base64ToBytes(string).length
      default:
        if (loweredCase) {
          return mustMatch ? -1 : utf8ToBytes(string).length // assume utf8
        }
        encoding = ('' + encoding).toLowerCase()
        loweredCase = true
    }
  }
}
Buffer.byteLength = byteLength

function slowToString (encoding, start, end) {
  var loweredCase = false

  // No need to verify that "this.length <= MAX_UINT32" since it's a read-only
  // property of a typed array.

  // This behaves neither like String nor Uint8Array in that we set start/end
  // to their upper/lower bounds if the value passed is out of range.
  // undefined is handled specially as per ECMA-262 6th Edition,
  // Section 13.3.3.7 Runtime Semantics: KeyedBindingInitialization.
  if (start === undefined || start < 0) {
    start = 0
  }
  // Return early if start > this.length. Done here to prevent potential uint32
  // coercion fail below.
  if (start > this.length) {
    return ''
  }

  if (end === undefined || end > this.length) {
    end = this.length
  }

  if (end <= 0) {
    return ''
  }

  // Force coersion to uint32. This will also coerce falsey/NaN values to 0.
  end >>>= 0
  start >>>= 0

  if (end <= start) {
    return ''
  }

  if (!encoding) encoding = 'utf8'

  while (true) {
    switch (encoding) {
      case 'hex':
        return hexSlice(this, start, end)

      case 'utf8':
      case 'utf-8':
        return utf8Slice(this, start, end)

      case 'ascii':
        return asciiSlice(this, start, end)

      case 'latin1':
      case 'binary':
        return latin1Slice(this, start, end)

      case 'base64':
        return base64Slice(this, start, end)

      case 'ucs2':
      case 'ucs-2':
      case 'utf16le':
      case 'utf-16le':
        return utf16leSlice(this, start, end)

      default:
        if (loweredCase) throw new TypeError('Unknown encoding: ' + encoding)
        encoding = (encoding + '').toLowerCase()
        loweredCase = true
    }
  }
}

// This property is used by `Buffer.isBuffer` (and the `is-buffer` npm package)
// to detect a Buffer instance. It's not possible to use `instanceof Buffer`
// reliably in a browserify context because there could be multiple different
// copies of the 'buffer' package in use. This method works even for Buffer
// instances that were created from another copy of the `buffer` package.
// See: https://github.com/feross/buffer/issues/154
Buffer.prototype._isBuffer = true

function swap (b, n, m) {
  var i = b[n]
  b[n] = b[m]
  b[m] = i
}

Buffer.prototype.swap16 = function swap16 () {
  var len = this.length
  if (len % 2 !== 0) {
    throw new RangeError('Buffer size must be a multiple of 16-bits')
  }
  for (var i = 0; i < len; i += 2) {
    swap(this, i, i + 1)
  }
  return this
}

Buffer.prototype.swap32 = function swap32 () {
  var len = this.length
  if (len % 4 !== 0) {
    throw new RangeError('Buffer size must be a multiple of 32-bits')
  }
  for (var i = 0; i < len; i += 4) {
    swap(this, i, i + 3)
    swap(this, i + 1, i + 2)
  }
  return this
}

Buffer.prototype.swap64 = function swap64 () {
  var len = this.length
  if (len % 8 !== 0) {
    throw new RangeError('Buffer size must be a multiple of 64-bits')
  }
  for (var i = 0; i < len; i += 8) {
    swap(this, i, i + 7)
    swap(this, i + 1, i + 6)
    swap(this, i + 2, i + 5)
    swap(this, i + 3, i + 4)
  }
  return this
}

Buffer.prototype.toString = function toString () {
  var length = this.length
  if (length === 0) return ''
  if (arguments.length === 0) return utf8Slice(this, 0, length)
  return slowToString.apply(this, arguments)
}

Buffer.prototype.toLocaleString = Buffer.prototype.toString

Buffer.prototype.equals = function equals (b) {
  if (!Buffer.isBuffer(b)) throw new TypeError('Argument must be a Buffer')
  if (this === b) return true
  return Buffer.compare(this, b) === 0
}

Buffer.prototype.inspect = function inspect () {
  var str = ''
  var max = exports.INSPECT_MAX_BYTES
  str = this.toString('hex', 0, max).replace(/(.{2})/g, '$1 ').trim()
  if (this.length > max) str += ' ... '
  return '<Buffer ' + str + '>'
}
if (customInspectSymbol) {
  Buffer.prototype[customInspectSymbol] = Buffer.prototype.inspect
}

Buffer.prototype.compare = function compare (target, start, end, thisStart, thisEnd) {
  if (isInstance(target, Uint8Array)) {
    target = Buffer.from(target, target.offset, target.byteLength)
  }
  if (!Buffer.isBuffer(target)) {
    throw new TypeError(
      'The "target" argument must be one of type Buffer or Uint8Array. ' +
      'Received type ' + (typeof target)
    )
  }

  if (start === undefined) {
    start = 0
  }
  if (end === undefined) {
    end = target ? target.length : 0
  }
  if (thisStart === undefined) {
    thisStart = 0
  }
  if (thisEnd === undefined) {
    thisEnd = this.length
  }

  if (start < 0 || end > target.length || thisStart < 0 || thisEnd > this.length) {
    throw new RangeError('out of range index')
  }

  if (thisStart >= thisEnd && start >= end) {
    return 0
  }
  if (thisStart >= thisEnd) {
    return -1
  }
  if (start >= end) {
    return 1
  }

  start >>>= 0
  end >>>= 0
  thisStart >>>= 0
  thisEnd >>>= 0

  if (this === target) return 0

  var x = thisEnd - thisStart
  var y = end - start
  var len = Math.min(x, y)

  var thisCopy = this.slice(thisStart, thisEnd)
  var targetCopy = target.slice(start, end)

  for (var i = 0; i < len; ++i) {
    if (thisCopy[i] !== targetCopy[i]) {
      x = thisCopy[i]
      y = targetCopy[i]
      break
    }
  }

  if (x < y) return -1
  if (y < x) return 1
  return 0
}

// Finds either the first index of `val` in `buffer` at offset >= `byteOffset`,
// OR the last index of `val` in `buffer` at offset <= `byteOffset`.
//
// Arguments:
// - buffer - a Buffer to search
// - val - a string, Buffer, or number
// - byteOffset - an index into `buffer`; will be clamped to an int32
// - encoding - an optional encoding, relevant is val is a string
// - dir - true for indexOf, false for lastIndexOf
function bidirectionalIndexOf (buffer, val, byteOffset, encoding, dir) {
  // Empty buffer means no match
  if (buffer.length === 0) return -1

  // Normalize byteOffset
  if (typeof byteOffset === 'string') {
    encoding = byteOffset
    byteOffset = 0
  } else if (byteOffset > 0x7fffffff) {
    byteOffset = 0x7fffffff
  } else if (byteOffset < -0x80000000) {
    byteOffset = -0x80000000
  }
  byteOffset = +byteOffset // Coerce to Number.
  if (numberIsNaN(byteOffset)) {
    // byteOffset: it it's undefined, null, NaN, "foo", etc, search whole buffer
    byteOffset = dir ? 0 : (buffer.length - 1)
  }

  // Normalize byteOffset: negative offsets start from the end of the buffer
  if (byteOffset < 0) byteOffset = buffer.length + byteOffset
  if (byteOffset >= buffer.length) {
    if (dir) return -1
    else byteOffset = buffer.length - 1
  } else if (byteOffset < 0) {
    if (dir) byteOffset = 0
    else return -1
  }

  // Normalize val
  if (typeof val === 'string') {
    val = Buffer.from(val, encoding)
  }

  // Finally, search either indexOf (if dir is true) or lastIndexOf
  if (Buffer.isBuffer(val)) {
    // Special case: looking for empty string/buffer always fails
    if (val.length === 0) {
      return -1
    }
    return arrayIndexOf(buffer, val, byteOffset, encoding, dir)
  } else if (typeof val === 'number') {
    val = val & 0xFF // Search for a byte value [0-255]
    if (typeof Uint8Array.prototype.indexOf === 'function') {
      if (dir) {
        return Uint8Array.prototype.indexOf.call(buffer, val, byteOffset)
      } else {
        return Uint8Array.prototype.lastIndexOf.call(buffer, val, byteOffset)
      }
    }
    return arrayIndexOf(buffer, [val], byteOffset, encoding, dir)
  }

  throw new TypeError('val must be string, number or Buffer')
}

function arrayIndexOf (arr, val, byteOffset, encoding, dir) {
  var indexSize = 1
  var arrLength = arr.length
  var valLength = val.length

  if (encoding !== undefined) {
    encoding = String(encoding).toLowerCase()
    if (encoding === 'ucs2' || encoding === 'ucs-2' ||
        encoding === 'utf16le' || encoding === 'utf-16le') {
      if (arr.length < 2 || val.length < 2) {
        return -1
      }
      indexSize = 2
      arrLength /= 2
      valLength /= 2
      byteOffset /= 2
    }
  }

  function read (buf, i) {
    if (indexSize === 1) {
      return buf[i]
    } else {
      return buf.readUInt16BE(i * indexSize)
    }
  }

  var i
  if (dir) {
    var foundIndex = -1
    for (i = byteOffset; i < arrLength; i++) {
      if (read(arr, i) === read(val, foundIndex === -1 ? 0 : i - foundIndex)) {
        if (foundIndex === -1) foundIndex = i
        if (i - foundIndex + 1 === valLength) return foundIndex * indexSize
      } else {
        if (foundIndex !== -1) i -= i - foundIndex
        foundIndex = -1
      }
    }
  } else {
    if (byteOffset + valLength > arrLength) byteOffset = arrLength - valLength
    for (i = byteOffset; i >= 0; i--) {
      var found = true
      for (var j = 0; j < valLength; j++) {
        if (read(arr, i + j) !== read(val, j)) {
          found = false
          break
        }
      }
      if (found) return i
    }
  }

  return -1
}

Buffer.prototype.includes = function includes (val, byteOffset, encoding) {
  return this.indexOf(val, byteOffset, encoding) !== -1
}

Buffer.prototype.indexOf = function indexOf (val, byteOffset, encoding) {
  return bidirectionalIndexOf(this, val, byteOffset, encoding, true)
}

Buffer.prototype.lastIndexOf = function lastIndexOf (val, byteOffset, encoding) {
  return bidirectionalIndexOf(this, val, byteOffset, encoding, false)
}

function hexWrite (buf, string, offset, length) {
  offset = Number(offset) || 0
  var remaining = buf.length - offset
  if (!length) {
    length = remaining
  } else {
    length = Number(length)
    if (length > remaining) {
      length = remaining
    }
  }

  var strLen = string.length

  if (length > strLen / 2) {
    length = strLen / 2
  }
  for (var i = 0; i < length; ++i) {
    var parsed = parseInt(string.substr(i * 2, 2), 16)
    if (numberIsNaN(parsed)) return i
    buf[offset + i] = parsed
  }
  return i
}

function utf8Write (buf, string, offset, length) {
  return blitBuffer(utf8ToBytes(string, buf.length - offset), buf, offset, length)
}

function asciiWrite (buf, string, offset, length) {
  return blitBuffer(asciiToBytes(string), buf, offset, length)
}

function latin1Write (buf, string, offset, length) {
  return asciiWrite(buf, string, offset, length)
}

function base64Write (buf, string, offset, length) {
  return blitBuffer(base64ToBytes(string), buf, offset, length)
}

function ucs2Write (buf, string, offset, length) {
  return blitBuffer(utf16leToBytes(string, buf.length - offset), buf, offset, length)
}

Buffer.prototype.write = function write (string, offset, length, encoding) {
  // Buffer#write(string)
  if (offset === undefined) {
    encoding = 'utf8'
    length = this.length
    offset = 0
  // Buffer#write(string, encoding)
  } else if (length === undefined && typeof offset === 'string') {
    encoding = offset
    length = this.length
    offset = 0
  // Buffer#write(string, offset[, length][, encoding])
  } else if (isFinite(offset)) {
    offset = offset >>> 0
    if (isFinite(length)) {
      length = length >>> 0
      if (encoding === undefined) encoding = 'utf8'
    } else {
      encoding = length
      length = undefined
    }
  } else {
    throw new Error(
      'Buffer.write(string, encoding, offset[, length]) is no longer supported'
    )
  }

  var remaining = this.length - offset
  if (length === undefined || length > remaining) length = remaining

  if ((string.length > 0 && (length < 0 || offset < 0)) || offset > this.length) {
    throw new RangeError('Attempt to write outside buffer bounds')
  }

  if (!encoding) encoding = 'utf8'

  var loweredCase = false
  for (;;) {
    switch (encoding) {
      case 'hex':
        return hexWrite(this, string, offset, length)

      case 'utf8':
      case 'utf-8':
        return utf8Write(this, string, offset, length)

      case 'ascii':
        return asciiWrite(this, string, offset, length)

      case 'latin1':
      case 'binary':
        return latin1Write(this, string, offset, length)

      case 'base64':
        // Warning: maxLength not taken into account in base64Write
        return base64Write(this, string, offset, length)

      case 'ucs2':
      case 'ucs-2':
      case 'utf16le':
      case 'utf-16le':
        return ucs2Write(this, string, offset, length)

      default:
        if (loweredCase) throw new TypeError('Unknown encoding: ' + encoding)
        encoding = ('' + encoding).toLowerCase()
        loweredCase = true
    }
  }
}

Buffer.prototype.toJSON = function toJSON () {
  return {
    type: 'Buffer',
    data: Array.prototype.slice.call(this._arr || this, 0)
  }
}

function base64Slice (buf, start, end) {
  if (start === 0 && end === buf.length) {
    return base64.fromByteArray(buf)
  } else {
    return base64.fromByteArray(buf.slice(start, end))
  }
}

function utf8Slice (buf, start, end) {
  end = Math.min(buf.length, end)
  var res = []

  var i = start
  while (i < end) {
    var firstByte = buf[i]
    var codePoint = null
    var bytesPerSequence = (firstByte > 0xEF) ? 4
      : (firstByte > 0xDF) ? 3
        : (firstByte > 0xBF) ? 2
          : 1

    if (i + bytesPerSequence <= end) {
      var secondByte, thirdByte, fourthByte, tempCodePoint

      switch (bytesPerSequence) {
        case 1:
          if (firstByte < 0x80) {
            codePoint = firstByte
          }
          break
        case 2:
          secondByte = buf[i + 1]
          if ((secondByte & 0xC0) === 0x80) {
            tempCodePoint = (firstByte & 0x1F) << 0x6 | (secondByte & 0x3F)
            if (tempCodePoint > 0x7F) {
              codePoint = tempCodePoint
            }
          }
          break
        case 3:
          secondByte = buf[i + 1]
          thirdByte = buf[i + 2]
          if ((secondByte & 0xC0) === 0x80 && (thirdByte & 0xC0) === 0x80) {
            tempCodePoint = (firstByte & 0xF) << 0xC | (secondByte & 0x3F) << 0x6 | (thirdByte & 0x3F)
            if (tempCodePoint > 0x7FF && (tempCodePoint < 0xD800 || tempCodePoint > 0xDFFF)) {
              codePoint = tempCodePoint
            }
          }
          break
        case 4:
          secondByte = buf[i + 1]
          thirdByte = buf[i + 2]
          fourthByte = buf[i + 3]
          if ((secondByte & 0xC0) === 0x80 && (thirdByte & 0xC0) === 0x80 && (fourthByte & 0xC0) === 0x80) {
            tempCodePoint = (firstByte & 0xF) << 0x12 | (secondByte & 0x3F) << 0xC | (thirdByte & 0x3F) << 0x6 | (fourthByte & 0x3F)
            if (tempCodePoint > 0xFFFF && tempCodePoint < 0x110000) {
              codePoint = tempCodePoint
            }
          }
      }
    }

    if (codePoint === null) {
      // we did not generate a valid codePoint so insert a
      // replacement char (U+FFFD) and advance only 1 byte
      codePoint = 0xFFFD
      bytesPerSequence = 1
    } else if (codePoint > 0xFFFF) {
      // encode to utf16 (surrogate pair dance)
      codePoint -= 0x10000
      res.push(codePoint >>> 10 & 0x3FF | 0xD800)
      codePoint = 0xDC00 | codePoint & 0x3FF
    }

    res.push(codePoint)
    i += bytesPerSequence
  }

  return decodeCodePointsArray(res)
}

// Based on http://stackoverflow.com/a/22747272/680742, the browser with
// the lowest limit is Chrome, with 0x10000 args.
// We go 1 magnitude less, for safety
var MAX_ARGUMENTS_LENGTH = 0x1000

function decodeCodePointsArray (codePoints) {
  var len = codePoints.length
  if (len <= MAX_ARGUMENTS_LENGTH) {
    return String.fromCharCode.apply(String, codePoints) // avoid extra slice()
  }

  // Decode in chunks to avoid "call stack size exceeded".
  var res = ''
  var i = 0
  while (i < len) {
    res += String.fromCharCode.apply(
      String,
      codePoints.slice(i, i += MAX_ARGUMENTS_LENGTH)
    )
  }
  return res
}

function asciiSlice (buf, start, end) {
  var ret = ''
  end = Math.min(buf.length, end)

  for (var i = start; i < end; ++i) {
    ret += String.fromCharCode(buf[i] & 0x7F)
  }
  return ret
}

function latin1Slice (buf, start, end) {
  var ret = ''
  end = Math.min(buf.length, end)

  for (var i = start; i < end; ++i) {
    ret += String.fromCharCode(buf[i])
  }
  return ret
}

function hexSlice (buf, start, end) {
  var len = buf.length

  if (!start || start < 0) start = 0
  if (!end || end < 0 || end > len) end = len

  var out = ''
  for (var i = start; i < end; ++i) {
    out += hexSliceLookupTable[buf[i]]
  }
  return out
}

function utf16leSlice (buf, start, end) {
  var bytes = buf.slice(start, end)
  var res = ''
  for (var i = 0; i < bytes.length; i += 2) {
    res += String.fromCharCode(bytes[i] + (bytes[i + 1] * 256))
  }
  return res
}

Buffer.prototype.slice = function slice (start, end) {
  var len = this.length
  start = ~~start
  end = end === undefined ? len : ~~end

  if (start < 0) {
    start += len
    if (start < 0) start = 0
  } else if (start > len) {
    start = len
  }

  if (end < 0) {
    end += len
    if (end < 0) end = 0
  } else if (end > len) {
    end = len
  }

  if (end < start) end = start

  var newBuf = this.subarray(start, end)
  // Return an augmented `Uint8Array` instance
  Object.setPrototypeOf(newBuf, Buffer.prototype)

  return newBuf
}

/*
 * Need to make sure that buffer isn't trying to write out of bounds.
 */
function checkOffset (offset, ext, length) {
  if ((offset % 1) !== 0 || offset < 0) throw new RangeError('offset is not uint')
  if (offset + ext > length) throw new RangeError('Trying to access beyond buffer length')
}

Buffer.prototype.readUIntLE = function readUIntLE (offset, byteLength, noAssert) {
  offset = offset >>> 0
  byteLength = byteLength >>> 0
  if (!noAssert) checkOffset(offset, byteLength, this.length)

  var val = this[offset]
  var mul = 1
  var i = 0
  while (++i < byteLength && (mul *= 0x100)) {
    val += this[offset + i] * mul
  }

  return val
}

Buffer.prototype.readUIntBE = function readUIntBE (offset, byteLength, noAssert) {
  offset = offset >>> 0
  byteLength = byteLength >>> 0
  if (!noAssert) {
    checkOffset(offset, byteLength, this.length)
  }

  var val = this[offset + --byteLength]
  var mul = 1
  while (byteLength > 0 && (mul *= 0x100)) {
    val += this[offset + --byteLength] * mul
  }

  return val
}

Buffer.prototype.readUInt8 = function readUInt8 (offset, noAssert) {
  offset = offset >>> 0
  if (!noAssert) checkOffset(offset, 1, this.length)
  return this[offset]
}

Buffer.prototype.readUInt16LE = function readUInt16LE (offset, noAssert) {
  offset = offset >>> 0
  if (!noAssert) checkOffset(offset, 2, this.length)
  return this[offset] | (this[offset + 1] << 8)
}

Buffer.prototype.readUInt16BE = function readUInt16BE (offset, noAssert) {
  offset = offset >>> 0
  if (!noAssert) checkOffset(offset, 2, this.length)
  return (this[offset] << 8) | this[offset + 1]
}

Buffer.prototype.readUInt32LE = function readUInt32LE (offset, noAssert) {
  offset = offset >>> 0
  if (!noAssert) checkOffset(offset, 4, this.length)

  return ((this[offset]) |
      (this[offset + 1] << 8) |
      (this[offset + 2] << 16)) +
      (this[offset + 3] * 0x1000000)
}

Buffer.prototype.readUInt32BE = function readUInt32BE (offset, noAssert) {
  offset = offset >>> 0
  if (!noAssert) checkOffset(offset, 4, this.length)

  return (this[offset] * 0x1000000) +
    ((this[offset + 1] << 16) |
    (this[offset + 2] << 8) |
    this[offset + 3])
}

Buffer.prototype.readIntLE = function readIntLE (offset, byteLength, noAssert) {
  offset = offset >>> 0
  byteLength = byteLength >>> 0
  if (!noAssert) checkOffset(offset, byteLength, this.length)

  var val = this[offset]
  var mul = 1
  var i = 0
  while (++i < byteLength && (mul *= 0x100)) {
    val += this[offset + i] * mul
  }
  mul *= 0x80

  if (val >= mul) val -= Math.pow(2, 8 * byteLength)

  return val
}

Buffer.prototype.readIntBE = function readIntBE (offset, byteLength, noAssert) {
  offset = offset >>> 0
  byteLength = byteLength >>> 0
  if (!noAssert) checkOffset(offset, byteLength, this.length)

  var i = byteLength
  var mul = 1
  var val = this[offset + --i]
  while (i > 0 && (mul *= 0x100)) {
    val += this[offset + --i] * mul
  }
  mul *= 0x80

  if (val >= mul) val -= Math.pow(2, 8 * byteLength)

  return val
}

Buffer.prototype.readInt8 = function readInt8 (offset, noAssert) {
  offset = offset >>> 0
  if (!noAssert) checkOffset(offset, 1, this.length)
  if (!(this[offset] & 0x80)) return (this[offset])
  return ((0xff - this[offset] + 1) * -1)
}

Buffer.prototype.readInt16LE = function readInt16LE (offset, noAssert) {
  offset = offset >>> 0
  if (!noAssert) checkOffset(offset, 2, this.length)
  var val = this[offset] | (this[offset + 1] << 8)
  return (val & 0x8000) ? val | 0xFFFF0000 : val
}

Buffer.prototype.readInt16BE = function readInt16BE (offset, noAssert) {
  offset = offset >>> 0
  if (!noAssert) checkOffset(offset, 2, this.length)
  var val = this[offset + 1] | (this[offset] << 8)
  return (val & 0x8000) ? val | 0xFFFF0000 : val
}

Buffer.prototype.readInt32LE = function readInt32LE (offset, noAssert) {
  offset = offset >>> 0
  if (!noAssert) checkOffset(offset, 4, this.length)

  return (this[offset]) |
    (this[offset + 1] << 8) |
    (this[offset + 2] << 16) |
    (this[offset + 3] << 24)
}

Buffer.prototype.readInt32BE = function readInt32BE (offset, noAssert) {
  offset = offset >>> 0
  if (!noAssert) checkOffset(offset, 4, this.length)

  return (this[offset] << 24) |
    (this[offset + 1] << 16) |
    (this[offset + 2] << 8) |
    (this[offset + 3])
}

Buffer.prototype.readFloatLE = function readFloatLE (offset, noAssert) {
  offset = offset >>> 0
  if (!noAssert) checkOffset(offset, 4, this.length)
  return ieee754.read(this, offset, true, 23, 4)
}

Buffer.prototype.readFloatBE = function readFloatBE (offset, noAssert) {
  offset = offset >>> 0
  if (!noAssert) checkOffset(offset, 4, this.length)
  return ieee754.read(this, offset, false, 23, 4)
}

Buffer.prototype.readDoubleLE = function readDoubleLE (offset, noAssert) {
  offset = offset >>> 0
  if (!noAssert) checkOffset(offset, 8, this.length)
  return ieee754.read(this, offset, true, 52, 8)
}

Buffer.prototype.readDoubleBE = function readDoubleBE (offset, noAssert) {
  offset = offset >>> 0
  if (!noAssert) checkOffset(offset, 8, this.length)
  return ieee754.read(this, offset, false, 52, 8)
}

function checkInt (buf, value, offset, ext, max, min) {
  if (!Buffer.isBuffer(buf)) throw new TypeError('"buffer" argument must be a Buffer instance')
  if (value > max || value < min) throw new RangeError('"value" argument is out of bounds')
  if (offset + ext > buf.length) throw new RangeError('Index out of range')
}

Buffer.prototype.writeUIntLE = function writeUIntLE (value, offset, byteLength, noAssert) {
  value = +value
  offset = offset >>> 0
  byteLength = byteLength >>> 0
  if (!noAssert) {
    var maxBytes = Math.pow(2, 8 * byteLength) - 1
    checkInt(this, value, offset, byteLength, maxBytes, 0)
  }

  var mul = 1
  var i = 0
  this[offset] = value & 0xFF
  while (++i < byteLength && (mul *= 0x100)) {
    this[offset + i] = (value / mul) & 0xFF
  }

  return offset + byteLength
}

Buffer.prototype.writeUIntBE = function writeUIntBE (value, offset, byteLength, noAssert) {
  value = +value
  offset = offset >>> 0
  byteLength = byteLength >>> 0
  if (!noAssert) {
    var maxBytes = Math.pow(2, 8 * byteLength) - 1
    checkInt(this, value, offset, byteLength, maxBytes, 0)
  }

  var i = byteLength - 1
  var mul = 1
  this[offset + i] = value & 0xFF
  while (--i >= 0 && (mul *= 0x100)) {
    this[offset + i] = (value / mul) & 0xFF
  }

  return offset + byteLength
}

Buffer.prototype.writeUInt8 = function writeUInt8 (value, offset, noAssert) {
  value = +value
  offset = offset >>> 0
  if (!noAssert) checkInt(this, value, offset, 1, 0xff, 0)
  this[offset] = (value & 0xff)
  return offset + 1
}

Buffer.prototype.writeUInt16LE = function writeUInt16LE (value, offset, noAssert) {
  value = +value
  offset = offset >>> 0
  if (!noAssert) checkInt(this, value, offset, 2, 0xffff, 0)
  this[offset] = (value & 0xff)
  this[offset + 1] = (value >>> 8)
  return offset + 2
}

Buffer.prototype.writeUInt16BE = function writeUInt16BE (value, offset, noAssert) {
  value = +value
  offset = offset >>> 0
  if (!noAssert) checkInt(this, value, offset, 2, 0xffff, 0)
  this[offset] = (value >>> 8)
  this[offset + 1] = (value & 0xff)
  return offset + 2
}

Buffer.prototype.writeUInt32LE = function writeUInt32LE (value, offset, noAssert) {
  value = +value
  offset = offset >>> 0
  if (!noAssert) checkInt(this, value, offset, 4, 0xffffffff, 0)
  this[offset + 3] = (value >>> 24)
  this[offset + 2] = (value >>> 16)
  this[offset + 1] = (value >>> 8)
  this[offset] = (value & 0xff)
  return offset + 4
}

Buffer.prototype.writeUInt32BE = function writeUInt32BE (value, offset, noAssert) {
  value = +value
  offset = offset >>> 0
  if (!noAssert) checkInt(this, value, offset, 4, 0xffffffff, 0)
  this[offset] = (value >>> 24)
  this[offset + 1] = (value >>> 16)
  this[offset + 2] = (value >>> 8)
  this[offset + 3] = (value & 0xff)
  return offset + 4
}

Buffer.prototype.writeIntLE = function writeIntLE (value, offset, byteLength, noAssert) {
  value = +value
  offset = offset >>> 0
  if (!noAssert) {
    var limit = Math.pow(2, (8 * byteLength) - 1)

    checkInt(this, value, offset, byteLength, limit - 1, -limit)
  }

  var i = 0
  var mul = 1
  var sub = 0
  this[offset] = value & 0xFF
  while (++i < byteLength && (mul *= 0x100)) {
    if (value < 0 && sub === 0 && this[offset + i - 1] !== 0) {
      sub = 1
    }
    this[offset + i] = ((value / mul) >> 0) - sub & 0xFF
  }

  return offset + byteLength
}

Buffer.prototype.writeIntBE = function writeIntBE (value, offset, byteLength, noAssert) {
  value = +value
  offset = offset >>> 0
  if (!noAssert) {
    var limit = Math.pow(2, (8 * byteLength) - 1)

    checkInt(this, value, offset, byteLength, limit - 1, -limit)
  }

  var i = byteLength - 1
  var mul = 1
  var sub = 0
  this[offset + i] = value & 0xFF
  while (--i >= 0 && (mul *= 0x100)) {
    if (value < 0 && sub === 0 && this[offset + i + 1] !== 0) {
      sub = 1
    }
    this[offset + i] = ((value / mul) >> 0) - sub & 0xFF
  }

  return offset + byteLength
}

Buffer.prototype.writeInt8 = function writeInt8 (value, offset, noAssert) {
  value = +value
  offset = offset >>> 0
  if (!noAssert) checkInt(this, value, offset, 1, 0x7f, -0x80)
  if (value < 0) value = 0xff + value + 1
  this[offset] = (value & 0xff)
  return offset + 1
}

Buffer.prototype.writeInt16LE = function writeInt16LE (value, offset, noAssert) {
  value = +value
  offset = offset >>> 0
  if (!noAssert) checkInt(this, value, offset, 2, 0x7fff, -0x8000)
  this[offset] = (value & 0xff)
  this[offset + 1] = (value >>> 8)
  return offset + 2
}

Buffer.prototype.writeInt16BE = function writeInt16BE (value, offset, noAssert) {
  value = +value
  offset = offset >>> 0
  if (!noAssert) checkInt(this, value, offset, 2, 0x7fff, -0x8000)
  this[offset] = (value >>> 8)
  this[offset + 1] = (value & 0xff)
  return offset + 2
}

Buffer.prototype.writeInt32LE = function writeInt32LE (value, offset, noAssert) {
  value = +value
  offset = offset >>> 0
  if (!noAssert) checkInt(this, value, offset, 4, 0x7fffffff, -0x80000000)
  this[offset] = (value & 0xff)
  this[offset + 1] = (value >>> 8)
  this[offset + 2] = (value >>> 16)
  this[offset + 3] = (value >>> 24)
  return offset + 4
}

Buffer.prototype.writeInt32BE = function writeInt32BE (value, offset, noAssert) {
  value = +value
  offset = offset >>> 0
  if (!noAssert) checkInt(this, value, offset, 4, 0x7fffffff, -0x80000000)
  if (value < 0) value = 0xffffffff + value + 1
  this[offset] = (value >>> 24)
  this[offset + 1] = (value >>> 16)
  this[offset + 2] = (value >>> 8)
  this[offset + 3] = (value & 0xff)
  return offset + 4
}

function checkIEEE754 (buf, value, offset, ext, max, min) {
  if (offset + ext > buf.length) throw new RangeError('Index out of range')
  if (offset < 0) throw new RangeError('Index out of range')
}

function writeFloat (buf, value, offset, littleEndian, noAssert) {
  value = +value
  offset = offset >>> 0
  if (!noAssert) {
    checkIEEE754(buf, value, offset, 4, 3.4028234663852886e+38, -3.4028234663852886e+38)
  }
  ieee754.write(buf, value, offset, littleEndian, 23, 4)
  return offset + 4
}

Buffer.prototype.writeFloatLE = function writeFloatLE (value, offset, noAssert) {
  return writeFloat(this, value, offset, true, noAssert)
}

Buffer.prototype.writeFloatBE = function writeFloatBE (value, offset, noAssert) {
  return writeFloat(this, value, offset, false, noAssert)
}

function writeDouble (buf, value, offset, littleEndian, noAssert) {
  value = +value
  offset = offset >>> 0
  if (!noAssert) {
    checkIEEE754(buf, value, offset, 8, 1.7976931348623157E+308, -1.7976931348623157E+308)
  }
  ieee754.write(buf, value, offset, littleEndian, 52, 8)
  return offset + 8
}

Buffer.prototype.writeDoubleLE = function writeDoubleLE (value, offset, noAssert) {
  return writeDouble(this, value, offset, true, noAssert)
}

Buffer.prototype.writeDoubleBE = function writeDoubleBE (value, offset, noAssert) {
  return writeDouble(this, value, offset, false, noAssert)
}

// copy(targetBuffer, targetStart=0, sourceStart=0, sourceEnd=buffer.length)
Buffer.prototype.copy = function copy (target, targetStart, start, end) {
  if (!Buffer.isBuffer(target)) throw new TypeError('argument should be a Buffer')
  if (!start) start = 0
  if (!end && end !== 0) end = this.length
  if (targetStart >= target.length) targetStart = target.length
  if (!targetStart) targetStart = 0
  if (end > 0 && end < start) end = start

  // Copy 0 bytes; we're done
  if (end === start) return 0
  if (target.length === 0 || this.length === 0) return 0

  // Fatal error conditions
  if (targetStart < 0) {
    throw new RangeError('targetStart out of bounds')
  }
  if (start < 0 || start >= this.length) throw new RangeError('Index out of range')
  if (end < 0) throw new RangeError('sourceEnd out of bounds')

  // Are we oob?
  if (end > this.length) end = this.length
  if (target.length - targetStart < end - start) {
    end = target.length - targetStart + start
  }

  var len = end - start

  if (this === target && typeof Uint8Array.prototype.copyWithin === 'function') {
    // Use built-in when available, missing from IE11
    this.copyWithin(targetStart, start, end)
  } else if (this === target && start < targetStart && targetStart < end) {
    // descending copy from end
    for (var i = len - 1; i >= 0; --i) {
      target[i + targetStart] = this[i + start]
    }
  } else {
    Uint8Array.prototype.set.call(
      target,
      this.subarray(start, end),
      targetStart
    )
  }

  return len
}

// Usage:
//    buffer.fill(number[, offset[, end]])
//    buffer.fill(buffer[, offset[, end]])
//    buffer.fill(string[, offset[, end]][, encoding])
Buffer.prototype.fill = function fill (val, start, end, encoding) {
  // Handle string cases:
  if (typeof val === 'string') {
    if (typeof start === 'string') {
      encoding = start
      start = 0
      end = this.length
    } else if (typeof end === 'string') {
      encoding = end
      end = this.length
    }
    if (encoding !== undefined && typeof encoding !== 'string') {
      throw new TypeError('encoding must be a string')
    }
    if (typeof encoding === 'string' && !Buffer.isEncoding(encoding)) {
      throw new TypeError('Unknown encoding: ' + encoding)
    }
    if (val.length === 1) {
      var code = val.charCodeAt(0)
      if ((encoding === 'utf8' && code < 128) ||
          encoding === 'latin1') {
        // Fast path: If `val` fits into a single byte, use that numeric value.
        val = code
      }
    }
  } else if (typeof val === 'number') {
    val = val & 255
  } else if (typeof val === 'boolean') {
    val = Number(val)
  }

  // Invalid ranges are not set to a default, so can range check early.
  if (start < 0 || this.length < start || this.length < end) {
    throw new RangeError('Out of range index')
  }

  if (end <= start) {
    return this
  }

  start = start >>> 0
  end = end === undefined ? this.length : end >>> 0

  if (!val) val = 0

  var i
  if (typeof val === 'number') {
    for (i = start; i < end; ++i) {
      this[i] = val
    }
  } else {
    var bytes = Buffer.isBuffer(val)
      ? val
      : Buffer.from(val, encoding)
    var len = bytes.length
    if (len === 0) {
      throw new TypeError('The value "' + val +
        '" is invalid for argument "value"')
    }
    for (i = 0; i < end - start; ++i) {
      this[i + start] = bytes[i % len]
    }
  }

  return this
}

// HELPER FUNCTIONS
// ================

var INVALID_BASE64_RE = /[^+/0-9A-Za-z-_]/g

function base64clean (str) {
  // Node takes equal signs as end of the Base64 encoding
  str = str.split('=')[0]
  // Node strips out invalid characters like \n and \t from the string, base64-js does not
  str = str.trim().replace(INVALID_BASE64_RE, '')
  // Node converts strings with length < 2 to ''
  if (str.length < 2) return ''
  // Node allows for non-padded base64 strings (missing trailing ===), base64-js does not
  while (str.length % 4 !== 0) {
    str = str + '='
  }
  return str
}

function utf8ToBytes (string, units) {
  units = units || Infinity
  var codePoint
  var length = string.length
  var leadSurrogate = null
  var bytes = []

  for (var i = 0; i < length; ++i) {
    codePoint = string.charCodeAt(i)

    // is surrogate component
    if (codePoint > 0xD7FF && codePoint < 0xE000) {
      // last char was a lead
      if (!leadSurrogate) {
        // no lead yet
        if (codePoint > 0xDBFF) {
          // unexpected trail
          if ((units -= 3) > -1) bytes.push(0xEF, 0xBF, 0xBD)
          continue
        } else if (i + 1 === length) {
          // unpaired lead
          if ((units -= 3) > -1) bytes.push(0xEF, 0xBF, 0xBD)
          continue
        }

        // valid lead
        leadSurrogate = codePoint

        continue
      }

      // 2 leads in a row
      if (codePoint < 0xDC00) {
        if ((units -= 3) > -1) bytes.push(0xEF, 0xBF, 0xBD)
        leadSurrogate = codePoint
        continue
      }

      // valid surrogate pair
      codePoint = (leadSurrogate - 0xD800 << 10 | codePoint - 0xDC00) + 0x10000
    } else if (leadSurrogate) {
      // valid bmp char, but last char was a lead
      if ((units -= 3) > -1) bytes.push(0xEF, 0xBF, 0xBD)
    }

    leadSurrogate = null

    // encode utf8
    if (codePoint < 0x80) {
      if ((units -= 1) < 0) break
      bytes.push(codePoint)
    } else if (codePoint < 0x800) {
      if ((units -= 2) < 0) break
      bytes.push(
        codePoint >> 0x6 | 0xC0,
        codePoint & 0x3F | 0x80
      )
    } else if (codePoint < 0x10000) {
      if ((units -= 3) < 0) break
      bytes.push(
        codePoint >> 0xC | 0xE0,
        codePoint >> 0x6 & 0x3F | 0x80,
        codePoint & 0x3F | 0x80
      )
    } else if (codePoint < 0x110000) {
      if ((units -= 4) < 0) break
      bytes.push(
        codePoint >> 0x12 | 0xF0,
        codePoint >> 0xC & 0x3F | 0x80,
        codePoint >> 0x6 & 0x3F | 0x80,
        codePoint & 0x3F | 0x80
      )
    } else {
      throw new Error('Invalid code point')
    }
  }

  return bytes
}

function asciiToBytes (str) {
  var byteArray = []
  for (var i = 0; i < str.length; ++i) {
    // Node's code seems to be doing this and not & 0x7F..
    byteArray.push(str.charCodeAt(i) & 0xFF)
  }
  return byteArray
}

function utf16leToBytes (str, units) {
  var c, hi, lo
  var byteArray = []
  for (var i = 0; i < str.length; ++i) {
    if ((units -= 2) < 0) break

    c = str.charCodeAt(i)
    hi = c >> 8
    lo = c % 256
    byteArray.push(lo)
    byteArray.push(hi)
  }

  return byteArray
}

function base64ToBytes (str) {
  return base64.toByteArray(base64clean(str))
}

function blitBuffer (src, dst, offset, length) {
  for (var i = 0; i < length; ++i) {
    if ((i + offset >= dst.length) || (i >= src.length)) break
    dst[i + offset] = src[i]
  }
  return i
}

// ArrayBuffer or Uint8Array objects from other contexts (i.e. iframes) do not pass
// the `instanceof` check but they should be treated as of that type.
// See: https://github.com/feross/buffer/issues/166
function isInstance (obj, type) {
  return obj instanceof type ||
    (obj != null && obj.constructor != null && obj.constructor.name != null &&
      obj.constructor.name === type.name)
}
function numberIsNaN (obj) {
  // For IE11 support
  return obj !== obj // eslint-disable-line no-self-compare
}

// Create lookup table for `toString('hex')`
// See: https://github.com/feross/buffer/issues/219
var hexSliceLookupTable = (function () {
  var alphabet = '0123456789abcdef'
  var table = new Array(256)
  for (var i = 0; i < 16; ++i) {
    var i16 = i * 16
    for (var j = 0; j < 16; ++j) {
      table[i16 + j] = alphabet[i] + alphabet[j]
    }
  }
  return table
})()

}).call(this,require("buffer").Buffer)
},{"base64-js":15,"buffer":16,"ieee754":17}],17:[function(require,module,exports){
exports.read = function (buffer, offset, isLE, mLen, nBytes) {
  var e, m
  var eLen = (nBytes * 8) - mLen - 1
  var eMax = (1 << eLen) - 1
  var eBias = eMax >> 1
  var nBits = -7
  var i = isLE ? (nBytes - 1) : 0
  var d = isLE ? -1 : 1
  var s = buffer[offset + i]

  i += d

  e = s & ((1 << (-nBits)) - 1)
  s >>= (-nBits)
  nBits += eLen
  for (; nBits > 0; e = (e * 256) + buffer[offset + i], i += d, nBits -= 8) {}

  m = e & ((1 << (-nBits)) - 1)
  e >>= (-nBits)
  nBits += mLen
  for (; nBits > 0; m = (m * 256) + buffer[offset + i], i += d, nBits -= 8) {}

  if (e === 0) {
    e = 1 - eBias
  } else if (e === eMax) {
    return m ? NaN : ((s ? -1 : 1) * Infinity)
  } else {
    m = m + Math.pow(2, mLen)
    e = e - eBias
  }
  return (s ? -1 : 1) * m * Math.pow(2, e - mLen)
}

exports.write = function (buffer, value, offset, isLE, mLen, nBytes) {
  var e, m, c
  var eLen = (nBytes * 8) - mLen - 1
  var eMax = (1 << eLen) - 1
  var eBias = eMax >> 1
  var rt = (mLen === 23 ? Math.pow(2, -24) - Math.pow(2, -77) : 0)
  var i = isLE ? 0 : (nBytes - 1)
  var d = isLE ? 1 : -1
  var s = value < 0 || (value === 0 && 1 / value < 0) ? 1 : 0

  value = Math.abs(value)

  if (isNaN(value) || value === Infinity) {
    m = isNaN(value) ? 1 : 0
    e = eMax
  } else {
    e = Math.floor(Math.log(value) / Math.LN2)
    if (value * (c = Math.pow(2, -e)) < 1) {
      e--
      c *= 2
    }
    if (e + eBias >= 1) {
      value += rt / c
    } else {
      value += rt * Math.pow(2, 1 - eBias)
    }
    if (value * c >= 2) {
      e++
      c /= 2
    }

    if (e + eBias >= eMax) {
      m = 0
      e = eMax
    } else if (e + eBias >= 1) {
      m = ((value * c) - 1) * Math.pow(2, mLen)
      e = e + eBias
    } else {
      m = value * Math.pow(2, eBias - 1) * Math.pow(2, mLen)
      e = 0
    }
  }

  for (; mLen >= 8; buffer[offset + i] = m & 0xff, i += d, m /= 256, mLen -= 8) {}

  e = (e << mLen) | m
  eLen += mLen
  for (; eLen > 0; buffer[offset + i] = e & 0xff, i += d, e /= 256, eLen -= 8) {}

  buffer[offset + i - d] |= s * 128
}

},{}],18:[function(require,module,exports){
// shim for using process in browser
var process = module.exports = {};

// cached from whatever global is present so that test runners that stub it
// don't break things.  But we need to wrap it in a try catch in case it is
// wrapped in strict mode code which doesn't define any globals.  It's inside a
// function because try/catches deoptimize in certain engines.

var cachedSetTimeout;
var cachedClearTimeout;

function defaultSetTimout() {
    throw new Error('setTimeout has not been defined');
}
function defaultClearTimeout () {
    throw new Error('clearTimeout has not been defined');
}
(function () {
    try {
        if (typeof setTimeout === 'function') {
            cachedSetTimeout = setTimeout;
        } else {
            cachedSetTimeout = defaultSetTimout;
        }
    } catch (e) {
        cachedSetTimeout = defaultSetTimout;
    }
    try {
        if (typeof clearTimeout === 'function') {
            cachedClearTimeout = clearTimeout;
        } else {
            cachedClearTimeout = defaultClearTimeout;
        }
    } catch (e) {
        cachedClearTimeout = defaultClearTimeout;
    }
} ())
function runTimeout(fun) {
    if (cachedSetTimeout === setTimeout) {
        //normal enviroments in sane situations
        return setTimeout(fun, 0);
    }
    // if setTimeout wasn't available but was latter defined
    if ((cachedSetTimeout === defaultSetTimout || !cachedSetTimeout) && setTimeout) {
        cachedSetTimeout = setTimeout;
        return setTimeout(fun, 0);
    }
    try {
        // when when somebody has screwed with setTimeout but no I.E. maddness
        return cachedSetTimeout(fun, 0);
    } catch(e){
        try {
            // When we are in I.E. but the script has been evaled so I.E. doesn't trust the global object when called normally
            return cachedSetTimeout.call(null, fun, 0);
        } catch(e){
            // same as above but when it's a version of I.E. that must have the global object for 'this', hopfully our context correct otherwise it will throw a global error
            return cachedSetTimeout.call(this, fun, 0);
        }
    }


}
function runClearTimeout(marker) {
    if (cachedClearTimeout === clearTimeout) {
        //normal enviroments in sane situations
        return clearTimeout(marker);
    }
    // if clearTimeout wasn't available but was latter defined
    if ((cachedClearTimeout === defaultClearTimeout || !cachedClearTimeout) && clearTimeout) {
        cachedClearTimeout = clearTimeout;
        return clearTimeout(marker);
    }
    try {
        // when when somebody has screwed with setTimeout but no I.E. maddness
        return cachedClearTimeout(marker);
    } catch (e){
        try {
            // When we are in I.E. but the script has been evaled so I.E. doesn't  trust the global object when called normally
            return cachedClearTimeout.call(null, marker);
        } catch (e){
            // same as above but when it's a version of I.E. that must have the global object for 'this', hopfully our context correct otherwise it will throw a global error.
            // Some versions of I.E. have different rules for clearTimeout vs setTimeout
            return cachedClearTimeout.call(this, marker);
        }
    }



}
var queue = [];
var draining = false;
var currentQueue;
var queueIndex = -1;

function cleanUpNextTick() {
    if (!draining || !currentQueue) {
        return;
    }
    draining = false;
    if (currentQueue.length) {
        queue = currentQueue.concat(queue);
    } else {
        queueIndex = -1;
    }
    if (queue.length) {
        drainQueue();
    }
}

function drainQueue() {
    if (draining) {
        return;
    }
    var timeout = runTimeout(cleanUpNextTick);
    draining = true;

    var len = queue.length;
    while(len) {
        currentQueue = queue;
        queue = [];
        while (++queueIndex < len) {
            if (currentQueue) {
                currentQueue[queueIndex].run();
            }
        }
        queueIndex = -1;
        len = queue.length;
    }
    currentQueue = null;
    draining = false;
    runClearTimeout(timeout);
}

process.nextTick = function (fun) {
    var args = new Array(arguments.length - 1);
    if (arguments.length > 1) {
        for (var i = 1; i < arguments.length; i++) {
            args[i - 1] = arguments[i];
        }
    }
    queue.push(new Item(fun, args));
    if (queue.length === 1 && !draining) {
        runTimeout(drainQueue);
    }
};

// v8 likes predictible objects
function Item(fun, array) {
    this.fun = fun;
    this.array = array;
}
Item.prototype.run = function () {
    this.fun.apply(null, this.array);
};
process.title = 'browser';
process.browser = true;
process.env = {};
process.argv = [];
process.version = ''; // empty string to avoid regexp issues
process.versions = {};

function noop() {}

process.on = noop;
process.addListener = noop;
process.once = noop;
process.off = noop;
process.removeListener = noop;
process.removeAllListeners = noop;
process.emit = noop;
process.prependListener = noop;
process.prependOnceListener = noop;

process.listeners = function (name) { return [] }

process.binding = function (name) {
    throw new Error('process.binding is not supported');
};

process.cwd = function () { return '/' };
process.chdir = function (dir) {
    throw new Error('process.chdir is not supported');
};
process.umask = function() { return 0; };

},{}],19:[function(require,module,exports){
(function (global){
/*! https://mths.be/punycode v1.4.1 by @mathias */
;(function(root) {

	/** Detect free variables */
	var freeExports = typeof exports == 'object' && exports &&
		!exports.nodeType && exports;
	var freeModule = typeof module == 'object' && module &&
		!module.nodeType && module;
	var freeGlobal = typeof global == 'object' && global;
	if (
		freeGlobal.global === freeGlobal ||
		freeGlobal.window === freeGlobal ||
		freeGlobal.self === freeGlobal
	) {
		root = freeGlobal;
	}

	/**
	 * The `punycode` object.
	 * @name punycode
	 * @type Object
	 */
	var punycode,

	/** Highest positive signed 32-bit float value */
	maxInt = 2147483647, // aka. 0x7FFFFFFF or 2^31-1

	/** Bootstring parameters */
	base = 36,
	tMin = 1,
	tMax = 26,
	skew = 38,
	damp = 700,
	initialBias = 72,
	initialN = 128, // 0x80
	delimiter = '-', // '\x2D'

	/** Regular expressions */
	regexPunycode = /^xn--/,
	regexNonASCII = /[^\x20-\x7E]/, // unprintable ASCII chars + non-ASCII chars
	regexSeparators = /[\x2E\u3002\uFF0E\uFF61]/g, // RFC 3490 separators

	/** Error messages */
	errors = {
		'overflow': 'Overflow: input needs wider integers to process',
		'not-basic': 'Illegal input >= 0x80 (not a basic code point)',
		'invalid-input': 'Invalid input'
	},

	/** Convenience shortcuts */
	baseMinusTMin = base - tMin,
	floor = Math.floor,
	stringFromCharCode = String.fromCharCode,

	/** Temporary variable */
	key;

	/*--------------------------------------------------------------------------*/

	/**
	 * A generic error utility function.
	 * @private
	 * @param {String} type The error type.
	 * @returns {Error} Throws a `RangeError` with the applicable error message.
	 */
	function error(type) {
		throw new RangeError(errors[type]);
	}

	/**
	 * A generic `Array#map` utility function.
	 * @private
	 * @param {Array} array The array to iterate over.
	 * @param {Function} callback The function that gets called for every array
	 * item.
	 * @returns {Array} A new array of values returned by the callback function.
	 */
	function map(array, fn) {
		var length = array.length;
		var result = [];
		while (length--) {
			result[length] = fn(array[length]);
		}
		return result;
	}

	/**
	 * A simple `Array#map`-like wrapper to work with domain name strings or email
	 * addresses.
	 * @private
	 * @param {String} domain The domain name or email address.
	 * @param {Function} callback The function that gets called for every
	 * character.
	 * @returns {Array} A new string of characters returned by the callback
	 * function.
	 */
	function mapDomain(string, fn) {
		var parts = string.split('@');
		var result = '';
		if (parts.length > 1) {
			// In email addresses, only the domain name should be punycoded. Leave
			// the local part (i.e. everything up to `@`) intact.
			result = parts[0] + '@';
			string = parts[1];
		}
		// Avoid `split(regex)` for IE8 compatibility. See #17.
		string = string.replace(regexSeparators, '\x2E');
		var labels = string.split('.');
		var encoded = map(labels, fn).join('.');
		return result + encoded;
	}

	/**
	 * Creates an array containing the numeric code points of each Unicode
	 * character in the string. While JavaScript uses UCS-2 internally,
	 * this function will convert a pair of surrogate halves (each of which
	 * UCS-2 exposes as separate characters) into a single code point,
	 * matching UTF-16.
	 * @see `punycode.ucs2.encode`
	 * @see <https://mathiasbynens.be/notes/javascript-encoding>
	 * @memberOf punycode.ucs2
	 * @name decode
	 * @param {String} string The Unicode input string (UCS-2).
	 * @returns {Array} The new array of code points.
	 */
	function ucs2decode(string) {
		var output = [],
		    counter = 0,
		    length = string.length,
		    value,
		    extra;
		while (counter < length) {
			value = string.charCodeAt(counter++);
			if (value >= 0xD800 && value <= 0xDBFF && counter < length) {
				// high surrogate, and there is a next character
				extra = string.charCodeAt(counter++);
				if ((extra & 0xFC00) == 0xDC00) { // low surrogate
					output.push(((value & 0x3FF) << 10) + (extra & 0x3FF) + 0x10000);
				} else {
					// unmatched surrogate; only append this code unit, in case the next
					// code unit is the high surrogate of a surrogate pair
					output.push(value);
					counter--;
				}
			} else {
				output.push(value);
			}
		}
		return output;
	}

	/**
	 * Creates a string based on an array of numeric code points.
	 * @see `punycode.ucs2.decode`
	 * @memberOf punycode.ucs2
	 * @name encode
	 * @param {Array} codePoints The array of numeric code points.
	 * @returns {String} The new Unicode string (UCS-2).
	 */
	function ucs2encode(array) {
		return map(array, function(value) {
			var output = '';
			if (value > 0xFFFF) {
				value -= 0x10000;
				output += stringFromCharCode(value >>> 10 & 0x3FF | 0xD800);
				value = 0xDC00 | value & 0x3FF;
			}
			output += stringFromCharCode(value);
			return output;
		}).join('');
	}

	/**
	 * Converts a basic code point into a digit/integer.
	 * @see `digitToBasic()`
	 * @private
	 * @param {Number} codePoint The basic numeric code point value.
	 * @returns {Number} The numeric value of a basic code point (for use in
	 * representing integers) in the range `0` to `base - 1`, or `base` if
	 * the code point does not represent a value.
	 */
	function basicToDigit(codePoint) {
		if (codePoint - 48 < 10) {
			return codePoint - 22;
		}
		if (codePoint - 65 < 26) {
			return codePoint - 65;
		}
		if (codePoint - 97 < 26) {
			return codePoint - 97;
		}
		return base;
	}

	/**
	 * Converts a digit/integer into a basic code point.
	 * @see `basicToDigit()`
	 * @private
	 * @param {Number} digit The numeric value of a basic code point.
	 * @returns {Number} The basic code point whose value (when used for
	 * representing integers) is `digit`, which needs to be in the range
	 * `0` to `base - 1`. If `flag` is non-zero, the uppercase form is
	 * used; else, the lowercase form is used. The behavior is undefined
	 * if `flag` is non-zero and `digit` has no uppercase form.
	 */
	function digitToBasic(digit, flag) {
		//  0..25 map to ASCII a..z or A..Z
		// 26..35 map to ASCII 0..9
		return digit + 22 + 75 * (digit < 26) - ((flag != 0) << 5);
	}

	/**
	 * Bias adaptation function as per section 3.4 of RFC 3492.
	 * https://tools.ietf.org/html/rfc3492#section-3.4
	 * @private
	 */
	function adapt(delta, numPoints, firstTime) {
		var k = 0;
		delta = firstTime ? floor(delta / damp) : delta >> 1;
		delta += floor(delta / numPoints);
		for (/* no initialization */; delta > baseMinusTMin * tMax >> 1; k += base) {
			delta = floor(delta / baseMinusTMin);
		}
		return floor(k + (baseMinusTMin + 1) * delta / (delta + skew));
	}

	/**
	 * Converts a Punycode string of ASCII-only symbols to a string of Unicode
	 * symbols.
	 * @memberOf punycode
	 * @param {String} input The Punycode string of ASCII-only symbols.
	 * @returns {String} The resulting string of Unicode symbols.
	 */
	function decode(input) {
		// Don't use UCS-2
		var output = [],
		    inputLength = input.length,
		    out,
		    i = 0,
		    n = initialN,
		    bias = initialBias,
		    basic,
		    j,
		    index,
		    oldi,
		    w,
		    k,
		    digit,
		    t,
		    /** Cached calculation results */
		    baseMinusT;

		// Handle the basic code points: let `basic` be the number of input code
		// points before the last delimiter, or `0` if there is none, then copy
		// the first basic code points to the output.

		basic = input.lastIndexOf(delimiter);
		if (basic < 0) {
			basic = 0;
		}

		for (j = 0; j < basic; ++j) {
			// if it's not a basic code point
			if (input.charCodeAt(j) >= 0x80) {
				error('not-basic');
			}
			output.push(input.charCodeAt(j));
		}

		// Main decoding loop: start just after the last delimiter if any basic code
		// points were copied; start at the beginning otherwise.

		for (index = basic > 0 ? basic + 1 : 0; index < inputLength; /* no final expression */) {

			// `index` is the index of the next character to be consumed.
			// Decode a generalized variable-length integer into `delta`,
			// which gets added to `i`. The overflow checking is easier
			// if we increase `i` as we go, then subtract off its starting
			// value at the end to obtain `delta`.
			for (oldi = i, w = 1, k = base; /* no condition */; k += base) {

				if (index >= inputLength) {
					error('invalid-input');
				}

				digit = basicToDigit(input.charCodeAt(index++));

				if (digit >= base || digit > floor((maxInt - i) / w)) {
					error('overflow');
				}

				i += digit * w;
				t = k <= bias ? tMin : (k >= bias + tMax ? tMax : k - bias);

				if (digit < t) {
					break;
				}

				baseMinusT = base - t;
				if (w > floor(maxInt / baseMinusT)) {
					error('overflow');
				}

				w *= baseMinusT;

			}

			out = output.length + 1;
			bias = adapt(i - oldi, out, oldi == 0);

			// `i` was supposed to wrap around from `out` to `0`,
			// incrementing `n` each time, so we'll fix that now:
			if (floor(i / out) > maxInt - n) {
				error('overflow');
			}

			n += floor(i / out);
			i %= out;

			// Insert `n` at position `i` of the output
			output.splice(i++, 0, n);

		}

		return ucs2encode(output);
	}

	/**
	 * Converts a string of Unicode symbols (e.g. a domain name label) to a
	 * Punycode string of ASCII-only symbols.
	 * @memberOf punycode
	 * @param {String} input The string of Unicode symbols.
	 * @returns {String} The resulting Punycode string of ASCII-only symbols.
	 */
	function encode(input) {
		var n,
		    delta,
		    handledCPCount,
		    basicLength,
		    bias,
		    j,
		    m,
		    q,
		    k,
		    t,
		    currentValue,
		    output = [],
		    /** `inputLength` will hold the number of code points in `input`. */
		    inputLength,
		    /** Cached calculation results */
		    handledCPCountPlusOne,
		    baseMinusT,
		    qMinusT;

		// Convert the input in UCS-2 to Unicode
		input = ucs2decode(input);

		// Cache the length
		inputLength = input.length;

		// Initialize the state
		n = initialN;
		delta = 0;
		bias = initialBias;

		// Handle the basic code points
		for (j = 0; j < inputLength; ++j) {
			currentValue = input[j];
			if (currentValue < 0x80) {
				output.push(stringFromCharCode(currentValue));
			}
		}

		handledCPCount = basicLength = output.length;

		// `handledCPCount` is the number of code points that have been handled;
		// `basicLength` is the number of basic code points.

		// Finish the basic string - if it is not empty - with a delimiter
		if (basicLength) {
			output.push(delimiter);
		}

		// Main encoding loop:
		while (handledCPCount < inputLength) {

			// All non-basic code points < n have been handled already. Find the next
			// larger one:
			for (m = maxInt, j = 0; j < inputLength; ++j) {
				currentValue = input[j];
				if (currentValue >= n && currentValue < m) {
					m = currentValue;
				}
			}

			// Increase `delta` enough to advance the decoder's <n,i> state to <m,0>,
			// but guard against overflow
			handledCPCountPlusOne = handledCPCount + 1;
			if (m - n > floor((maxInt - delta) / handledCPCountPlusOne)) {
				error('overflow');
			}

			delta += (m - n) * handledCPCountPlusOne;
			n = m;

			for (j = 0; j < inputLength; ++j) {
				currentValue = input[j];

				if (currentValue < n && ++delta > maxInt) {
					error('overflow');
				}

				if (currentValue == n) {
					// Represent delta as a generalized variable-length integer
					for (q = delta, k = base; /* no condition */; k += base) {
						t = k <= bias ? tMin : (k >= bias + tMax ? tMax : k - bias);
						if (q < t) {
							break;
						}
						qMinusT = q - t;
						baseMinusT = base - t;
						output.push(
							stringFromCharCode(digitToBasic(t + qMinusT % baseMinusT, 0))
						);
						q = floor(qMinusT / baseMinusT);
					}

					output.push(stringFromCharCode(digitToBasic(q, 0)));
					bias = adapt(delta, handledCPCountPlusOne, handledCPCount == basicLength);
					delta = 0;
					++handledCPCount;
				}
			}

			++delta;
			++n;

		}
		return output.join('');
	}

	/**
	 * Converts a Punycode string representing a domain name or an email address
	 * to Unicode. Only the Punycoded parts of the input will be converted, i.e.
	 * it doesn't matter if you call it on a string that has already been
	 * converted to Unicode.
	 * @memberOf punycode
	 * @param {String} input The Punycoded domain name or email address to
	 * convert to Unicode.
	 * @returns {String} The Unicode representation of the given Punycode
	 * string.
	 */
	function toUnicode(input) {
		return mapDomain(input, function(string) {
			return regexPunycode.test(string)
				? decode(string.slice(4).toLowerCase())
				: string;
		});
	}

	/**
	 * Converts a Unicode string representing a domain name or an email address to
	 * Punycode. Only the non-ASCII parts of the domain name will be converted,
	 * i.e. it doesn't matter if you call it with a domain that's already in
	 * ASCII.
	 * @memberOf punycode
	 * @param {String} input The domain name or email address to convert, as a
	 * Unicode string.
	 * @returns {String} The Punycode representation of the given domain name or
	 * email address.
	 */
	function toASCII(input) {
		return mapDomain(input, function(string) {
			return regexNonASCII.test(string)
				? 'xn--' + encode(string)
				: string;
		});
	}

	/*--------------------------------------------------------------------------*/

	/** Define the public API */
	punycode = {
		/**
		 * A string representing the current Punycode.js version number.
		 * @memberOf punycode
		 * @type String
		 */
		'version': '1.4.1',
		/**
		 * An object of methods to convert from JavaScript's internal character
		 * representation (UCS-2) to Unicode code points, and back.
		 * @see <https://mathiasbynens.be/notes/javascript-encoding>
		 * @memberOf punycode
		 * @type Object
		 */
		'ucs2': {
			'decode': ucs2decode,
			'encode': ucs2encode
		},
		'decode': decode,
		'encode': encode,
		'toASCII': toASCII,
		'toUnicode': toUnicode
	};

	/** Expose `punycode` */
	// Some AMD build optimizers, like r.js, check for specific condition patterns
	// like the following:
	if (
		typeof define == 'function' &&
		typeof define.amd == 'object' &&
		define.amd
	) {
		define('punycode', function() {
			return punycode;
		});
	} else if (freeExports && freeModule) {
		if (module.exports == freeExports) {
			// in Node.js, io.js, or RingoJS v0.8.0+
			freeModule.exports = punycode;
		} else {
			// in Narwhal or RingoJS v0.7.0-
			for (key in punycode) {
				punycode.hasOwnProperty(key) && (freeExports[key] = punycode[key]);
			}
		}
	} else {
		// in Rhino or a web browser
		root.punycode = punycode;
	}

}(this));

}).call(this,typeof global !== "undefined" ? global : typeof self !== "undefined" ? self : typeof window !== "undefined" ? window : {})
},{}],20:[function(require,module,exports){
// Copyright Joyent, Inc. and other Node contributors.
//
// Permission is hereby granted, free of charge, to any person obtaining a
// copy of this software and associated documentation files (the
// "Software"), to deal in the Software without restriction, including
// without limitation the rights to use, copy, modify, merge, publish,
// distribute, sublicense, and/or sell copies of the Software, and to permit
// persons to whom the Software is furnished to do so, subject to the
// following conditions:
//
// The above copyright notice and this permission notice shall be included
// in all copies or substantial portions of the Software.
//
// THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS
// OR IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF
// MERCHANTABILITY, FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN
// NO EVENT SHALL THE AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM,
// DAMAGES OR OTHER LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR
// OTHERWISE, ARISING FROM, OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE
// USE OR OTHER DEALINGS IN THE SOFTWARE.

'use strict';

// If obj.hasOwnProperty has been overridden, then calling
// obj.hasOwnProperty(prop) will break.
// See: https://github.com/joyent/node/issues/1707
function hasOwnProperty(obj, prop) {
  return Object.prototype.hasOwnProperty.call(obj, prop);
}

module.exports = function(qs, sep, eq, options) {
  sep = sep || '&';
  eq = eq || '=';
  var obj = {};

  if (typeof qs !== 'string' || qs.length === 0) {
    return obj;
  }

  var regexp = /\+/g;
  qs = qs.split(sep);

  var maxKeys = 1000;
  if (options && typeof options.maxKeys === 'number') {
    maxKeys = options.maxKeys;
  }

  var len = qs.length;
  // maxKeys <= 0 means that we should not limit keys count
  if (maxKeys > 0 && len > maxKeys) {
    len = maxKeys;
  }

  for (var i = 0; i < len; ++i) {
    var x = qs[i].replace(regexp, '%20'),
        idx = x.indexOf(eq),
        kstr, vstr, k, v;

    if (idx >= 0) {
      kstr = x.substr(0, idx);
      vstr = x.substr(idx + 1);
    } else {
      kstr = x;
      vstr = '';
    }

    k = decodeURIComponent(kstr);
    v = decodeURIComponent(vstr);

    if (!hasOwnProperty(obj, k)) {
      obj[k] = v;
    } else if (isArray(obj[k])) {
      obj[k].push(v);
    } else {
      obj[k] = [obj[k], v];
    }
  }

  return obj;
};

var isArray = Array.isArray || function (xs) {
  return Object.prototype.toString.call(xs) === '[object Array]';
};

},{}],21:[function(require,module,exports){
// Copyright Joyent, Inc. and other Node contributors.
//
// Permission is hereby granted, free of charge, to any person obtaining a
// copy of this software and associated documentation files (the
// "Software"), to deal in the Software without restriction, including
// without limitation the rights to use, copy, modify, merge, publish,
// distribute, sublicense, and/or sell copies of the Software, and to permit
// persons to whom the Software is furnished to do so, subject to the
// following conditions:
//
// The above copyright notice and this permission notice shall be included
// in all copies or substantial portions of the Software.
//
// THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS
// OR IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF
// MERCHANTABILITY, FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN
// NO EVENT SHALL THE AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM,
// DAMAGES OR OTHER LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR
// OTHERWISE, ARISING FROM, OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE
// USE OR OTHER DEALINGS IN THE SOFTWARE.

'use strict';

var stringifyPrimitive = function(v) {
  switch (typeof v) {
    case 'string':
      return v;

    case 'boolean':
      return v ? 'true' : 'false';

    case 'number':
      return isFinite(v) ? v : '';

    default:
      return '';
  }
};

module.exports = function(obj, sep, eq, name) {
  sep = sep || '&';
  eq = eq || '=';
  if (obj === null) {
    obj = undefined;
  }

  if (typeof obj === 'object') {
    return map(objectKeys(obj), function(k) {
      var ks = encodeURIComponent(stringifyPrimitive(k)) + eq;
      if (isArray(obj[k])) {
        return map(obj[k], function(v) {
          return ks + encodeURIComponent(stringifyPrimitive(v));
        }).join(sep);
      } else {
        return ks + encodeURIComponent(stringifyPrimitive(obj[k]));
      }
    }).join(sep);

  }

  if (!name) return '';
  return encodeURIComponent(stringifyPrimitive(name)) + eq +
         encodeURIComponent(stringifyPrimitive(obj));
};

var isArray = Array.isArray || function (xs) {
  return Object.prototype.toString.call(xs) === '[object Array]';
};

function map (xs, f) {
  if (xs.map) return xs.map(f);
  var res = [];
  for (var i = 0; i < xs.length; i++) {
    res.push(f(xs[i], i));
  }
  return res;
}

var objectKeys = Object.keys || function (obj) {
  var res = [];
  for (var key in obj) {
    if (Object.prototype.hasOwnProperty.call(obj, key)) res.push(key);
  }
  return res;
};

},{}],22:[function(require,module,exports){
'use strict';

exports.decode = exports.parse = require('./decode');
exports.encode = exports.stringify = require('./encode');

},{"./decode":20,"./encode":21}],23:[function(require,module,exports){
(function (setImmediate,clearImmediate){
var nextTick = require('process/browser.js').nextTick;
var apply = Function.prototype.apply;
var slice = Array.prototype.slice;
var immediateIds = {};
var nextImmediateId = 0;

// DOM APIs, for completeness

exports.setTimeout = function() {
  return new Timeout(apply.call(setTimeout, window, arguments), clearTimeout);
};
exports.setInterval = function() {
  return new Timeout(apply.call(setInterval, window, arguments), clearInterval);
};
exports.clearTimeout =
exports.clearInterval = function(timeout) { timeout.close(); };

function Timeout(id, clearFn) {
  this._id = id;
  this._clearFn = clearFn;
}
Timeout.prototype.unref = Timeout.prototype.ref = function() {};
Timeout.prototype.close = function() {
  this._clearFn.call(window, this._id);
};

// Does not start the time, just sets up the members needed.
exports.enroll = function(item, msecs) {
  clearTimeout(item._idleTimeoutId);
  item._idleTimeout = msecs;
};

exports.unenroll = function(item) {
  clearTimeout(item._idleTimeoutId);
  item._idleTimeout = -1;
};

exports._unrefActive = exports.active = function(item) {
  clearTimeout(item._idleTimeoutId);

  var msecs = item._idleTimeout;
  if (msecs >= 0) {
    item._idleTimeoutId = setTimeout(function onTimeout() {
      if (item._onTimeout)
        item._onTimeout();
    }, msecs);
  }
};

// That's not how node.js implements it but the exposed api is the same.
exports.setImmediate = typeof setImmediate === "function" ? setImmediate : function(fn) {
  var id = nextImmediateId++;
  var args = arguments.length < 2 ? false : slice.call(arguments, 1);

  immediateIds[id] = true;

  nextTick(function onNextTick() {
    if (immediateIds[id]) {
      // fn.call() is faster so we optimize for the common use-case
      // @see http://jsperf.com/call-apply-segu
      if (args) {
        fn.apply(null, args);
      } else {
        fn.call(null);
      }
      // Prevent ids from leaking
      exports.clearImmediate(id);
    }
  });

  return id;
};

exports.clearImmediate = typeof clearImmediate === "function" ? clearImmediate : function(id) {
  delete immediateIds[id];
};
}).call(this,require("timers").setImmediate,require("timers").clearImmediate)
},{"process/browser.js":18,"timers":23}],24:[function(require,module,exports){
// Copyright Joyent, Inc. and other Node contributors.
//
// Permission is hereby granted, free of charge, to any person obtaining a
// copy of this software and associated documentation files (the
// "Software"), to deal in the Software without restriction, including
// without limitation the rights to use, copy, modify, merge, publish,
// distribute, sublicense, and/or sell copies of the Software, and to permit
// persons to whom the Software is furnished to do so, subject to the
// following conditions:
//
// The above copyright notice and this permission notice shall be included
// in all copies or substantial portions of the Software.
//
// THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS
// OR IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF
// MERCHANTABILITY, FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN
// NO EVENT SHALL THE AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM,
// DAMAGES OR OTHER LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR
// OTHERWISE, ARISING FROM, OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE
// USE OR OTHER DEALINGS IN THE SOFTWARE.

'use strict';

var punycode = require('punycode');
var util = require('./util');

exports.parse = urlParse;
exports.resolve = urlResolve;
exports.resolveObject = urlResolveObject;
exports.format = urlFormat;

exports.Url = Url;

function Url() {
  this.protocol = null;
  this.slashes = null;
  this.auth = null;
  this.host = null;
  this.port = null;
  this.hostname = null;
  this.hash = null;
  this.search = null;
  this.query = null;
  this.pathname = null;
  this.path = null;
  this.href = null;
}

// Reference: RFC 3986, RFC 1808, RFC 2396

// define these here so at least they only have to be
// compiled once on the first module load.
var protocolPattern = /^([a-z0-9.+-]+:)/i,
    portPattern = /:[0-9]*$/,

    // Special case for a simple path URL
    simplePathPattern = /^(\/\/?(?!\/)[^\?\s]*)(\?[^\s]*)?$/,

    // RFC 2396: characters reserved for delimiting URLs.
    // We actually just auto-escape these.
    delims = ['<', '>', '"', '`', ' ', '\r', '\n', '\t'],

    // RFC 2396: characters not allowed for various reasons.
    unwise = ['{', '}', '|', '\\', '^', '`'].concat(delims),

    // Allowed by RFCs, but cause of XSS attacks.  Always escape these.
    autoEscape = ['\''].concat(unwise),
    // Characters that are never ever allowed in a hostname.
    // Note that any invalid chars are also handled, but these
    // are the ones that are *expected* to be seen, so we fast-path
    // them.
    nonHostChars = ['%', '/', '?', ';', '#'].concat(autoEscape),
    hostEndingChars = ['/', '?', '#'],
    hostnameMaxLen = 255,
    hostnamePartPattern = /^[+a-z0-9A-Z_-]{0,63}$/,
    hostnamePartStart = /^([+a-z0-9A-Z_-]{0,63})(.*)$/,
    // protocols that can allow "unsafe" and "unwise" chars.
    unsafeProtocol = {
      'javascript': true,
      'javascript:': true
    },
    // protocols that never have a hostname.
    hostlessProtocol = {
      'javascript': true,
      'javascript:': true
    },
    // protocols that always contain a // bit.
    slashedProtocol = {
      'http': true,
      'https': true,
      'ftp': true,
      'gopher': true,
      'file': true,
      'http:': true,
      'https:': true,
      'ftp:': true,
      'gopher:': true,
      'file:': true
    },
    querystring = require('querystring');

function urlParse(url, parseQueryString, slashesDenoteHost) {
  if (url && util.isObject(url) && url instanceof Url) return url;

  var u = new Url;
  u.parse(url, parseQueryString, slashesDenoteHost);
  return u;
}

Url.prototype.parse = function(url, parseQueryString, slashesDenoteHost) {
  if (!util.isString(url)) {
    throw new TypeError("Parameter 'url' must be a string, not " + typeof url);
  }

  // Copy chrome, IE, opera backslash-handling behavior.
  // Back slashes before the query string get converted to forward slashes
  // See: https://code.google.com/p/chromium/issues/detail?id=25916
  var queryIndex = url.indexOf('?'),
      splitter =
          (queryIndex !== -1 && queryIndex < url.indexOf('#')) ? '?' : '#',
      uSplit = url.split(splitter),
      slashRegex = /\\/g;
  uSplit[0] = uSplit[0].replace(slashRegex, '/');
  url = uSplit.join(splitter);

  var rest = url;

  // trim before proceeding.
  // This is to support parse stuff like "  http://foo.com  \n"
  rest = rest.trim();

  if (!slashesDenoteHost && url.split('#').length === 1) {
    // Try fast path regexp
    var simplePath = simplePathPattern.exec(rest);
    if (simplePath) {
      this.path = rest;
      this.href = rest;
      this.pathname = simplePath[1];
      if (simplePath[2]) {
        this.search = simplePath[2];
        if (parseQueryString) {
          this.query = querystring.parse(this.search.substr(1));
        } else {
          this.query = this.search.substr(1);
        }
      } else if (parseQueryString) {
        this.search = '';
        this.query = {};
      }
      return this;
    }
  }

  var proto = protocolPattern.exec(rest);
  if (proto) {
    proto = proto[0];
    var lowerProto = proto.toLowerCase();
    this.protocol = lowerProto;
    rest = rest.substr(proto.length);
  }

  // figure out if it's got a host
  // user@server is *always* interpreted as a hostname, and url
  // resolution will treat //foo/bar as host=foo,path=bar because that's
  // how the browser resolves relative URLs.
  if (slashesDenoteHost || proto || rest.match(/^\/\/[^@\/]+@[^@\/]+/)) {
    var slashes = rest.substr(0, 2) === '//';
    if (slashes && !(proto && hostlessProtocol[proto])) {
      rest = rest.substr(2);
      this.slashes = true;
    }
  }

  if (!hostlessProtocol[proto] &&
      (slashes || (proto && !slashedProtocol[proto]))) {

    // there's a hostname.
    // the first instance of /, ?, ;, or # ends the host.
    //
    // If there is an @ in the hostname, then non-host chars *are* allowed
    // to the left of the last @ sign, unless some host-ending character
    // comes *before* the @-sign.
    // URLs are obnoxious.
    //
    // ex:
    // http://a@b@c/ => user:a@b host:c
    // http://a@b?@c => user:a host:c path:/?@c

    // v0.12 TODO(isaacs): This is not quite how Chrome does things.
    // Review our test case against browsers more comprehensively.

    // find the first instance of any hostEndingChars
    var hostEnd = -1;
    for (var i = 0; i < hostEndingChars.length; i++) {
      var hec = rest.indexOf(hostEndingChars[i]);
      if (hec !== -1 && (hostEnd === -1 || hec < hostEnd))
        hostEnd = hec;
    }

    // at this point, either we have an explicit point where the
    // auth portion cannot go past, or the last @ char is the decider.
    var auth, atSign;
    if (hostEnd === -1) {
      // atSign can be anywhere.
      atSign = rest.lastIndexOf('@');
    } else {
      // atSign must be in auth portion.
      // http://a@b/c@d => host:b auth:a path:/c@d
      atSign = rest.lastIndexOf('@', hostEnd);
    }

    // Now we have a portion which is definitely the auth.
    // Pull that off.
    if (atSign !== -1) {
      auth = rest.slice(0, atSign);
      rest = rest.slice(atSign + 1);
      this.auth = decodeURIComponent(auth);
    }

    // the host is the remaining to the left of the first non-host char
    hostEnd = -1;
    for (var i = 0; i < nonHostChars.length; i++) {
      var hec = rest.indexOf(nonHostChars[i]);
      if (hec !== -1 && (hostEnd === -1 || hec < hostEnd))
        hostEnd = hec;
    }
    // if we still have not hit it, then the entire thing is a host.
    if (hostEnd === -1)
      hostEnd = rest.length;

    this.host = rest.slice(0, hostEnd);
    rest = rest.slice(hostEnd);

    // pull out port.
    this.parseHost();

    // we've indicated that there is a hostname,
    // so even if it's empty, it has to be present.
    this.hostname = this.hostname || '';

    // if hostname begins with [ and ends with ]
    // assume that it's an IPv6 address.
    var ipv6Hostname = this.hostname[0] === '[' &&
        this.hostname[this.hostname.length - 1] === ']';

    // validate a little.
    if (!ipv6Hostname) {
      var hostparts = this.hostname.split(/\./);
      for (var i = 0, l = hostparts.length; i < l; i++) {
        var part = hostparts[i];
        if (!part) continue;
        if (!part.match(hostnamePartPattern)) {
          var newpart = '';
          for (var j = 0, k = part.length; j < k; j++) {
            if (part.charCodeAt(j) > 127) {
              // we replace non-ASCII char with a temporary placeholder
              // we need this to make sure size of hostname is not
              // broken by replacing non-ASCII by nothing
              newpart += 'x';
            } else {
              newpart += part[j];
            }
          }
          // we test again with ASCII char only
          if (!newpart.match(hostnamePartPattern)) {
            var validParts = hostparts.slice(0, i);
            var notHost = hostparts.slice(i + 1);
            var bit = part.match(hostnamePartStart);
            if (bit) {
              validParts.push(bit[1]);
              notHost.unshift(bit[2]);
            }
            if (notHost.length) {
              rest = '/' + notHost.join('.') + rest;
            }
            this.hostname = validParts.join('.');
            break;
          }
        }
      }
    }

    if (this.hostname.length > hostnameMaxLen) {
      this.hostname = '';
    } else {
      // hostnames are always lower case.
      this.hostname = this.hostname.toLowerCase();
    }

    if (!ipv6Hostname) {
      // IDNA Support: Returns a punycoded representation of "domain".
      // It only converts parts of the domain name that
      // have non-ASCII characters, i.e. it doesn't matter if
      // you call it with a domain that already is ASCII-only.
      this.hostname = punycode.toASCII(this.hostname);
    }

    var p = this.port ? ':' + this.port : '';
    var h = this.hostname || '';
    this.host = h + p;
    this.href += this.host;

    // strip [ and ] from the hostname
    // the host field still retains them, though
    if (ipv6Hostname) {
      this.hostname = this.hostname.substr(1, this.hostname.length - 2);
      if (rest[0] !== '/') {
        rest = '/' + rest;
      }
    }
  }

  // now rest is set to the post-host stuff.
  // chop off any delim chars.
  if (!unsafeProtocol[lowerProto]) {

    // First, make 100% sure that any "autoEscape" chars get
    // escaped, even if encodeURIComponent doesn't think they
    // need to be.
    for (var i = 0, l = autoEscape.length; i < l; i++) {
      var ae = autoEscape[i];
      if (rest.indexOf(ae) === -1)
        continue;
      var esc = encodeURIComponent(ae);
      if (esc === ae) {
        esc = escape(ae);
      }
      rest = rest.split(ae).join(esc);
    }
  }


  // chop off from the tail first.
  var hash = rest.indexOf('#');
  if (hash !== -1) {
    // got a fragment string.
    this.hash = rest.substr(hash);
    rest = rest.slice(0, hash);
  }
  var qm = rest.indexOf('?');
  if (qm !== -1) {
    this.search = rest.substr(qm);
    this.query = rest.substr(qm + 1);
    if (parseQueryString) {
      this.query = querystring.parse(this.query);
    }
    rest = rest.slice(0, qm);
  } else if (parseQueryString) {
    // no query string, but parseQueryString still requested
    this.search = '';
    this.query = {};
  }
  if (rest) this.pathname = rest;
  if (slashedProtocol[lowerProto] &&
      this.hostname && !this.pathname) {
    this.pathname = '/';
  }

  //to support http.request
  if (this.pathname || this.search) {
    var p = this.pathname || '';
    var s = this.search || '';
    this.path = p + s;
  }

  // finally, reconstruct the href based on what has been validated.
  this.href = this.format();
  return this;
};

// format a parsed object into a url string
function urlFormat(obj) {
  // ensure it's an object, and not a string url.
  // If it's an obj, this is a no-op.
  // this way, you can call url_format() on strings
  // to clean up potentially wonky urls.
  if (util.isString(obj)) obj = urlParse(obj);
  if (!(obj instanceof Url)) return Url.prototype.format.call(obj);
  return obj.format();
}

Url.prototype.format = function() {
  var auth = this.auth || '';
  if (auth) {
    auth = encodeURIComponent(auth);
    auth = auth.replace(/%3A/i, ':');
    auth += '@';
  }

  var protocol = this.protocol || '',
      pathname = this.pathname || '',
      hash = this.hash || '',
      host = false,
      query = '';

  if (this.host) {
    host = auth + this.host;
  } else if (this.hostname) {
    host = auth + (this.hostname.indexOf(':') === -1 ?
        this.hostname :
        '[' + this.hostname + ']');
    if (this.port) {
      host += ':' + this.port;
    }
  }

  if (this.query &&
      util.isObject(this.query) &&
      Object.keys(this.query).length) {
    query = querystring.stringify(this.query);
  }

  var search = this.search || (query && ('?' + query)) || '';

  if (protocol && protocol.substr(-1) !== ':') protocol += ':';

  // only the slashedProtocols get the //.  Not mailto:, xmpp:, etc.
  // unless they had them to begin with.
  if (this.slashes ||
      (!protocol || slashedProtocol[protocol]) && host !== false) {
    host = '//' + (host || '');
    if (pathname && pathname.charAt(0) !== '/') pathname = '/' + pathname;
  } else if (!host) {
    host = '';
  }

  if (hash && hash.charAt(0) !== '#') hash = '#' + hash;
  if (search && search.charAt(0) !== '?') search = '?' + search;

  pathname = pathname.replace(/[?#]/g, function(match) {
    return encodeURIComponent(match);
  });
  search = search.replace('#', '%23');

  return protocol + host + pathname + search + hash;
};

function urlResolve(source, relative) {
  return urlParse(source, false, true).resolve(relative);
}

Url.prototype.resolve = function(relative) {
  return this.resolveObject(urlParse(relative, false, true)).format();
};

function urlResolveObject(source, relative) {
  if (!source) return relative;
  return urlParse(source, false, true).resolveObject(relative);
}

Url.prototype.resolveObject = function(relative) {
  if (util.isString(relative)) {
    var rel = new Url();
    rel.parse(relative, false, true);
    relative = rel;
  }

  var result = new Url();
  var tkeys = Object.keys(this);
  for (var tk = 0; tk < tkeys.length; tk++) {
    var tkey = tkeys[tk];
    result[tkey] = this[tkey];
  }

  // hash is always overridden, no matter what.
  // even href="" will remove it.
  result.hash = relative.hash;

  // if the relative url is empty, then there's nothing left to do here.
  if (relative.href === '') {
    result.href = result.format();
    return result;
  }

  // hrefs like //foo/bar always cut to the protocol.
  if (relative.slashes && !relative.protocol) {
    // take everything except the protocol from relative
    var rkeys = Object.keys(relative);
    for (var rk = 0; rk < rkeys.length; rk++) {
      var rkey = rkeys[rk];
      if (rkey !== 'protocol')
        result[rkey] = relative[rkey];
    }

    //urlParse appends trailing / to urls like http://www.example.com
    if (slashedProtocol[result.protocol] &&
        result.hostname && !result.pathname) {
      result.path = result.pathname = '/';
    }

    result.href = result.format();
    return result;
  }

  if (relative.protocol && relative.protocol !== result.protocol) {
    // if it's a known url protocol, then changing
    // the protocol does weird things
    // first, if it's not file:, then we MUST have a host,
    // and if there was a path
    // to begin with, then we MUST have a path.
    // if it is file:, then the host is dropped,
    // because that's known to be hostless.
    // anything else is assumed to be absolute.
    if (!slashedProtocol[relative.protocol]) {
      var keys = Object.keys(relative);
      for (var v = 0; v < keys.length; v++) {
        var k = keys[v];
        result[k] = relative[k];
      }
      result.href = result.format();
      return result;
    }

    result.protocol = relative.protocol;
    if (!relative.host && !hostlessProtocol[relative.protocol]) {
      var relPath = (relative.pathname || '').split('/');
      while (relPath.length && !(relative.host = relPath.shift()));
      if (!relative.host) relative.host = '';
      if (!relative.hostname) relative.hostname = '';
      if (relPath[0] !== '') relPath.unshift('');
      if (relPath.length < 2) relPath.unshift('');
      result.pathname = relPath.join('/');
    } else {
      result.pathname = relative.pathname;
    }
    result.search = relative.search;
    result.query = relative.query;
    result.host = relative.host || '';
    result.auth = relative.auth;
    result.hostname = relative.hostname || relative.host;
    result.port = relative.port;
    // to support http.request
    if (result.pathname || result.search) {
      var p = result.pathname || '';
      var s = result.search || '';
      result.path = p + s;
    }
    result.slashes = result.slashes || relative.slashes;
    result.href = result.format();
    return result;
  }

  var isSourceAbs = (result.pathname && result.pathname.charAt(0) === '/'),
      isRelAbs = (
          relative.host ||
          relative.pathname && relative.pathname.charAt(0) === '/'
      ),
      mustEndAbs = (isRelAbs || isSourceAbs ||
                    (result.host && relative.pathname)),
      removeAllDots = mustEndAbs,
      srcPath = result.pathname && result.pathname.split('/') || [],
      relPath = relative.pathname && relative.pathname.split('/') || [],
      psychotic = result.protocol && !slashedProtocol[result.protocol];

  // if the url is a non-slashed url, then relative
  // links like ../.. should be able
  // to crawl up to the hostname, as well.  This is strange.
  // result.protocol has already been set by now.
  // Later on, put the first path part into the host field.
  if (psychotic) {
    result.hostname = '';
    result.port = null;
    if (result.host) {
      if (srcPath[0] === '') srcPath[0] = result.host;
      else srcPath.unshift(result.host);
    }
    result.host = '';
    if (relative.protocol) {
      relative.hostname = null;
      relative.port = null;
      if (relative.host) {
        if (relPath[0] === '') relPath[0] = relative.host;
        else relPath.unshift(relative.host);
      }
      relative.host = null;
    }
    mustEndAbs = mustEndAbs && (relPath[0] === '' || srcPath[0] === '');
  }

  if (isRelAbs) {
    // it's absolute.
    result.host = (relative.host || relative.host === '') ?
                  relative.host : result.host;
    result.hostname = (relative.hostname || relative.hostname === '') ?
                      relative.hostname : result.hostname;
    result.search = relative.search;
    result.query = relative.query;
    srcPath = relPath;
    // fall through to the dot-handling below.
  } else if (relPath.length) {
    // it's relative
    // throw away the existing file, and take the new path instead.
    if (!srcPath) srcPath = [];
    srcPath.pop();
    srcPath = srcPath.concat(relPath);
    result.search = relative.search;
    result.query = relative.query;
  } else if (!util.isNullOrUndefined(relative.search)) {
    // just pull out the search.
    // like href='?foo'.
    // Put this after the other two cases because it simplifies the booleans
    if (psychotic) {
      result.hostname = result.host = srcPath.shift();
      //occationaly the auth can get stuck only in host
      //this especially happens in cases like
      //url.resolveObject('mailto:local1@domain1', 'local2@domain2')
      var authInHost = result.host && result.host.indexOf('@') > 0 ?
                       result.host.split('@') : false;
      if (authInHost) {
        result.auth = authInHost.shift();
        result.host = result.hostname = authInHost.shift();
      }
    }
    result.search = relative.search;
    result.query = relative.query;
    //to support http.request
    if (!util.isNull(result.pathname) || !util.isNull(result.search)) {
      result.path = (result.pathname ? result.pathname : '') +
                    (result.search ? result.search : '');
    }
    result.href = result.format();
    return result;
  }

  if (!srcPath.length) {
    // no path at all.  easy.
    // we've already handled the other stuff above.
    result.pathname = null;
    //to support http.request
    if (result.search) {
      result.path = '/' + result.search;
    } else {
      result.path = null;
    }
    result.href = result.format();
    return result;
  }

  // if a url ENDs in . or .., then it must get a trailing slash.
  // however, if it ends in anything else non-slashy,
  // then it must NOT get a trailing slash.
  var last = srcPath.slice(-1)[0];
  var hasTrailingSlash = (
      (result.host || relative.host || srcPath.length > 1) &&
      (last === '.' || last === '..') || last === '');

  // strip single dots, resolve double dots to parent dir
  // if the path tries to go above the root, `up` ends up > 0
  var up = 0;
  for (var i = srcPath.length; i >= 0; i--) {
    last = srcPath[i];
    if (last === '.') {
      srcPath.splice(i, 1);
    } else if (last === '..') {
      srcPath.splice(i, 1);
      up++;
    } else if (up) {
      srcPath.splice(i, 1);
      up--;
    }
  }

  // if the path is allowed to go above the root, restore leading ..s
  if (!mustEndAbs && !removeAllDots) {
    for (; up--; up) {
      srcPath.unshift('..');
    }
  }

  if (mustEndAbs && srcPath[0] !== '' &&
      (!srcPath[0] || srcPath[0].charAt(0) !== '/')) {
    srcPath.unshift('');
  }

  if (hasTrailingSlash && (srcPath.join('/').substr(-1) !== '/')) {
    srcPath.push('');
  }

  var isAbsolute = srcPath[0] === '' ||
      (srcPath[0] && srcPath[0].charAt(0) === '/');

  // put the host back
  if (psychotic) {
    result.hostname = result.host = isAbsolute ? '' :
                                    srcPath.length ? srcPath.shift() : '';
    //occationaly the auth can get stuck only in host
    //this especially happens in cases like
    //url.resolveObject('mailto:local1@domain1', 'local2@domain2')
    var authInHost = result.host && result.host.indexOf('@') > 0 ?
                     result.host.split('@') : false;
    if (authInHost) {
      result.auth = authInHost.shift();
      result.host = result.hostname = authInHost.shift();
    }
  }

  mustEndAbs = mustEndAbs || (result.host && srcPath.length);

  if (mustEndAbs && !isAbsolute) {
    srcPath.unshift('');
  }

  if (!srcPath.length) {
    result.pathname = null;
    result.path = null;
  } else {
    result.pathname = srcPath.join('/');
  }

  //to support request.http
  if (!util.isNull(result.pathname) || !util.isNull(result.search)) {
    result.path = (result.pathname ? result.pathname : '') +
                  (result.search ? result.search : '');
  }
  result.auth = relative.auth || result.auth;
  result.slashes = result.slashes || relative.slashes;
  result.href = result.format();
  return result;
};

Url.prototype.parseHost = function() {
  var host = this.host;
  var port = portPattern.exec(host);
  if (port) {
    port = port[0];
    if (port !== ':') {
      this.port = port.substr(1);
    }
    host = host.substr(0, host.length - port.length);
  }
  if (host) this.hostname = host;
};

},{"./util":25,"punycode":19,"querystring":22}],25:[function(require,module,exports){
'use strict';

module.exports = {
  isString: function(arg) {
    return typeof(arg) === 'string';
  },
  isObject: function(arg) {
    return typeof(arg) === 'object' && arg !== null;
  },
  isNull: function(arg) {
    return arg === null;
  },
  isNullOrUndefined: function(arg) {
    return arg == null;
  }
};

},{}]},{},[])("/../../dist/framework/PAKE/SRP/Browser.js")
});

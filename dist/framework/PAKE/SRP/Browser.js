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
//# sourceMappingURL=Browser.js.map
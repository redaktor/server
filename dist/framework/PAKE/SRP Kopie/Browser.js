"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const Base_1 = require("./Base");
class Browser extends Base_1.Base {
    constructor(_SRP = 4096) {
        super(_SRP);
        this.a = null;
        this.u = null;
        this.M1 = null;
        this.s = null;
    }
    static register(form, customSRPgroup = 4096) {
        const { shared, secret } = Browser.formResult(form);
        let Client = new Browser(customSRPgroup);
        const parameters = JSON.stringify(Client.register(shared.identity, secret.password));
        form.querySelector('[name="credentials"]').value = parameters;
        Client = null;
        form.submit();
    }
    static login(form, challengePath = form.action) {
        const { shared, secret } = Browser.formResult(form);
        const cData = {
            I: Browser.hash(shared.identity),
            action: Base_1.Base.ACTIONS.R_SRP_AUTH
        };
        Browser.send(challengePath, cData, shared, function (res) {
            const client = new Browser(res.group);
            const lData = client.login(res, secret.password);
            Browser.send(form.action, lData, shared, (res) => {
                const vData = client.evidence.call(client, res);
                Browser.send(form.action, vData, shared, (res) => {
                    console.log('FINAL', res);
                });
            });
        });
    }
    register(identity, P) {
        if (!!this.state) {
            throw new Error(Base_1.Errors.IllegalStateException);
        }
        const action = Base_1.Base.ACTIONS.R_REGISTER;
        const I = this.H(identity);
        this.put({ I, P, s: this.generateRandomSalt(), state: action });
        const { s, group } = this;
        return this.registerResult({ I, identity, group, action, s, v: this.makeV() });
    }
    login(res, P) {
        const { I } = res;
        if (!!this.state) {
            throw new Error(Base_1.Errors.IllegalStateException);
        }
        this.checks({ I, P }, true) && this.put({ I, P, state: Base_1.Base.ACTIONS.R_SRP_AUTH });
        const result = this.crypto(res);
        return this.loginResult(result);
    }
    registerResult(res) { return res; }
    loginResult(res) { return res; }
    crypto(res) {
        if (this.state !== Base_1.Base.ACTIONS.R_SRP_AUTH) {
            throw new Error(Base_1.Errors.IllegalStateException);
        }
        const action = Base_1.Base.ACTIONS.R_SRP_EVIDENCE;
        const { B, s } = res;
        this.checks({ s, B });
        this.put({ s, B: Base_1.Base.fromHex(B), a: this.randomA(s), state: action });
        this.checkAB('B');
        this.generateX(this.I, this.P);
        this.put({ P: null, A: this.g.modPow(this.a, this.N) });
        this.checkAB('A');
        this.u = this.computeU(this.A.toString(16), B);
        this.S = this.setSessionKey(this.x);
        this.check(this.S, 'S');
        const [A, S] = [Base_1.Base.toHex(this.A), Base_1.Base.toHex(this.S)];
        let M1 = Base_1.Base.trimLeadingZeros(this.H(A + B + S));
        this.check(M1, 'M1');
        this.M1 = M1;
        return this.cryptoResult({ I: this.I, A, M1, action, token: res.token });
    }
    cryptoResult(res) { return res; }
    evidence(res) {
        let { M2, token } = res;
        this.check(M2, 'M2');
        if (this.state !== Base_1.Base.ACTIONS.R_SRP_EVIDENCE) {
            throw new Error(Base_1.Errors.IllegalStateException);
        }
        const k = this.getSessionSecret(this.s);
        token = this.encrypt(token, k);
        const action = Base_1.Base.ACTIONS.R_SRP_VERIFY;
        const computedM2 = this.H(Base_1.Base.toHex(this.A) + this.M1 + Base_1.Base.toHex(this.S));
        if (`${Base_1.Base.trimLeadingZeros(computedM2)}` !== M2) {
            throw new Error(Base_1.Errors.SRP6ExceptionCredentials);
        }
        this.put({ M2, state: action });
        return { I: this.I, action, token };
    }
    generateRandomSalt(optionalServerSalt = 's') {
        return this.H(`${new Date()}:${optionalServerSalt}:${Base_1.Base.randomByteHex()}`);
    }
    makeV(I = this.I, P = this.P) {
        const x = this.generateX(I, P);
        this.v = this.g.modPow(x, this.N);
        return Base_1.Base.toHex(this.v);
    }
    generateX(I, P) {
        this.checks({ I, P }, true);
        const _h = Base_1.Base.trimLeadingZeros(this.H(`${I}:${P}`));
        const hash = Base_1.Base.trimLeadingZeros(this.H(`${this.s}${_h}`.toUpperCase()));
        this.x = Base_1.Base.fromHex(hash).mod(this.N);
        return this.x;
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
    static send(path, data, pub, cb) {
        const { _csrf = '' } = pub;
        const req = new XMLHttpRequest();
        req.addEventListener('load', function () {
            if (this.readyState !== 4 || this.status !== 200) {
                return;
            }
            cb.call(this, JSON.parse(this.responseText));
        });
        req.open('POST', path, true);
        req.setRequestHeader('Content-type', 'application/x-www-form-urlencoded');
        req.setRequestHeader('CSRF-Token', _csrf || '');
        req.send(`credentials=${JSON.stringify(data)}`);
    }
}
exports.Browser = Browser;
//# sourceMappingURL=Browser.js.map
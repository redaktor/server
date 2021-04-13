"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const pwBase_1 = require("./pwBase");
class Browser extends pwBase_1.pwBase {
    constructor(N_base10 = Browser.rfc5054_2048.N_base10, g_base10 = Browser.rfc5054_2048.g_base10, k_base16 = Browser.rfc5054_2048.k_base16) {
        super(N_base10, g_base10, k_base16);
        this.N_base10 = N_base10;
        this.g_base10 = g_base10;
        this.k_base16 = k_base16;
        this.x = null;
        this.v = null;
        this.B = null;
        this.A = null;
        this.a = null;
        this.u = null;
        this.S = null;
        this.K = null;
        this.M1str = null;
    }
    step1(identity, password) {
        if (!!this.state) {
            throw new Error('IllegalStateException not in state INIT');
        }
        this.checks({ identity, password }, true);
        this.I = identity;
        this.P = password;
        this.state = Browser.PWSTATE.STEP1;
    }
    step2(s, BB) {
        this.checks({ s, BB });
        if (this.state !== Browser.PWSTATE.STEP1) {
            throw new Error('IllegalStateException not in state STEP1');
        }
        this.B = Browser.fromHex(BB);
        let ZERO = null;
        ZERO = this.BigIntZero;
        if (this.B.mod(this.N()).equals(ZERO)) {
            throw new Error(`SRP6Exception bad server public value 'B' as B == 0 (mod N)`);
        }
        const x = this.generateX(s, this.I, this.P);
        this.P = null;
        this.a = this.randomA(this.N);
        this.A = this.g().modPow(this.a, this.N());
        this.check(this.A, 'A');
        this.u = this.computeU(this.A.toString(16), BB);
        this.S = this.computeSessionKey(x);
        this.check(this.S, 'S');
        const AA = Browser.toHex(this.A);
        const S = Browser.toHex(this.S);
        this.M1str = this.H(AA + BB + S);
        this.check(this.M1str, 'M1str');
        this.M1str = this.trimLeadingZeros(this.M1str);
        this.state = Browser.PWSTATE.STEP2;
        return { A: AA, M1: this.M1str };
    }
    step3(M2) {
        this.check(M2, 'M2');
        if (this.state !== Browser.PWSTATE.STEP2) {
            throw new Error('IllegalStateException: Session must be in STEP2 state');
        }
        let computedM2 = this.H(Browser.toHex(this.A) + this.M1str + Browser.toHex(this.S));
        computedM2 = this.trimLeadingZeros(computedM2);
        if (`${computedM2}` !== `${M2}`) {
            throw new Error('SRP6Exception Bad server credentials');
        }
        this.state = Browser.PWSTATE.STEP3;
        return true;
    }
    getSessionKey(hash) {
        if (this.S === null) {
            return null;
        }
        const hexedS = Browser.toHex(this.S);
        if (hash === false) {
            return hexedS;
        }
        if (this.K === null) {
            this.K = this.H(hexedS);
        }
        return this.K;
    }
    generateRandomSalt(optionalServerSalt = 's') {
        return this.H(`${new Date()}:${optionalServerSalt}:${Browser.randomByteHex()}`);
    }
    generateVerifier(salt, identity, password) {
        const x = this.generateX(salt, identity, password);
        this.v = this.g().modPow(x, this.N());
        return Browser.toHex(this.v);
    }
    check(v, name) {
        if (typeof v === 'undefined' || v === null || v === "" || v === "0") {
            throw new Error(`${name} must not be null, empty or zero`);
        }
    }
    checks(o, areStrings = false) {
        for (let name in o) {
            this.check(o[name], name);
            if (areStrings && typeof o[name] !== 'string') {
                throw new Error(`${name} must be a String`);
            }
        }
    }
    generateX(salt, identity, password) {
        this.checks({ salt, identity, password }, true);
        this.salt = salt;
        const _h = this.trimLeadingZeros(this.H(`${identity}:${password}`));
        const hash = this.trimLeadingZeros(this.H(`${salt}${_h}`.toUpperCase()));
        this.x = Browser.fromHex(hash).mod(this.N());
        return this.x;
    }
    computeSessionKey(x, k = this.k, u = this.u, a = this.a, B = this.B) {
        this.checks({ k, x, u, a, B });
        var exp = u.multiply(x).add(a);
        var tmp = this.g().modPow(x, this.N()).multiply(k);
        return B.subtract(tmp).modPow(exp, this.N());
    }
    randomA(N) {
        var hexLength = Browser.toHex(N).length;
        var ZERO = Browser.BigInteger('0', 10);
        var ONE = Browser.BigInteger('1', 10);
        var r = ZERO;
        while (ZERO.equals(r)) {
            var rstr = `${Browser.randomByteHex()}${Browser.randomByteHex()}`;
            while (rstr.length < hexLength) {
                rstr = `${rstr}${Browser.randomByteHex()}`;
            }
            var rBi = Browser.BigInteger(rstr, 16);
            var oneTimeBi = Browser.BigInteger(this.H(this.I + ':' + this.salt + ':' + (new Date()).getTime()), 16);
            r = (oneTimeBi.add(rBi)).modPow(ONE, N);
        }
        return r;
    }
    computeU(Astr, Bstr) {
        this.checks({ Astr, Bstr }, true);
        var output = this.H(Astr + Bstr);
        var u = Browser.BigInteger(output, 16);
        if (this.BigIntZero.equals(u)) {
            throw new Error(`SRP6Exception bad shared public value 'u' as u==0`);
        }
        return u;
    }
}
exports.Browser = Browser;
//# sourceMappingURL=browser.js.map
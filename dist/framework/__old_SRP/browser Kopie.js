function SRP6JavascriptClientSession() {
    "use strict";
    this.INIT = 0;
    this.STEP_1 = 1;
    this.STEP_2 = 2;
    this.STEP_3 = 3;
    this.state = this.INIT;
    this.x = null;
    this.v = null;
    this.I = null;
    this.P = null;
    this.salt = null;
    this.B = null;
    this.A = null;
    this.a = null;
    this.k = null;
    this.u = null;
    this.S = null;
    this.K = null;
    this.M1str = null;
    this.check = function (v, name) {
        if (typeof v === 'undefined' || v === null || v === "" || v === "0") {
            throw new Error(name + " must not be null, empty or zero");
        }
    };
    this.generateX = function (salt, identity, password) {
        this.check(salt, "salt");
        this.check(identity, "identity");
        this.check(password, "password");
        this.salt = salt;
        var hash1 = this.H(identity + ':' + password);
        while (hash1.substring(0, 1) === '0') {
            hash1 = hash1.substring(1);
        }
        var concat = (salt + hash1).toUpperCase();
        var hash = this.H(concat);
        while (hash.substring(0, 1) === '0') {
            hash = hash.substring(1);
        }
        this.x = this.fromHex(hash).mod(this.N());
        return this.x;
    };
    this.computeSessionKey = function (k, x, u, a, B) {
        this.check(k, "k");
        this.check(x, "x");
        this.check(u, "u");
        this.check(a, "a");
        this.check(B, "B");
        var exp = u.multiply(x).add(a);
        var tmp = this.g().modPow(x, this.N()).multiply(k);
        return B.subtract(tmp).modPow(exp, this.N());
    };
}
SRP6JavascriptClientSession.prototype.toHex = function (n) {
    "use strict";
    return n.toString(16);
};
SRP6JavascriptClientSession.prototype.fromHex = function (s) {
    "use strict";
    return new BigInteger("" + s, 16);
};
SRP6JavascriptClientSession.prototype.BigInteger = function (string, radix) {
    "use strict";
    return new BigInteger("" + string, radix);
};
SRP6JavascriptClientSession.prototype.getState = function () {
    "use strict";
    return this.state;
};
SRP6JavascriptClientSession.prototype.getSessionKey = function (hash) {
    "use strict";
    if (this.S === null) {
        return null;
    }
    this.SS = this.toHex(this.S);
    if (typeof hash !== 'undefined' && hash === false) {
        return this.SS;
    }
    else {
        if (this.K === null) {
            this.K = this.H(this.SS);
        }
        return this.K;
    }
};
SRP6JavascriptClientSession.prototype.getUserID = function () {
    "use strict";
    return this.I;
};
SRP6JavascriptClientSession.prototype.generateRandomSalt = function (opionalServerSalt) {
    "use strict";
    var s = null;
    s = random16byteHex.random();
    var ss = this.H((new Date()) + ':' + opionalServerSalt + ':' + s);
    return ss;
};
SRP6JavascriptClientSession.prototype.generateVerifier = function (salt, identity, password) {
    "use strict";
    var x = this.generateX(salt, identity, password);
    this.v = this.g().modPow(x, this.N());
    return this.toHex(this.v);
};
SRP6JavascriptClientSession.prototype.step1 = function (identity, password) {
    "use strict";
    this.check(identity, "identity");
    this.check(password, "password");
    this.I = identity;
    this.P = password;
    if (this.state !== this.INIT) {
        throw new Error("IllegalStateException not in state INIT");
    }
    this.state = this.STEP_1;
};
SRP6JavascriptClientSession.prototype.computeU = function (Astr, Bstr) {
    "use strict";
    this.check(Astr, "Astr");
    this.check(Bstr, "Bstr");
    var output = this.H(Astr + Bstr);
    var u = new BigInteger("" + output, 16);
    if (BigInteger.ZERO.equals(u)) {
        throw new Error("SRP6Exception bad shared public value 'u' as u==0");
    }
    return u;
};
SRP6JavascriptClientSession.prototype.random16byteHex = function () {
    "use strict";
    var r1 = null;
    r1 = random16byteHex.random();
    return r1;
};
SRP6JavascriptClientSession.prototype.randomA = function (N) {
    "use strict";
    var hexLength = this.toHex(N).length;
    var ZERO = this.BigInteger("0", 10);
    var ONE = this.BigInteger("1", 10);
    var r = ZERO;
    while (ZERO.equals(r)) {
        var rstr = this.random16byteHex() + this.random16byteHex();
        while (rstr.length < hexLength) {
            rstr = rstr + this.random16byteHex();
        }
        var rBi = this.BigInteger(rstr, 16);
        var oneTimeBi = this.BigInteger(this.H(this.I + ":" + this.salt + ':' + (new Date()).getTime()), 16);
        r = (oneTimeBi.add(rBi)).modPow(ONE, N);
    }
    return r;
};
SRP6JavascriptClientSession.prototype.step2 = function (s, BB) {
    "use strict";
    this.check(s, "s");
    this.check(BB, "BB");
    if (this.state !== this.STEP_1) {
        throw new Error("IllegalStateException not in state STEP_1");
    }
    this.B = this.fromHex(BB);
    var ZERO = null;
    ZERO = BigInteger.ZERO;
    if (this.B.mod(this.N()).equals(ZERO)) {
        throw new Error("SRP6Exception bad server public value 'B' as B == 0 (mod N)");
    }
    var x = this.generateX(s, this.I, this.P);
    this.P = null;
    this.a = this.randomA(this.N);
    this.A = this.g().modPow(this.a, this.N());
    this.check(this.A, "A");
    this.u = this.computeU(this.A.toString(16), BB);
    this.S = this.computeSessionKey(this.k, x, this.u, this.a, this.B);
    this.check(this.S, "S");
    var AA = this.toHex(this.A);
    this.M1str = this.H(AA + BB + this.toHex(this.S));
    this.check(this.M1str, "M1str");
    while (this.M1str.substring(0, 1) === '0') {
        this.M1str = this.M1str.substring(1);
    }
    this.state = this.STEP_2;
    return { A: AA, M1: this.M1str };
};
SRP6JavascriptClientSession.prototype.step3 = function (M2) {
    "use strict";
    this.check(M2);
    if (this.state !== this.STEP_2)
        throw new Error("IllegalStateException State violation: Session must be in STEP_2 state");
    var computedM2 = this.H(this.toHex(this.A) + this.M1str + this.toHex(this.S));
    while (computedM2.substring(0, 1) === '0') {
        computedM2 = computedM2.substring(1);
    }
    if ("" + computedM2 !== "" + M2) {
        throw new Error("SRP6Exception Bad server credentials");
    }
    this.state = this.STEP_3;
    return true;
};
if (typeof module !== 'undefined')
    if (typeof module.exports !== 'undefined')
        module.exports = function srpClientFactory(N_base10, g_base10, k_base16) {
            function SRP6JavascriptClientSessionSHA256() { }
            SRP6JavascriptClientSessionSHA256.prototype = new SRP6JavascriptClientSession();
            SRP6JavascriptClientSessionSHA256.prototype.N = function () {
                return new BigInteger(N_base10, 10);
            };
            SRP6JavascriptClientSessionSHA256.prototype.g = function () {
                return new BigInteger(g_base10, 10);
            };
            SRP6JavascriptClientSessionSHA256.prototype.H = function (x) {
                return CryptoJS.SHA256(x).toString().toLowerCase();
            };
            SRP6JavascriptClientSessionSHA256.prototype.k = new BigInteger(k_base16, 16);
            return SRP6JavascriptClientSessionSHA256;
        };
//# sourceMappingURL=browser Kopie.js.map
"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const node_forge_1 = require("node-forge");
const jsbn_1 = require("jsbn");
exports.rfc5054_2048 = {
    N_base10: `217661744586174357731910088918027537819076683742555385111446432246898
86235383840957210909013086056401571399717235807266581649606472148410291413364152
19736447718088739565548373811507267740223510176252190156982074029314952962041933
32662620734710545483687360395197024862265062488610602569718029849535611214426801
57668000761429988222457090413873973970171927093992114751765168063614761119615476
23342209644278311797123637164733387141433589577347466730896705080700550932042479
96784170368679283167612722742303140675482911335824795830614395775593471019617714
06173684378522703483495337037655006751328447510550299250924469288819`,
    g_base10: `2`,
    k_base16: `5b9e8ef059c6b32ea59fc1d322d37f04aa30bae5aa9003b8321e21ddb04e300`
};
var PWSTATE;
(function (PWSTATE) {
    PWSTATE[PWSTATE["STEP1"] = 0] = "STEP1";
    PWSTATE[PWSTATE["STEP2"] = 1] = "STEP2";
    PWSTATE[PWSTATE["STEP3"] = 2] = "STEP3";
})(PWSTATE || (PWSTATE = {}));
class pwBase {
    constructor(N_base10 = exports.rfc5054_2048.N_base10, g_base10 = exports.rfc5054_2048.g_base10, k_base16 = exports.rfc5054_2048.k_base16) {
        this.N_base10 = N_base10;
        this.g_base10 = g_base10;
        this.k_base16 = k_base16;
        this.I = null;
        this.P = null;
        this.salt = null;
        this.BigIntZero = jsbn_1.BigInteger.ZERO;
        this._state = 0;
        this.k = new jsbn_1.BigInteger(this.k_base16, 16);
    }
    get state() {
        return this._state;
    }
    set state(s) {
        this._state = s;
    }
    get UserID() {
        "use strict";
        return this.I;
    }
    N() {
        return new jsbn_1.BigInteger(this.N_base10, 10);
    }
    g() {
        return new jsbn_1.BigInteger(this.g_base10, 10);
    }
    H(x) {
        var md = md.sha256.create();
        md.update(`${x}`);
        return md.digest().toString().toLowerCase();
    }
    trimLeadingZeros(s) {
        while (s.substring(0, 1) === '0') {
            s = s.substring(1);
        }
        return s;
    }
    static randomByteHex(hexLength = 16) {
        let bytesSync = node_forge_1.random.getBytesSync(hexLength);
        const rndHex = node_forge_1.util.binary.hex.encode(bytesSync);
        return rndHex;
    }
    static toHex(n) {
        "use strict";
        return n.toString(16);
    }
    static fromHex(s) {
        "use strict";
        return new jsbn_1.BigInteger(`${s}`, 16);
    }
    static BigInteger(string, radix) {
        "use strict";
        return new jsbn_1.BigInteger("" + string, radix);
    }
}
exports.pwBase = pwBase;
pwBase.PWSTATE = PWSTATE;
pwBase.rfc5054_2048 = exports.rfc5054_2048;
//# sourceMappingURL=pwBase.js.map
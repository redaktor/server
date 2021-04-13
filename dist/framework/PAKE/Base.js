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
//# sourceMappingURL=Base.js.map
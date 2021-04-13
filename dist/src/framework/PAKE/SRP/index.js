"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const node_forge_1 = require("node-forge");
const saslprep_1 = require("../saslprep");
const Base_1 = require("./Base");
const constants_1 = require("./constants");
exports.ServerErrors = {
    IllegalStateException: `IllegalStateException, wrong server state`,
    IllegalActionException: `IllegalActionException, wrong server action`,
    SRP6ExceptionCredentials: `SRP6Exception Bad client credentials`
};
const forge = require("../../../../shared/forge.aes.min.js");
class Server extends Base_1.Base {
    constructor(_SRP = 4096, _HASH = 'SHA512') {
        super(_SRP, _HASH);
        this.b = null;
        this.s = null;
        var key = forge.random.getBytesSync(16);
        var iv = forge.random.getBytesSync(16);
        var cipher = forge.cipher.createCipher('AES-CBC', key);
        cipher.start({ iv: iv });
        cipher.update(forge.util.createBuffer('someBytes'));
        cipher.finish();
        var encrypted = cipher.output;
        console.log(encrypted.toHex());
    }
    static challenge(challengeState) {
        const server = new Server(challengeState.group);
        return server.challenge(challengeState);
    }
    challenge(challengeState) {
        const { I, s, v, group } = challengeState;
        const pub = Object.assign(Object.assign({}, this.step1(I, v, s)), { s, group });
        const __b = Object.assign(Object.assign({}, challengeState), { b: Base_1.Base.toHex(this.b) });
        return class ChallengeRes {
            static get pub() { return pub; }
            static get _private() { return __b; }
            static toJSON() { return JSON.stringify(pub); }
        };
    }
    static login(state) {
        const server = new Server(state.group);
        return server.login(state);
    }
    login(state) {
        this.fromPrivateStoreState(state);
        const { A, M1 } = state;
        const pub = this.step2(A, M1);
        const KEY = { sessionKey: this.getSessionKey() };
        return class LoginRes {
            static get pub() { return pub; }
            static get shared() { return KEY; }
            static toJSON() { return JSON.stringify(pub); }
        };
    }
    static isHex(v) { return !isNaN(Number('0x' + v)); }
    static parseJSON(json, additionalFields = {}) {
        if (!json || typeof json !== 'string' || json.length > 30036) {
            return false;
        }
        const o = JSON.parse(json);
        const { I, action } = o;
        if (!I || !(action in constants_1.ACTIONS)) {
            return false;
        }
        const allowed = { I: 0, _csrf: 0, s: 1, v: 1, A: 1, M1: 1, group: 1 };
        let res = true;
        for (let k in o) {
            if (k === 'action') {
                continue;
            }
            const v = o[k];
            const allow = typeof v === 'string' && allowed.hasOwnProperty(k) &&
                (allowed[k] === 0 || Server.isHex(v));
            if (!allow) {
                const allowByUser = additionalFields.hasOwnProperty(action) &&
                    typeof additionalFields[action][k] === 'function' &&
                    !!additionalFields[action][k](o[k]);
                if (!allowByUser) {
                    console.log('Not allowed', k, o[k]);
                    break;
                }
            }
        }
        return !!res ? o : false;
    }
    fromPrivateStoreState(obj) {
        this.I = obj.I;
        this.v = Base_1.Base.fromHex(obj.v);
        this.s = Base_1.Base.fromHex(obj.s);
        this.b = Base_1.Base.fromHex(obj.b);
        this.B = this.g.modPow(this.b, this.N).add(this.v.multiply(this.k)).mod(this.N);
        this.checkAB('B');
        this.state = Base_1.Base.PWSTATE.STEP1;
    }
    step1(identity, verifier, salt) {
        if (!!this.state) {
            throw new Error(exports.ServerErrors.IllegalStateException);
        }
        this.checks({ identity, verifier, salt }, true);
        this.I = saslprep_1.saslprep(identity);
        this.v = Base_1.Base.fromHex(verifier);
        this.s = Base_1.Base.fromHex(salt);
        this.b = this.randomB();
        this.B = this.g.modPow(this.b, this.N).add(this.v.multiply(this.k)).mod(this.N);
        this.checkAB('B');
        this.state = Base_1.Base.PWSTATE.STEP1;
        return { I: this.I, B: Base_1.Base.toHex(this.B) };
    }
    step2(AHex, M1client) {
        this.checks({ AHex, M1client }, true);
        if (this.state !== Base_1.Base.PWSTATE.STEP1) {
            throw new Error(exports.ServerErrors.IllegalStateException);
        }
        const [A, BHex] = [Base_1.Base.fromHex(AHex), Base_1.Base.toHex(this.B)];
        const u = this.computeU(AHex, BHex);
        this.S = this.v.modPow(u, this.N).multiply(A).modPow(this.b, this.N);
        const SHex = Base_1.Base.toHex(this.S);
        const M1 = Base_1.Base.trimLeadingZeros(this.H(`${AHex}${BHex}${SHex}`));
        this.checks({ M1 }, true);
        console.log(M1client, M1);
        if (M1client !== M1) {
            throw new Error(exports.ServerErrors.SRP6ExceptionCredentials);
        }
        this.M2 = Base_1.Base.trimLeadingZeros(this.H(`${AHex}${M1}${SHex}`));
        return { M2: this.M2 };
    }
    H(...strings) {
        const hash = node_forge_1.md[constants_1.HASH[`${this._HASH}`]].create();
        strings.forEach(s => hash.update(`${s}`));
        return hash.digest().toHex();
    }
    static randomByteHex(hexLength = 16) {
        let bytesSync = node_forge_1.random.getBytesSync(hexLength);
        const rndHex = node_forge_1.util.binary.hex.encode(bytesSync);
        return rndHex;
    }
    randomB() {
        const numBits = Math.max(256, this.N.bitLength() + 8);
        const r = `${Server.randomByteHex(numBits)}${this.s}${(new Date()).getTime()}`;
        const Bi = Server.BigInteger(Server.randomByteHex(numBits), 16);
        const rBi = Server.BigInteger(this.H(r), 16);
        return (rBi.add(Bi)).mod(this.N);
    }
}
exports.Server = Server;
Server.ACTIONS = constants_1.ACTIONS;
//# sourceMappingURL=index.js.map
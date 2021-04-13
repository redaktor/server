"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const node_forge_1 = require("node-forge");
const index_1 = require("../../JSON/webtoken/index");
const uuid_1 = require("../../uuid");
const index_2 = require("../saslprep/index");
const Base_1 = require("./Base");
const constants_1 = require("./constants");
exports.ServerErrors = {
    IllegalStateException: `IllegalStateException, wrong server state`,
    IllegalActionException: `IllegalActionException, wrong server action`,
    SRP6ExceptionCredentials: `SRP6Exception Bad client credentials`,
    SRP6ExceptionToken: `SRP6Exception Bad token`,
    SRP6TimedOut: `SRP6Exception Session timed out`,
};
class Server extends Base_1.Base {
    constructor(group = 4096, hash = 'SHA512') {
        super(group, hash);
        this.randomFn = Server.randomByteHex;
        this.randomBytes = Server.randomBytes;
        this.s = null;
        this.b = null;
        this.i = null;
    }
    static challenge(state, serverLoginSecret) {
        const server = new Server(state.group);
        return server.challenge(state, serverLoginSecret);
    }
    challenge(state, serverLoginSecret) {
        const shared = this.step1(state, serverLoginSecret);
        const __b = Object.assign(Object.assign({}, state), { b: Base_1.Base.toHex(this.b) });
        return class ChallengeRes {
            static get shared() { return shared; }
            static get secret() { return __b; }
            static toJSON() { return JSON.stringify(shared); }
        };
    }
    static login(state, serverLoginSecret) {
        const server = new Server(state.group);
        return server.login(state, serverLoginSecret);
    }
    login(state, serverLoginSecret) {
        if (state.action === Base_1.Base.ACTION.R_SRP_AUTH) {
            return this.challenge(state, serverLoginSecret);
        }
        else if (state.action === Base_1.Base.ACTION.R_SRP_VERIFY) {
            return this.verify(state, serverLoginSecret);
        }
        const shared = this.step2(state);
        const __k = Object.assign(Object.assign({}, state), { key: this.getSessionSecret(state.s), action: Base_1.Base.ACTION.R_SRP_EVIDENCE });
        return class LoginRes {
            static get shared() { return shared; }
            static get secret() { return __k; }
            static toJSON() { return JSON.stringify(shared); }
        };
    }
    static verify(state, serverLoginSecret) {
        const server = new Server(state.group);
        return server.verify(state, serverLoginSecret);
    }
    verify(state, serverLoginSecret) {
        const shared = this.step3(state, serverLoginSecret);
        const __v = Object.assign(Object.assign({}, state), { i: this.i });
        return class VerifyRes {
            static get shared() { return shared; }
            static get secret() { return __v; }
            static toJSON() { return JSON.stringify(shared); }
        };
    }
    static verifyToken(me, token) {
        const { I, i } = me;
        if (token.iss !== 'redaktor' || token.nonce !== I) {
            throw new Error(exports.ServerErrors.SRP6ExceptionToken);
        }
        else if (Date.now() > token.exp) {
            throw new Error(exports.ServerErrors.SRP6TimedOut);
        }
        else if (token.aud !== i) {
            throw new Error(exports.ServerErrors.SRP6ExceptionToken);
        }
        return true;
    }
    static authorize(me, token, serverLoginSecret) {
        try {
            const { identity, key } = me;
            const server = new Server();
            const t = server.decrypt(token, key);
            const idToken = index_1.default.decode(t, serverLoginSecret);
            Server.verifyToken(me, idToken);
            ['s', 'v', 'b', 'i'].forEach((k) => { delete me[k]; });
            idToken.identity = identity;
            const shared = { t: server.encrypt(index_1.default.encode(idToken, serverLoginSecret), key) };
            return class TokenRes {
                static get shared() { return shared; }
                static get secret() { return me; }
                static toJSON() { return JSON.stringify(shared); }
            };
        }
        catch (e) {
            console.log(e);
            throw new Error(exports.ServerErrors.SRP6ExceptionToken);
        }
    }
    static isAuthorizedFn(serverLoginSecret) {
        const server = new Server();
        return (o) => {
            const { me, token } = o;
            const idToken = index_1.default.decode(server.decrypt(token, me.key), serverLoginSecret);
            try {
                return Server.verifyToken(me, idToken);
            }
            catch (e) {
                return false;
            }
        };
    }
    step1(state, serverLoginSecret = '') {
        if (!!this.state) {
            throw new Error(exports.ServerErrors.IllegalStateException);
        }
        const { I, s, v, group } = state;
        this.checks({ I, v, s }, true) && this.put({ I, v: Base_1.Base.fromHex(v), s: Base_1.Base.fromHex(s) });
        this.b = this.randomB();
        this.B = this.g.modPow(this.b, this.N).add(this.v.multiply(this.k)).mod(this.N);
        this.checkAB('B');
        this.state = Base_1.Base.ACTION.R_SRP_EVIDENCE;
        const loginSecret = index_2.saslprep(serverLoginSecret);
        const iat = Date.now();
        console.log(iat);
        const t = index_1.default.encode({
            iss: `redaktor`,
            iat,
            exp: (iat + (5 * 60 * 1000)),
            nonce: this.I
        }, loginSecret);
        return { I: this.I, B: Base_1.Base.toHex(this.B), t, action: this.state, s, group };
    }
    step2(state) {
        this.fromPrivateStoreState(state);
        const { I, t } = state;
        if (this.state !== Base_1.Base.ACTION.R_SRP_AUTH) {
            throw new Error(exports.ServerErrors.IllegalStateException);
        }
        const { A: AHex, M1: M1client } = state;
        this.checks({ AHex, M1client }, true);
        const [A, BHex] = [Base_1.Base.fromHex(AHex), Base_1.Base.toHex(this.B)];
        this.A = A;
        this.checkAB('A');
        const u = this.computeU(AHex, BHex);
        this.S = this.v.modPow(u, this.N).multiply(A).modPow(this.b, this.N);
        const SHex = Base_1.Base.toHex(this.S);
        const M1 = Base_1.Base.trimLeadingZeros(this.H(`${AHex}${BHex}${SHex}`));
        this.checks({ M1 }, true);
        if (M1client !== M1) {
            throw new Error(exports.ServerErrors.SRP6ExceptionCredentials);
        }
        this.M2 = Base_1.Base.trimLeadingZeros(this.H(`${AHex}${M1}${SHex}`));
        const action = Base_1.Base.ACTION.R_SRP_VERIFY;
        return { I, t, M2: this.M2, action };
    }
    step3(state, serverLoginSecret = '') {
        this.fromPrivateStoreState(state);
        let { t, key } = state;
        t = this.decrypt(t, key);
        const loginToken = index_1.default.decode(t, serverLoginSecret);
        console.log('VERIFIED decoded Token', loginToken);
        this.i = Server.randomByteHex(32);
        loginToken.aud = this.i;
        t = index_1.default.encode(loginToken, serverLoginSecret);
        const action = Base_1.Base.ACTION.R_ID_TOKEN;
        console.log('VERIFIED decoded Token OK !');
        return { action, id: this.encrypt(`id:?u=${'/token'}&I=${this.I}&t=${t}`, key) };
    }
    fromPrivateStoreState(obj) {
        this.I = obj.I;
        this.v = Base_1.Base.fromHex(obj.v);
        this.s = Base_1.Base.fromHex(obj.s);
        this.b = Base_1.Base.fromHex(obj.b);
        this.B = this.g.modPow(this.b, this.N).add(this.v.multiply(this.k)).mod(this.N);
        this.checkAB('B');
        this.state = Base_1.Base.ACTION.R_SRP_AUTH;
    }
    H(...strings) {
        const hash = node_forge_1.md[constants_1.HASH[`${this.hash}`]].create();
        strings.forEach(s => hash.update(`${s}`));
        return hash.digest().toHex();
    }
    static hash(...strings) {
        const hash = node_forge_1.md.sha512.create();
        strings.forEach(s => hash.update(`${s}`));
        return hash.digest().toHex();
    }
    static hashedUUID(...strings) {
        return uuid_1.default(Server.hash(...strings));
    }
    static randomBytes(byteLength = 16) {
        return node_forge_1.random.getBytesSync(byteLength);
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
    static isHex(v) { return !isNaN(Number('0x' + v)); }
    static parseJSON(json, additionalFields = {}) {
        if (!json || typeof json !== 'string' || json.length > 30036) {
            return false;
        }
        const o = JSON.parse(json);
        const { I, action } = o;
        if (!I || !(action in Base_1.Base.ACTION)) {
            return false;
        }
        const allowed = { I: 0, _csrf: 0, identity: 1, s: 1, v: 1, A: 1, M1: 1, group: 1, t: 0 };
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
}
exports.Server = Server;
//# sourceMappingURL=index.js.map
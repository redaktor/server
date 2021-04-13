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
    static hash(...strings) {
        const hash = new SHA512_1.SHA512();
        strings.forEach(s => hash.update(`${s}`));
        return SHA512_1.codecHex.fromBits(hash.finalize());
    }
    static uuid(v5name) {
        if (typeof v5name === 'string') {
            let h = crypto.hash(v5name, 'sha1', 'buffer');
            h[8] = h[8] & 0x3f | 0xa0;
            h[6] = h[6] & 0x0f | 0x50;
            return (h.toString('hex', 0, 16).match(/.{1,8}/g) || []).join('-');
        }
        return Base.uuid4();
    }
    static uuid4() {
        return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function (c) {
            const r = (Math.random() * 16) | 0, v = c === 'x' ? r : (r & 0x3) | 0x8;
            return v.toString(16);
        });
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
    makeV(I, P) {
        const x = this.generateX(I, P);
        this.v = this.g.modPow(x, this.N);
        return Base.toHex(this.v);
    }
    generateX(I, P) {
        this.checks({ I, P }, true);
        const _h = Base.trimLeadingZeros(this.H(`${I}:${P}`));
        const hash = Base.trimLeadingZeros(this.H(`${this.s}${_h}`.toUpperCase()));
        return Base.fromHex(hash).mod(this.N);
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
//# sourceMappingURL=Base.js.map
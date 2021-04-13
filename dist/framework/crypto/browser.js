"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.isNodeJS = ((typeof process === 'object' && process.versions && process.versions.node && global.Buffer) &&
    process.versions.node) || false;
const crypto = require('crypto-browserify');
const HMAC_ALGO = {
    md5: false,
    ripemd160: false,
    sha1: false,
    sha3: false,
    sha224: false,
    sha256: 'HS256',
    sha384: 'HS384',
    sha512: 'HS512'
};
const HASH_ALGO = {
    md5: 'MD5',
    sha1: 'SHA1',
    sha2: 'SHA2',
    sha224: 'SHA224',
    sha256: 'SHA256',
    sha384: 'SHA384',
    sha512: 'SHA512'
};
const env = exports.isNodeJS ? 'node.js' : 'client';
function hmacAlgorithm(algoStr, isJWT = false) {
    const algo = algoStr.toLowerCase();
    const allow = (isJWT) ?
        (typeof algo === 'string' && typeof HMAC_ALGO[algo] === 'string') :
        (typeof algo === 'string' && HMAC_ALGO.hasOwnProperty(algo));
    if (!allow) {
        const suffix = (isJWT) ? 'for JWT.' : '.';
        return { method: 'sha256', alg: HMAC_ALGO['sha256'] };
    }
    return { method: algo, alg: HMAC_ALGO[algo] };
}
exports.hmacAlgorithm = hmacAlgorithm;
class Crypto {
    static randomBytes(size = 32) {
        return crypto.randomBytes(size);
    }
    static hash(text, algo = 'sha256', out = 'hex') {
        if (out === 'buffer') {
            out = void 0;
        }
        if (crypto.getHashes().indexOf(algo.toLowerCase()) === -1) {
            algo = 'sha256';
        }
        return crypto.createHash(algo.toLowerCase()).update(text).digest(out);
    }
    static hmac(text, key, out = 'base64', algo = 'sha256') {
        if (out === 'buffer') {
            out = void 0;
        }
        algo = hmacAlgorithm(algo).method;
        return crypto.createHmac(algo, key).update(text).digest(out);
    }
    static sign(text, key, algo = 'RSA-SHA256', out = 'base64') {
        return crypto.createSign(algo).update(text).sign(key, out);
    }
    static verify(text, key, algo = 'sha256', signature = '', out = 'base64') {
        return crypto.createVerify(algo).update(text).verify(key, signature, out);
    }
}
;
exports.default = Crypto;
//# sourceMappingURL=browser.js.map
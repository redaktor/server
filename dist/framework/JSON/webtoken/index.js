"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const has_1 = require("@dojo/framework/core/has");
const log_1 = require("../../String/tag/log");
const base64_1 = require("../../String/base64");
const crypto_1 = require("../../crypto");
const JWT = 'JSON webtoken: ';
const algorithmMap = {
    HS256: 'sha256',
    HS384: 'sha384',
    HS512: 'sha512',
    RS256: 'RSA-SHA256'
};
function getAlgos(method) {
    const uMethod = method.toUpperCase();
    if (algorithmMap.hasOwnProperty(uMethod)) {
        return { method: algorithmMap[uMethod], alg: uMethod };
    }
    else {
        return crypto_1.hmacAlgorithm(method, true);
    }
}
class jwt {
    static encode(payload, key, method = 'HS256', options = {}) {
        if (typeof key != 'string') {
            if (jwt.debug) {
                log_1.log `${JWT}Encoding a JWT requires a "key" string.`;
            }
            throw new Error(`${JWT}Encoding a JWT requires a "key" string.`);
        }
        const m = getAlgos(method);
        let header = { typ: 'JWT', alg: m.alg };
        if (options.header) {
            header = Object.assign(Object.assign({}, header), options.header);
        }
        var segments = [];
        segments.push(base64_1.urlEncode(JSON.stringify(header)));
        segments.push(base64_1.urlEncode(JSON.stringify(payload)));
        segments.push(this.sign(segments.join('.'), key, m.method));
        return segments.join('.');
    }
    ;
    static decode(token, key, method = 'HS256', doVerify = true) {
        if (!token) {
            if (jwt.debug) {
                log_1.log `${JWT}No token supplied.`;
            }
            throw new Error(`${JWT}No token supplied.`);
        }
        const m = getAlgos(method);
        const segments = token.split('.');
        if (segments.length !== 3) {
            if (jwt.debug) {
                log_1.log `${JWT}Not enough or too many segments.`;
            }
            throw new Error(`${JWT}Not enough or too many segments.`);
        }
        const s = {
            header: segments[0],
            payload: segments[1],
            signature: segments[2]
        };
        const payload = JSON.parse(base64_1.urlDecode(s.payload));
        if (doVerify) {
            if (!jwt.verify(s, key, m.method)) {
                if (jwt.debug) {
                    log_1.log `${JWT}Signature verification failed.`;
                }
                throw new Error(`${JWT}Signature verification failed.`);
            }
            if (jwt.validTime(payload.nbf) && Date.now() < payload.nbf) {
                if (jwt.debug) {
                    log_1.log `${JWT}Token not yet active.`;
                }
                throw new Error(`${JWT}Token not yet active.`);
            }
            if (jwt.validTime(payload.exp) && Date.now() > payload.exp) {
                if (jwt.debug) {
                    log_1.log `${JWT}Token expired.`;
                }
                throw new Error(`${JWT}Token expired.`);
            }
        }
        return payload;
    }
    ;
    static sign(text, key, method = 'HS256') {
        const signMethod = (method === 'RSA-SHA256') ? method : null;
        let base64str = '';
        if (signMethod) {
            base64str = crypto_1.default.sign(text, key, signMethod);
        }
        else {
            base64str = crypto_1.default.hmac(text, key, 'base64', method);
        }
        return base64_1.escape(base64str);
    }
    static verify(token, key, method = 'HS256') {
        const { header, payload, signature } = token;
        const vText = [header, payload].join('.');
        const { alg } = JSON.parse(base64_1.urlDecode(header));
        if (!alg || !algorithmMap.hasOwnProperty(alg)) {
            return false;
        }
        const signMethod = (method === 'RSA-SHA256') ? method : null;
        if (signMethod) {
            if (!has_1.default('host-node')) {
                log_1.warning('Signature RS verification only available in node.js');
                return false;
            }
            return crypto_1.default.verify(vText, key, method, base64_1.unescape(signature));
        }
        else {
            return (signature === this.sign(vText, key, method));
        }
    }
    static header(token) {
        if (typeof token !== 'string') {
            return void 0;
        }
        const o = JSON.parse(base64_1.urlDecode(token.split('.')[0]));
        if (!o || typeof o !== 'object' || !o.alg || !o.typ) {
            return void 0;
        }
        return o;
    }
    static payload(token) {
        if (typeof token !== 'string') {
            return void 0;
        }
        return token.split('.')[1];
    }
    static alg(token) {
        const header = jwt.header(token);
        if (!header) {
            return void 0;
        }
        return header.alg;
    }
    static algLength(token) {
        const alg = jwt.alg(token);
        if (!alg || !algorithmMap[alg]) {
            return void 0;
        }
        return parseInt(alg.replace(/^(RS)|(HS)/, ''), 10);
    }
    static validTime(timeNr) {
        return (timeNr && !isNaN(timeNr) && typeof timeNr === 'number');
    }
}
jwt.version = '0.5.0';
jwt.debug = false;
exports.default = jwt;
//# sourceMappingURL=index.js.map
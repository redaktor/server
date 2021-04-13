"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const has_1 = require("@dojo/framework/core/has");
function getLengths(b64) {
    const len = b64.length;
    if (len % 4 > 0) {
        throw new TypeError("Invalid string. Length must be a multiple of 4");
    }
    let validLen = b64.indexOf("=");
    if (validLen === -1) {
        validLen = len;
    }
    const placeHoldersLen = validLen === len ? 0 : 4 - (validLen % 4);
    return [validLen, placeHoldersLen];
}
function init(lookup, revLookup) {
    function _byteLength(validLen, placeHoldersLen) {
        return ((validLen + placeHoldersLen) * 3) / 4 - placeHoldersLen;
    }
    function tripletToBase64(num) {
        return (lookup[(num >> 18) & 0x3f] +
            lookup[(num >> 12) & 0x3f] +
            lookup[(num >> 6) & 0x3f] +
            lookup[num & 0x3f]);
    }
    function encodeChunk(buf, start, end) {
        const out = new Array((end - start) / 3);
        for (let i = start, curTriplet = 0; i < end; i += 3) {
            out[curTriplet++] = tripletToBase64((buf[i] << 16) + (buf[i + 1] << 8) + buf[i + 2]);
        }
        return out.join("");
    }
    return {
        byteLength(b64) {
            return _byteLength.apply(null, getLengths(b64));
        },
        toUint8Array(b64) {
            const [validLen, placeHoldersLen] = getLengths(b64);
            const buf = new Uint8Array(_byteLength(validLen, placeHoldersLen));
            const len = placeHoldersLen ? validLen - 4 : validLen;
            let tmp;
            let curByte = 0;
            let i;
            for (i = 0; i < len; i += 4) {
                tmp =
                    (revLookup[b64.charCodeAt(i)] << 18) |
                        (revLookup[b64.charCodeAt(i + 1)] << 12) |
                        (revLookup[b64.charCodeAt(i + 2)] << 6) |
                        revLookup[b64.charCodeAt(i + 3)];
                buf[curByte++] = (tmp >> 16) & 0xff;
                buf[curByte++] = (tmp >> 8) & 0xff;
                buf[curByte++] = tmp & 0xff;
            }
            if (placeHoldersLen === 2) {
                tmp =
                    (revLookup[b64.charCodeAt(i)] << 2) |
                        (revLookup[b64.charCodeAt(i + 1)] >> 4);
                buf[curByte++] = tmp & 0xff;
            }
            else if (placeHoldersLen === 1) {
                tmp =
                    (revLookup[b64.charCodeAt(i)] << 10) |
                        (revLookup[b64.charCodeAt(i + 1)] << 4) |
                        (revLookup[b64.charCodeAt(i + 2)] >> 2);
                buf[curByte++] = (tmp >> 8) & 0xff;
                buf[curByte++] = tmp & 0xff;
            }
            return buf;
        },
        fromUint8Array(buf) {
            const maxChunkLength = 16383;
            const len = buf.length;
            const extraBytes = len % 3;
            const len2 = len - extraBytes;
            const parts = new Array(Math.ceil(len2 / maxChunkLength) + (extraBytes ? 1 : 0));
            let curChunk = 0;
            let chunkEnd;
            for (let i = 0; i < len2; i += maxChunkLength) {
                chunkEnd = i + maxChunkLength;
                parts[curChunk++] = encodeChunk(buf, i, chunkEnd > len2 ? len2 : chunkEnd);
            }
            let tmp;
            if (extraBytes === 1) {
                tmp = buf[len2];
                parts[curChunk] = lookup[tmp >> 2] + lookup[(tmp << 4) & 0x3f] + "==";
            }
            else if (extraBytes === 2) {
                tmp = (buf[len2] << 8) | (buf[len2 + 1] & 0xff);
                parts[curChunk] =
                    lookup[tmp >> 10] +
                        lookup[(tmp >> 4) & 0x3f] +
                        lookup[(tmp << 2) & 0x3f] +
                        "=";
            }
            return parts.join("");
        }
    };
}
function _repeat(str, num) { return new Array(num + 1).join(str); }
;
const lookup = [];
const revLookup = [];
const code = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789+/";
for (let i = 0, l = code.length; i < l; ++i) {
    lookup[i] = code[i];
    revLookup[code.charCodeAt(i)] = i;
}
revLookup["-".charCodeAt(0)] = 62;
revLookup["_".charCodeAt(0)] = 63;
const mod = init(lookup, revLookup);
exports.byteLength = mod.byteLength;
exports.toUint8Array = mod.toUint8Array;
exports.fromUint8Array = mod.fromUint8Array;
function escape(str) {
    return str.replace(/\+/g, '-').replace(/\//g, '_').replace(/=/g, '');
}
exports.escape = escape;
function unescape(str) {
    str = str.toString();
    var mod = str.length % 4;
    if (mod !== 0) {
        str += _repeat('=', 4 - mod);
    }
    return str.replace(/\-/g, '+').replace(/_/g, '/');
}
exports.unescape = unescape;
function encode(str) {
    if (has_1.default('host-node')) {
        return Buffer.from(str, 'utf8').toString('base64');
    }
    else {
        return btoa(encodeURIComponent(str).replace(/%([0-9A-F]{2})/g, function (m, p1) {
            return String.fromCharCode(parseInt(('0x' + p1), 16));
        }));
    }
}
exports.encode = encode;
function decode(b64String) {
    b64String = b64String.toString();
    if (has_1.default('host-node')) {
        return Buffer.from(b64String, 'base64').toString('utf8');
    }
    else {
        return decodeURIComponent(b64String.split('').map(function (c) {
            return '%' + ('00' + c.charCodeAt(0).toString(16)).slice(-2);
        }).join(''));
    }
}
exports.decode = decode;
function urlEncode(str) {
    return escape(encode(str));
}
exports.urlEncode = urlEncode;
function urlDecode(b64String) {
    b64String = b64String.toString();
    return decode(unescape(b64String));
}
exports.urlDecode = urlDecode;
//# sourceMappingURL=base64.js.map
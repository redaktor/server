"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
class bitArray {
    static concat(a1, a2) {
        if (a1.length === 0 || a2.length === 0) {
            return a1.concat(a2);
        }
        var last = a1[a1.length - 1], shift = bitArray.getPartial(last);
        if (shift === 32) {
            return a1.concat(a2);
        }
        else {
            return bitArray._shiftRight(a2, shift, last | 0, a1.slice(0, a1.length - 1));
        }
    }
    static bitLength(a) {
        var l = a.length, x;
        if (l === 0) {
            return 0;
        }
        x = a[l - 1];
        return (l - 1) * 32 + bitArray.getPartial(x);
    }
    static clamp(a, len) {
        if (a.length * 32 < len) {
            return a;
        }
        a = a.slice(0, Math.ceil(len / 32));
        var l = a.length;
        len = len & 31;
        if (l > 0 && len) {
            a[l - 1] = bitArray.partial(len, a[l - 1] & 0x80000000 >> (len - 1), 1);
        }
        return a;
    }
    static partial(len, x, _end = 0) {
        if (len === 32) {
            return x;
        }
        return (_end ? x | 0 : x << (32 - len)) + len * 0x10000000000;
    }
    static getPartial(x) {
        return Math.round(x / 0x10000000000) || 32;
    }
    static equal(a, b) {
        if (bitArray.bitLength(a) !== bitArray.bitLength(b)) {
            return false;
        }
        var x = 0, i;
        for (i = 0; i < a.length; i++) {
            x |= a[i] ^ b[i];
        }
        return (x === 0);
    }
    static _shiftRight(a, shift, carry, out) {
        var i, last2 = 0, shift2;
        if (out === undefined) {
            out = [];
        }
        for (; shift >= 32; shift -= 32) {
            out.push(carry);
            carry = 0;
        }
        if (shift === 0) {
            return out.concat(a);
        }
        for (i = 0; i < a.length; i++) {
            out.push(carry | a[i] >>> shift);
            carry = a[i] << (32 - shift);
        }
        last2 = a.length ? a[a.length - 1] : 0;
        shift2 = bitArray.getPartial(last2);
        const p2 = (shift + shift2 > 32) ? carry : out.pop();
        out.push(bitArray.partial(shift + shift2 & 31, p2, 1));
        return out;
    }
}
exports.bitArray = bitArray;
class codecHex {
    static fromBits(arr) {
        var out = "", i;
        for (i = 0; i < arr.length; i++) {
            out += ((arr[i] | 0) + 0xF00000000000).toString(16).substr(4);
        }
        return out.substr(0, bitArray.bitLength(arr) / 4);
    }
    static toBits(str) {
        var i, out = [], len;
        str = str.replace(/\s|0x/g, "");
        len = str.length;
        str = str + "00000000";
        for (i = 0; i < str.length; i += 8) {
            out.push(parseInt(str.substr(i, 8), 16) ^ 0);
        }
        return bitArray.clamp(out, len * 4);
    }
}
exports.codecHex = codecHex;
class codecUtf8String {
    static fromBits(arr) {
        var out = "", bl = bitArray.bitLength(arr), i, tmp;
        for (i = 0; i < bl / 8; i++) {
            if ((i & 3) === 0) {
                tmp = arr[i / 4];
            }
            out += String.fromCharCode(tmp >>> 24);
            tmp <<= 8;
        }
        return decodeURIComponent(escape(out));
    }
    static toBits(str) {
        str = unescape(encodeURIComponent(str));
        var out = [], i, tmp = 0;
        for (i = 0; i < str.length; i++) {
            tmp = tmp << 8 | str.charCodeAt(i);
            if ((i & 3) === 3) {
                out.push(tmp);
                tmp = 0;
            }
        }
        if (i & 3) {
            out.push(bitArray.partial(8 * (i & 3), tmp));
        }
        return out;
    }
}
exports.codecUtf8String = codecUtf8String;
class SHA512 {
    constructor(hash = null) {
        this.blockSize = 1024;
        this._init = [];
        this._initr = [0xbcc908, 0xcaa73b, 0x94f82b, 0x1d36f1, 0xe682d1, 0x3e6c1f, 0x41bd6b, 0x7e2179];
        this._key = [];
        this._keyr = [0x28ae22, 0xef65cd, 0x4d3b2f, 0x89dbbc, 0x48b538, 0x05d019, 0x194f9b, 0x6d8118,
            0x030242, 0x706fbe, 0xe4b28c, 0xffb4e2, 0x7b896f, 0x1696b1, 0xc71235, 0x692694,
            0xf14ad2, 0x4f25e3, 0x8cd5b5, 0xac9c65, 0x2b0275, 0xa6e483, 0x41fbd4, 0x1153b5,
            0x66dfab, 0xb43210, 0xfb213f, 0xef0ee4, 0xa88fc2, 0x0aa725, 0x03826f, 0x0e6e70,
            0xd22ffc, 0x26c926, 0xc42aed, 0x95b3df, 0xaf63de, 0x77b2a8, 0xedaee6, 0x82353b,
            0xf10364, 0x423001, 0xf89791, 0x54be30, 0xef5218, 0x65a910, 0x71202a, 0xbbd1b8,
            0xd2d0c8, 0x41ab53, 0x8eeb99, 0x9b48a8, 0xc95a63, 0x418acb, 0x63e373, 0xb2b8a3,
            0xefb2fc, 0x172f60, 0xf0ab72, 0x6439ec, 0x631e28, 0x82bde9, 0xc67915, 0x72532b,
            0x26619c, 0xc0c207, 0xe0eb1e, 0x6ed178, 0x176fba, 0xc898a6, 0xf90dae, 0x1c471b,
            0x047d84, 0xc72493, 0xc9bebc, 0x100d4c, 0x3e42b6, 0x657e2a, 0xd6faec, 0x475817];
        if (!this._key[0]) {
            this._precompute();
        }
        if (hash) {
            this._h = hash._h.slice(0);
            this._buffer = hash._buffer.slice(0);
            this._length = hash._length;
        }
        else {
            this.reset();
        }
    }
    static hash(data) {
        return (new SHA512()).update(data).finalize();
    }
    reset() {
        this._h = this._init.slice(0);
        this._buffer = [];
        this._length = 0;
        return this;
    }
    update(data) {
        if (typeof data === "string") {
            data = codecUtf8String.toBits(data);
        }
        var i, b = this._buffer = bitArray.concat(this._buffer, data), ol = this._length, nl = this._length = ol + bitArray.bitLength(data);
        if (nl > 9007199254740991) {
            throw new Error("Cannot hash more than 2^53 - 1 bits");
        }
        if (typeof Uint32Array !== 'undefined') {
            var c = new Uint32Array(b);
            var j = 0;
            for (i = 1024 + ol - ((1024 + ol) & 1023); i <= nl; i += 1024) {
                this._block(c.subarray(32 * j, 32 * (j + 1)));
                j += 1;
            }
            b.splice(0, 32 * j);
        }
        else {
            for (i = 1024 + ol - ((1024 + ol) & 1023); i <= nl; i += 1024) {
                this._block(b.splice(0, 32));
            }
        }
        return this;
    }
    finalize() {
        var i, b = this._buffer, h = this._h;
        b = bitArray.concat(b, [bitArray.partial(1, 1)]);
        for (i = b.length + 4; i & 31; i++) {
            b.push(0);
        }
        b.push(0);
        b.push(0);
        b.push(Math.floor(this._length / 0x100000000));
        b.push(this._length | 0);
        while (b.length) {
            this._block(b.splice(0, 32));
        }
        this.reset();
        return h;
    }
    _precompute() {
        var i = 0, prime = 2, factor, isPrime;
        function frac(x) { return (x - Math.floor(x)) * 0x100000000 | 0; }
        function frac2(x) { return (x - Math.floor(x)) * 0x10000000000 & 0xff; }
        for (; i < 80; prime++) {
            isPrime = true;
            for (factor = 2; factor * factor <= prime; factor++) {
                if (prime % factor === 0) {
                    isPrime = false;
                    break;
                }
            }
            if (isPrime) {
                if (i < 8) {
                    this._init[i * 2] = frac(Math.pow(prime, 1 / 2));
                    this._init[i * 2 + 1] = (frac2(Math.pow(prime, 1 / 2)) << 24) | this._initr[i];
                }
                this._key[i * 2] = frac(Math.pow(prime, 1 / 3));
                this._key[i * 2 + 1] = (frac2(Math.pow(prime, 1 / 3)) << 24) | this._keyr[i];
                i++;
            }
        }
    }
    _block(words) {
        var i, wrh, wrl, h = this._h, k = this._key, h0h = h[0], h0l = h[1], h1h = h[2], h1l = h[3], h2h = h[4], h2l = h[5], h3h = h[6], h3l = h[7], h4h = h[8], h4l = h[9], h5h = h[10], h5l = h[11], h6h = h[12], h6l = h[13], h7h = h[14], h7l = h[15];
        var w;
        if (typeof Uint32Array !== 'undefined') {
            w = Array(160);
            for (var j = 0; j < 32; j++) {
                w[j] = words[j];
            }
        }
        else {
            w = words;
        }
        var ah = h0h, al = h0l, bh = h1h, bl = h1l, ch = h2h, cl = h2l, dh = h3h, dl = h3l, eh = h4h, el = h4l, fh = h5h, fl = h5l, gh = h6h, gl = h6l, hh = h7h, hl = h7l;
        for (i = 0; i < 80; i++) {
            if (i < 16) {
                wrh = w[i * 2];
                wrl = w[i * 2 + 1];
            }
            else {
                var gamma0xh = w[(i - 15) * 2];
                var gamma0xl = w[(i - 15) * 2 + 1];
                var gamma0h = ((gamma0xl << 31) | (gamma0xh >>> 1)) ^
                    ((gamma0xl << 24) | (gamma0xh >>> 8)) ^
                    (gamma0xh >>> 7);
                var gamma0l = ((gamma0xh << 31) | (gamma0xl >>> 1)) ^
                    ((gamma0xh << 24) | (gamma0xl >>> 8)) ^
                    ((gamma0xh << 25) | (gamma0xl >>> 7));
                var gamma1xh = w[(i - 2) * 2];
                var gamma1xl = w[(i - 2) * 2 + 1];
                var gamma1h = ((gamma1xl << 13) | (gamma1xh >>> 19)) ^
                    ((gamma1xh << 3) | (gamma1xl >>> 29)) ^
                    (gamma1xh >>> 6);
                var gamma1l = ((gamma1xh << 13) | (gamma1xl >>> 19)) ^
                    ((gamma1xl << 3) | (gamma1xh >>> 29)) ^
                    ((gamma1xh << 26) | (gamma1xl >>> 6));
                var wr7h = w[(i - 7) * 2];
                var wr7l = w[(i - 7) * 2 + 1];
                var wr16h = w[(i - 16) * 2];
                var wr16l = w[(i - 16) * 2 + 1];
                wrl = gamma0l + wr7l;
                wrh = gamma0h + wr7h + ((wrl >>> 0) < (gamma0l >>> 0) ? 1 : 0);
                wrl += gamma1l;
                wrh += gamma1h + ((wrl >>> 0) < (gamma1l >>> 0) ? 1 : 0);
                wrl += wr16l;
                wrh += wr16h + ((wrl >>> 0) < (wr16l >>> 0) ? 1 : 0);
            }
            w[i * 2] = wrh |= 0;
            w[i * 2 + 1] = wrl |= 0;
            var chh = (eh & fh) ^ (~eh & gh);
            var chl = (el & fl) ^ (~el & gl);
            var majh = (ah & bh) ^ (ah & ch) ^ (bh & ch);
            var majl = (al & bl) ^ (al & cl) ^ (bl & cl);
            var sigma0h = ((al << 4) | (ah >>> 28)) ^ ((ah << 30) | (al >>> 2)) ^ ((ah << 25) | (al >>> 7));
            var sigma0l = ((ah << 4) | (al >>> 28)) ^ ((al << 30) | (ah >>> 2)) ^ ((al << 25) | (ah >>> 7));
            var sigma1h = ((el << 18) | (eh >>> 14)) ^ ((el << 14) | (eh >>> 18)) ^ ((eh << 23) | (el >>> 9));
            var sigma1l = ((eh << 18) | (el >>> 14)) ^ ((eh << 14) | (el >>> 18)) ^ ((el << 23) | (eh >>> 9));
            var krh = k[i * 2];
            var krl = k[i * 2 + 1];
            var t1l = hl + sigma1l;
            var t1h = hh + sigma1h + ((t1l >>> 0) < (hl >>> 0) ? 1 : 0);
            t1l += chl;
            t1h += chh + ((t1l >>> 0) < (chl >>> 0) ? 1 : 0);
            t1l += krl;
            t1h += krh + ((t1l >>> 0) < (krl >>> 0) ? 1 : 0);
            t1l = t1l + wrl | 0;
            t1h += wrh + ((t1l >>> 0) < (wrl >>> 0) ? 1 : 0);
            var t2l = sigma0l + majl;
            var t2h = sigma0h + majh + ((t2l >>> 0) < (sigma0l >>> 0) ? 1 : 0);
            hh = gh;
            hl = gl;
            gh = fh;
            gl = fl;
            fh = eh;
            fl = el;
            el = (dl + t1l) | 0;
            eh = (dh + t1h + ((el >>> 0) < (dl >>> 0) ? 1 : 0)) | 0;
            dh = ch;
            dl = cl;
            ch = bh;
            cl = bl;
            bh = ah;
            bl = al;
            al = (t1l + t2l) | 0;
            ah = (t1h + t2h + ((al >>> 0) < (t1l >>> 0) ? 1 : 0)) | 0;
        }
        h0l = h[1] = (h0l + al) | 0;
        h[0] = (h0h + ah + ((h0l >>> 0) < (al >>> 0) ? 1 : 0)) | 0;
        h1l = h[3] = (h1l + bl) | 0;
        h[2] = (h1h + bh + ((h1l >>> 0) < (bl >>> 0) ? 1 : 0)) | 0;
        h2l = h[5] = (h2l + cl) | 0;
        h[4] = (h2h + ch + ((h2l >>> 0) < (cl >>> 0) ? 1 : 0)) | 0;
        h3l = h[7] = (h3l + dl) | 0;
        h[6] = (h3h + dh + ((h3l >>> 0) < (dl >>> 0) ? 1 : 0)) | 0;
        h4l = h[9] = (h4l + el) | 0;
        h[8] = (h4h + eh + ((h4l >>> 0) < (el >>> 0) ? 1 : 0)) | 0;
        h5l = h[11] = (h5l + fl) | 0;
        h[10] = (h5h + fh + ((h5l >>> 0) < (fl >>> 0) ? 1 : 0)) | 0;
        h6l = h[13] = (h6l + gl) | 0;
        h[12] = (h6h + gh + ((h6l >>> 0) < (gl >>> 0) ? 1 : 0)) | 0;
        h7l = h[15] = (h7l + hl) | 0;
        h[14] = (h7h + hh + ((h7l >>> 0) < (hl >>> 0) ? 1 : 0)) | 0;
    }
}
exports.SHA512 = SHA512;
//# sourceMappingURL=SHA512.js.map
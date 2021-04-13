/*
SJCL is open. You can use, modify and redistribute it under a BSD
license or under the GNU GPL, version 2.0.

---------------------------------------------------------------------

http://opensource.org/licenses/BSD-2-Clause

Copyright (c) 2009-2015, Emily Stark, Mike Hamburg and Dan Boneh at
Stanford University. All rights reserved.

Redistribution and use in source and binary forms, with or without
modification, are permitted provided that the following conditions are
met:

1. Redistributions of source code must retain the above copyright
notice, this list of conditions and the following disclaimer.

2. Redistributions in binary form must reproduce the above copyright
notice, this list of conditions and the following disclaimer in the
documentation and/or other materials provided with the distribution.

THIS SOFTWARE IS PROVIDED BY THE COPYRIGHT HOLDERS AND CONTRIBUTORS "AS
IS" AND ANY EXPRESS OR IMPLIED WARRANTIES, INCLUDING, BUT NOT LIMITED
TO, THE IMPLIED WARRANTIES OF MERCHANTABILITY AND FITNESS FOR A
PARTICULAR PURPOSE ARE DISCLAIMED. IN NO EVENT SHALL THE COPYRIGHT
HOLDER OR CONTRIBUTORS BE LIABLE FOR ANY DIRECT, INDIRECT, INCIDENTAL,
SPECIAL, EXEMPLARY, OR CONSEQUENTIAL DAMAGES (INCLUDING, BUT NOT LIMITED
TO, PROCUREMENT OF SUBSTITUTE GOODS OR SERVICES; LOSS OF USE, DATA, OR
PROFITS; OR BUSINESS INTERRUPTION) HOWEVER CAUSED AND ON ANY THEORY OF
LIABILITY, WHETHER IN CONTRACT, STRICT LIABILITY, OR TORT (INCLUDING
NEGLIGENCE OR OTHERWISE) ARISING IN ANY WAY OUT OF THE USE OF THIS
SOFTWARE, EVEN IF ADVISED OF THE POSSIBILITY OF SUCH DAMAGE.
*/

/** A TS port of only SHA-512 of The "Stanford Javascript Crypto Library (SJCL)" */
export class bitArray {
  /**
   * Concatenate two bit arrays.
   * @param {bitArray} a1 The first array.
   * @param {bitArray} a2 The second array.
   * return {bitArray} The concatenation of a1 and a2.
   */
  static concat(a1: number[], a2: number[]) {
    if (a1.length === 0 || a2.length === 0) {
      return a1.concat(a2);
    }
    var last = a1[a1.length-1], shift = bitArray.getPartial(last);
    if (shift === 32) {
      return a1.concat(a2);
    } else {
      return bitArray._shiftRight(a2, shift, last|0, a1.slice(0,a1.length-1));
    }
  }
  /**
   * Find the length of an array of bits.
   * @param {bitArray} a The array.
   * return {Number} The length of a, in bits.
   */
  static bitLength(a: number[]) {
    var l = a.length, x: number;
    if (l === 0) { return 0; }
    x = a[l - 1];
    return (l-1) * 32 + bitArray.getPartial(x);
  }
  /**
   * Truncate an array.
   * @param {bitArray} a The array.
   * @param {Number} len The length to truncate to, in bits.
   * return {bitArray} A new array, truncated to len bits.
   */
  static clamp(a: number[], len: number) {
    if (a.length * 32 < len) { return a; }
    a = a.slice(0, Math.ceil(len / 32));
    var l = a.length;
    len = len & 31;
    if (l > 0 && len) {
      a[l-1] = bitArray.partial(len, a[l-1] & 0x80000000 >> (len-1), 1);
    }
    return a;
  }
  /**
   * Make a partial word for a bit array.
   * @param {Number} len The number of bits in the word.
   * @param {Number} x The bits.
   * @param {Number} [_end=0] Pass 1 if x has already been shifted to the high side.
   * return {Number} The partial word.
   */
  static partial(len: number, x: number, _end: 0|1 = 0) {
    if (len === 32) { return x; }
    return (_end ? x|0 : x << (32-len)) + len * 0x10000000000;
  }
  /**
   * Get the number of bits used by a partial word.
   * @param {Number} x The partial word.
   * return {Number} The number of bits used by the partial word.
   */
  static getPartial(x: number) {
    return Math.round(x/0x10000000000) || 32;
  }
  /**
   * Compare two arrays for equality in a predictable amount of time.
   * @param {bitArray} a The first array.
   * @param {bitArray} b The second array.
   * return {boolean} true if a == b; false otherwise.
   */
  static equal(a: number[], b: number[]) {
    if (bitArray.bitLength(a) !== bitArray.bitLength(b)) {
      return false;
    }
    var x = 0, i: number;
    for (i=0; i<a.length; i++) {
      x |= a[i]^b[i];
    }
    return (x === 0);
  }
  /** Shift an array right.
   * @param {bitArray} a The array to shift.
   * @param {Number} shift The number of bits to shift.
   * @param {Number} [carry=0] A byte to carry in
   * @param {bitArray} [out=[]] An array to prepend to the output.
   * @private
   */
  private static _shiftRight(a: number[], shift: number, carry: number, out: number[]) {
    var i: number, last2=0, shift2: number;
    if (out === undefined) { out = []; }

    for (; shift >= 32; shift -= 32) {
      out.push(carry);
      carry = 0;
    }
    if (shift === 0) {
      return out.concat(a);
    }

    for (i=0; i<a.length; i++) {
      out.push(carry | a[i]>>>shift);
      carry = a[i] << (32-shift);
    }
    last2 = a.length ? a[a.length-1] : 0;
    shift2 = bitArray.getPartial(last2);
		const p2 = (shift + shift2 > 32) ? carry : out.pop();
    out.push(bitArray.partial(shift+shift2 & 31, p2, 1));
    return out;
  }
}

export class codecHex {
	/** Convert from a bitArray to a hex string. */
  static fromBits(arr: number[]) {
    var out = "", i: number;
    for (i=0; i<arr.length; i++) {
      out += ((arr[i]|0)+0xF00000000000).toString(16).substr(4);
    }
    return out.substr(0, bitArray.bitLength(arr)/4);//.replace(/(.{8})/g, "$1 ");
  }
  /** Convert from a hex string to a bitArray. */
  static toBits(str: string) {
    var i: number, out=[], len: number;
    str = str.replace(/\s|0x/g, "");
    len = str.length;
    str = str + "00000000";
    for (i=0; i<str.length; i+=8) {
      out.push(parseInt(str.substr(i,8),16)^0);
    }
    return bitArray.clamp(out, len*4);
  }
}

export class codecUtf8String {
	/** Convert from a bitArray to a UTF-8 string. */
  static fromBits(arr: number[]) {
    var out = "", bl = bitArray.bitLength(arr), i: number, tmp: number;
    for (i=0; i<bl/8; i++) {
      if ((i&3) === 0) {
        tmp = arr[i/4];
      }
      out += String.fromCharCode(tmp >>> 24);
      tmp <<= 8;
    }
    return decodeURIComponent(escape(out));
  }

  /** Convert from a UTF-8 string to a bitArray. */
  static toBits(str: string) {
    str = unescape(encodeURIComponent(str));
    var out = [], i: number, tmp=0;
    for (i=0; i<str.length; i++) {
      tmp = tmp << 8 | str.charCodeAt(i);
      if ((i&3) === 3) {
        out.push(tmp);
        tmp = 0;
      }
    }
    if (i&3) {
      out.push(bitArray.partial(8*(i&3), tmp));
    }
    return out;
  }
}

export class SHA512 {

  constructor(hash = null) {
	  if (!this._key[0]) { this._precompute(); }
	  if (hash) {
	    this._h = hash._h.slice(0);
	    this._buffer = hash._buffer.slice(0);
	    this._length = hash._length;
	  } else {
	    this.reset();
	  }
	}

	static hash(data: number[] | string) {
	  return (new SHA512()).update(data).finalize();
	}

	private _h: any;
	private _buffer: any;
	private _length: any;
	/**
   * The hash's block size, in bits.
   * @constant
   */
  blockSize = 1024;

  /**
   * Reset the hash state.
   * return this
   */
  reset() {
    this._h = this._init.slice(0);
    this._buffer = [];
    this._length = 0;
    return this;
  }

  /**
   * Input several words to the hash.
   * @param {bitArray|String} data the data to hash.
   * return this
   */
  update(data: number[] | string) {
    if (typeof data === "string") {
      data = codecUtf8String.toBits(data);
    }
    var i: number, b = this._buffer = bitArray.concat(this._buffer, data),
        ol = this._length,
        nl = this._length = ol + bitArray.bitLength(data);
    if (nl > 9007199254740991){
      throw new Error("Cannot hash more than 2^53 - 1 bits");
    }
    if (typeof Uint32Array !== 'undefined') {
	    var c = new Uint32Array(b);
	    var j = 0;
	    for (i = 1024+ol - ((1024+ol) & 1023); i <= nl; i+= 1024) {
        this._block(c.subarray(32 * j, 32 * (j+1)));
        j += 1;
	    }
	    b.splice(0, 32 * j);
    } else {
      for (i = 1024+ol - ((1024+ol) & 1023); i <= nl; i+= 1024) {
      	this._block(b.splice(0,32));
      }
    }
    return this;
  }
	/**
   * Complete hashing and output the hash value.
   * return {bitArray} The hash value, an array of 16 big-endian words.
   */
  finalize() {
    var i: number, b = this._buffer, h = this._h;
    // Round out and push the buffer
    b = bitArray.concat(b, [bitArray.partial(1,1)]);
    // Round out the buffer to a multiple of 32 words, less the 4 length words.
    for (i = b.length + 4; i & 31; i++) {
      b.push(0);
    }
    // append the length
    b.push(0);
    b.push(0);
    b.push(Math.floor(this._length / 0x100000000));
    b.push(this._length | 0);
    while (b.length) {
      this._block(b.splice(0,32));
    }
    this.reset();
    return h;
  }


	/**
	 * The SHA-512 initialization vector, to be precomputed.
	 * @private
	 */
	private _init = [];
	/**
	 * Least significant 24 bits of SHA512 initialization values.
	 *
	 * Javascript only has 53 bits of precision, so we compute the 40 most
	 * significant bits and add the remaining 24 bits as constants.
	 *
	 * @private
	 */
	private _initr = [ 0xbcc908, 0xcaa73b, 0x94f82b, 0x1d36f1, 0xe682d1, 0x3e6c1f, 0x41bd6b, 0x7e2179 ];
	/*
	_init:
	[0x6a09e667, 0xf3bcc908, 0xbb67ae85, 0x84caa73b, 0x3c6ef372, 0xfe94f82b, 0xa54ff53a, 0x5f1d36f1,
	 0x510e527f, 0xade682d1, 0x9b05688c, 0x2b3e6c1f, 0x1f83d9ab, 0xfb41bd6b, 0x5be0cd19, 0x137e2179],
	*/
	/**
	 * The SHA-512 hash key, to be precomputed.
	 * @private
	 */
	private _key = [];
	/**
	 * Least significant 24 bits of SHA512 key values.
	 * @private
	 */
	private _keyr =
	[0x28ae22, 0xef65cd, 0x4d3b2f, 0x89dbbc, 0x48b538, 0x05d019, 0x194f9b, 0x6d8118,
	 0x030242, 0x706fbe, 0xe4b28c, 0xffb4e2, 0x7b896f, 0x1696b1, 0xc71235, 0x692694,
	 0xf14ad2, 0x4f25e3, 0x8cd5b5, 0xac9c65, 0x2b0275, 0xa6e483, 0x41fbd4, 0x1153b5,
	 0x66dfab, 0xb43210, 0xfb213f, 0xef0ee4, 0xa88fc2, 0x0aa725, 0x03826f, 0x0e6e70,
	 0xd22ffc, 0x26c926, 0xc42aed, 0x95b3df, 0xaf63de, 0x77b2a8, 0xedaee6, 0x82353b,
	 0xf10364, 0x423001, 0xf89791, 0x54be30, 0xef5218, 0x65a910, 0x71202a, 0xbbd1b8,
	 0xd2d0c8, 0x41ab53, 0x8eeb99, 0x9b48a8, 0xc95a63, 0x418acb, 0x63e373, 0xb2b8a3,
	 0xefb2fc, 0x172f60, 0xf0ab72, 0x6439ec, 0x631e28, 0x82bde9, 0xc67915, 0x72532b,
	 0x26619c, 0xc0c207, 0xe0eb1e, 0x6ed178, 0x176fba, 0xc898a6, 0xf90dae, 0x1c471b,
	 0x047d84, 0xc72493, 0xc9bebc, 0x100d4c, 0x3e42b6, 0x657e2a, 0xd6faec, 0x475817];
	/**
	 * Function to precompute _init and _key.
	 * @private
	 */
	_precompute() {
		// XXX: This code is for precomputing the SHA256 constants, change for
		//      SHA512 and re-enable.
		var i = 0, prime = 2, factor: number, isPrime: boolean;
		function frac(x: number)  { return (x-Math.floor(x)) * 0x100000000 | 0; }
		function frac2(x: number) { return (x-Math.floor(x)) * 0x10000000000 & 0xff; }
		for (; i<80; prime++) {
			isPrime = true;
			for (factor=2; factor*factor <= prime; factor++) {
				if (prime % factor === 0) {
					isPrime = false;
					break;
				}
			}
			if (isPrime) {
				if (i<8) {
					this._init[i*2] = frac(Math.pow(prime, 1/2));
					this._init[i*2+1] = (frac2(Math.pow(prime, 1/2)) << 24) | this._initr[i];
				}
				this._key[i*2] = frac(Math.pow(prime, 1/3));
				this._key[i*2+1] = (frac2(Math.pow(prime, 1/3)) << 24) | this._keyr[i];
				i++;
			}
		}
	}

	/**
   * Perform one cycle of SHA-512.
   * @param {Uint32Array|bitArray} words one block of words.
   * @private
   */
  private _block(words: any) {
    var i: number, wrh: number, wrl: number,
        h = this._h,
        k = this._key,
        h0h = h[ 0], h0l = h[ 1], h1h = h[ 2], h1l = h[ 3],
        h2h = h[ 4], h2l = h[ 5], h3h = h[ 6], h3l = h[ 7],
        h4h = h[ 8], h4l = h[ 9], h5h = h[10], h5l = h[11],
        h6h = h[12], h6l = h[13], h7h = h[14], h7l = h[15];
    var w: number[];
    if (typeof Uint32Array !== 'undefined') {
	// When words is passed to _block, it has 32 elements. SHA512 _block
	// function extends words with new elements (at the end there are 160 elements).
	// The problem is that if we use Uint32Array instead of Array,
	// the length of Uint32Array cannot be changed. Thus, we replace words with a
	// normal Array here.
        w = Array(160); // do not use Uint32Array here as the instantiation is slower
        for (var j=0; j<32; j++){
    	    w[j] = words[j];
        }
    } else {
			w = words;
    }
    // Working variables
    var ah = h0h, al = h0l, bh = h1h, bl = h1l,
        ch = h2h, cl = h2l, dh = h3h, dl = h3l,
        eh = h4h, el = h4l, fh = h5h, fl = h5l,
        gh = h6h, gl = h6l, hh = h7h, hl = h7l;
    for (i=0; i<80; i++) {
      // load up the input word for this round
      if (i<16) {
        wrh = w[i * 2];
        wrl = w[i * 2 + 1];
      } else {
        // Gamma0
        var gamma0xh = w[(i-15) * 2];
        var gamma0xl = w[(i-15) * 2 + 1];
        var gamma0h =
          ((gamma0xl << 31) | (gamma0xh >>> 1)) ^
          ((gamma0xl << 24) | (gamma0xh >>> 8)) ^
           (gamma0xh >>> 7);
        var gamma0l =
          ((gamma0xh << 31) | (gamma0xl >>> 1)) ^
          ((gamma0xh << 24) | (gamma0xl >>> 8)) ^
          ((gamma0xh << 25) | (gamma0xl >>> 7));
        // Gamma1
        var gamma1xh = w[(i-2) * 2];
        var gamma1xl = w[(i-2) * 2 + 1];
        var gamma1h =
          ((gamma1xl << 13) | (gamma1xh >>> 19)) ^
          ((gamma1xh << 3)  | (gamma1xl >>> 29)) ^
           (gamma1xh >>> 6);
        var gamma1l =
          ((gamma1xh << 13) | (gamma1xl >>> 19)) ^
          ((gamma1xl << 3)  | (gamma1xh >>> 29)) ^
          ((gamma1xh << 26) | (gamma1xl >>> 6));
        // Shortcuts
        var wr7h = w[(i-7) * 2];
        var wr7l = w[(i-7) * 2 + 1];
        var wr16h = w[(i-16) * 2];
        var wr16l = w[(i-16) * 2 + 1];
        // W(round) = gamma0 + W(round - 7) + gamma1 + W(round - 16)
        wrl = gamma0l + wr7l;
        wrh = gamma0h + wr7h + ((wrl >>> 0) < (gamma0l >>> 0) ? 1 : 0);
        wrl += gamma1l;
        wrh += gamma1h + ((wrl >>> 0) < (gamma1l >>> 0) ? 1 : 0);
        wrl += wr16l;
        wrh += wr16h + ((wrl >>> 0) < (wr16l >>> 0) ? 1 : 0);
      }
      w[i*2]     = wrh |= 0;
      w[i*2 + 1] = wrl |= 0;
      // Ch
      var chh = (eh & fh) ^ (~eh & gh);
      var chl = (el & fl) ^ (~el & gl);
      // Maj
      var majh = (ah & bh) ^ (ah & ch) ^ (bh & ch);
      var majl = (al & bl) ^ (al & cl) ^ (bl & cl);
      // Sigma0
      var sigma0h = ((al << 4) | (ah >>> 28)) ^ ((ah << 30) | (al >>> 2)) ^ ((ah << 25) | (al >>> 7));
      var sigma0l = ((ah << 4) | (al >>> 28)) ^ ((al << 30) | (ah >>> 2)) ^ ((al << 25) | (ah >>> 7));
      // Sigma1
      var sigma1h = ((el << 18) | (eh >>> 14)) ^ ((el << 14) | (eh >>> 18)) ^ ((eh << 23) | (el >>> 9));
      var sigma1l = ((eh << 18) | (el >>> 14)) ^ ((eh << 14) | (el >>> 18)) ^ ((el << 23) | (eh >>> 9));
      // K(round)
      var krh = k[i*2];
      var krl = k[i*2+1];
      // t1 = h + sigma1 + ch + K(round) + W(round)
      var t1l = hl + sigma1l;
      var t1h = hh + sigma1h + ((t1l >>> 0) < (hl >>> 0) ? 1 : 0);
      t1l += chl;
      t1h += chh + ((t1l >>> 0) < (chl >>> 0) ? 1 : 0);
      t1l += krl;
      t1h += krh + ((t1l >>> 0) < (krl >>> 0) ? 1 : 0);
      t1l = t1l + wrl|0;   // FF32..FF34 perf issue https://bugzilla.mozilla.org/show_bug.cgi?id=1054972
      t1h += wrh + ((t1l >>> 0) < (wrl >>> 0) ? 1 : 0);
      // t2 = sigma0 + maj
      var t2l = sigma0l + majl;
      var t2h = sigma0h + majh + ((t2l >>> 0) < (sigma0l >>> 0) ? 1 : 0);
      // Update working variables
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
    // Intermediate hash
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

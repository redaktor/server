import has from '@dojo/framework/core/has';

function getLengths(b64: string): [number, number] {
  const len: number = b64.length;

  if (len % 4 > 0) {
    throw new TypeError("Invalid string. Length must be a multiple of 4");
  }

  // Trim off extra bytes after placeholder bytes are found
  // See: https://github.com/beatgammit/base64-js/issues/42
  let validLen: number = b64.indexOf("=");

  if (validLen === -1) {
    validLen = len;
  }

  const placeHoldersLen: number = validLen === len ? 0 : 4 - (validLen % 4);

  return [validLen, placeHoldersLen];
}

// DENO https://raw.githubusercontent.com/chiefbiiko/base64/master/base.ts
function init(lookup: string[], revLookup: number[]) {
  function _byteLength(validLen: number, placeHoldersLen: number): number {
    return ((validLen + placeHoldersLen) * 3) / 4 - placeHoldersLen;
  }

  function tripletToBase64(num: number): string {
    return (
      lookup[(num >> 18) & 0x3f] +
      lookup[(num >> 12) & 0x3f] +
      lookup[(num >> 6) & 0x3f] +
      lookup[num & 0x3f]
    );
  }

  function encodeChunk(buf: Uint8Array, start: number, end: number): string {
    const out: string[] = new Array((end - start) / 3);

    for (let i: number = start, curTriplet: number = 0; i < end; i += 3) {
      out[curTriplet++] = tripletToBase64(
        (buf[i] << 16) + (buf[i + 1] << 8) + buf[i + 2]
      );
    }

    return out.join("");
  }

  return {
    // base64 is 4/3 + up to two characters of the original data
    byteLength(b64: string): number {
      return _byteLength.apply(null, getLengths(b64));
    },
    toUint8Array(b64: string): Uint8Array {
      const [validLen, placeHoldersLen]: number[] = getLengths(b64);

      const buf = new Uint8Array(_byteLength(validLen, placeHoldersLen));

      // If there are placeholders, only get up to the last complete 4 chars
      const len: number = placeHoldersLen ? validLen - 4 : validLen;

      let tmp: number;
      let curByte: number = 0;
      let i: number;

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
      } else if (placeHoldersLen === 1) {
        tmp =
          (revLookup[b64.charCodeAt(i)] << 10) |
          (revLookup[b64.charCodeAt(i + 1)] << 4) |
          (revLookup[b64.charCodeAt(i + 2)] >> 2);
        buf[curByte++] = (tmp >> 8) & 0xff;
        buf[curByte++] = tmp & 0xff;
      }

      return buf;
    },
    fromUint8Array(buf: Uint8Array): string {
      const maxChunkLength: number = 16383; // Must be multiple of 3

      const len: number = buf.length;

      const extraBytes: number = len % 3; // If we have 1 byte left, pad 2 bytes

      const len2: number = len - extraBytes;

      const parts: string[] = new Array(
        Math.ceil(len2 / maxChunkLength) + (extraBytes ? 1 : 0)
      );

      let curChunk: number = 0;
      let chunkEnd: number;

      // Go through the array every three bytes, we'll deal with trailing stuff later
      for (let i: number = 0; i < len2; i += maxChunkLength) {
        chunkEnd = i + maxChunkLength;
        parts[curChunk++] = encodeChunk(
          buf,
          i,
          chunkEnd > len2 ? len2 : chunkEnd
        );
      }

      let tmp: number;

      // Pad the end with zeros, but make sure to not forget the extra bytes
      if (extraBytes === 1) {
        tmp = buf[len2];
        parts[curChunk] = lookup[tmp >> 2] + lookup[(tmp << 4) & 0x3f] + "==";
      } else if (extraBytes === 2) {
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

function _repeat(str: string, num: number) { return new Array(num + 1).join(str); };

const lookup: string[] = [];
const revLookup: number[] = [];
const code: string =
  "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789+/";

for (let i: number = 0, l = code.length; i < l; ++i) {
  lookup[i] = code[i];
  revLookup[code.charCodeAt(i)] = i;
}

// Support decoding URL-safe base64 strings, as Node.js does.
// See: https://en.wikipedia.org/wiki/Base64#URL_applications
revLookup["-".charCodeAt(0)] = 62;
revLookup["_".charCodeAt(0)] = 63;

const mod: {
  byteLength(b64: string): number;
  toUint8Array(b64: string): Uint8Array;
  fromUint8Array(buf: Uint8Array): string;
} = init(lookup, revLookup);


/* EXPORTS - TODO : DOC */
export const byteLength: (b64: string) => number = mod.byteLength;
export const toUint8Array: (b64: string) => Uint8Array = mod.toUint8Array;
export const fromUint8Array: (buf: Uint8Array) => string = mod.fromUint8Array;

export function escape(str: string) {
  return str.replace(/\+/g, '-').replace(/\//g, '_').replace(/=/g, '');
}
export function unescape(str: string) {
  str = str.toString();
  var mod = str.length % 4;
  if (mod !== 0) { str += _repeat('=', 4 - mod); }
  return str.replace(/\-/g, '+').replace(/_/g, '/');
}

export function encode(str: string) {
  if (has('host-node')) {
    return Buffer.from(str, 'utf8').toString('base64');
  } else {
    return btoa(encodeURIComponent(str).replace(/%([0-9A-F]{2})/g, function(m, p1) {
      return String.fromCharCode(parseInt(('0x'+p1), 16));
    }));
  }
}
export function decode(b64String: string | Buffer) {
  b64String = b64String.toString();
  if (has('host-node')) {
    return Buffer.from(b64String, 'base64').toString('utf8');
  } else {
    return decodeURIComponent(b64String.split('').map(function(c) {
        return '%' + ('00' + c.charCodeAt(0).toString(16)).slice(-2);
    }).join(''));
  }
}
export function urlEncode(str: string): string {
  return escape(encode(str));
}
export function urlDecode(b64String: string | Buffer): string {
  b64String = b64String.toString();
  return decode(unescape(b64String));
}

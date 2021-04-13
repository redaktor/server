/* TODO FIXME : crypto-browserify */

/**
 * redaktor/crypto
 *
 * TODO FIXME - DESCRIPTION when alpha
 *
 * Copyright (c) 2016 Sebastian Lasse, redaktor foundation
 * TODO FIXME - CLEAR LICENSE when alpha
 */
 export const isNodeJS: string | false = (
   (typeof process === 'object' && process.versions && process.versions.node && global.Buffer) &&
   process.versions.node
 ) || false;
//import has from '@dojo/framework/has/has';
//import { log } from '../log';
const crypto = require('crypto-browserify');
/**
 * support algorithm mapping JWT / redaktor.crypto
 */
const HMAC_ALGO: any = {
	md5: false,
	ripemd160: false,
	sha1: false,
	sha3: false,
	sha224: false,
	sha256: 'HS256',
	sha384: 'HS384',
	sha512: 'HS512'
};
const HASH_ALGO: any = {
	md5: 'MD5',
	sha1: 'SHA1',
	sha2: 'SHA2',
	sha224: 'SHA224',
	sha256: 'SHA256',
	sha384: 'SHA384',
	sha512: 'SHA512'
}
const env = isNodeJS ? 'node.js' : 'client';
type ENC = 'latin1' | 'hex' | 'base64';
type OUT = ENC | 'buffer' | undefined;
type SOB = string | Buffer;

/* TODO - FIXME
get const HOST_HMAC_ALGO for node.js by 'openssl list-message-digest-algorithms'
*/
export function hmacAlgorithm(algoStr: string, isJWT: boolean = false) {
	const algo = algoStr.toLowerCase();
	const allow = (isJWT) ?
		(typeof algo === 'string' && typeof HMAC_ALGO[algo] === 'string') :
		(typeof algo === 'string' && HMAC_ALGO.hasOwnProperty(algo));
	if (!allow) {
		const suffix = (isJWT) ? 'for JWT.' : '.';
		/*log({warning: ['[SECURITY] algorithm',algoStr,'not usable in',env,
										'or to weak',suffix, 'Falling back to sha256.'].join(' ')});*/
		return {method: 'sha256', alg: HMAC_ALGO['sha256']};
	}
	return {method: algo, alg: HMAC_ALGO[algo]};
}

class Crypto {
  static randomBytes(size: number = 32) {
		return crypto.randomBytes(size)
	}
	static hash(text: SOB, algo: string, out: 'buffer'): Buffer
	static hash(text: SOB, algo: string, out: ENC): string
	static hash(text: SOB, algo = 'sha256', out: OUT = 'hex'): SOB {
		if (out === 'buffer') { out = void 0 }
		if (crypto.getHashes().indexOf(algo.toLowerCase()) === -1) {
			/*log({warning: ['[SECURITY] algorithm',algo,'not usable in',env,
											'or to weak. Falling back to sha256.'].join(' ')});*/
			algo = 'sha256'
		}
		return crypto.createHash(algo.toLowerCase()).update(text).digest(<any>out);
	}

	static hmac(text: SOB, key: string, out: 'buffer', algo?: string): Buffer
	static hmac(text: SOB, key: string, out: ENC, algo?: string): string
	static hmac(text: SOB, key: string, out: OUT = 'base64', algo = 'sha256'): SOB {
		if (out === 'buffer') { out = void 0 }
		algo = hmacAlgorithm(algo).method;
		return crypto.createHmac(algo, key).update(text).digest(<any>out);
	}

	static sign(text: SOB, key: string, algo = 'RSA-SHA256', out: ENC = 'base64') {
		return crypto.createSign(algo).update(text).sign(key, out);
	}
	static verify(text: SOB, key: string, algo = 'sha256', signature = '', out: ENC = 'base64') {
		return crypto.createVerify(algo).update(text).verify(key, signature, out);
	}
};
export default Crypto;

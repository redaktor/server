import { SRPFORM, SupportedRFC5054Bits, SupportedHashAlgo } from './interfaces';
import { BigInteger } from 'jsbn';
import { SHA512, codecHex } from '../../SHA512';
import { PakeBase } from '../Base';
import { SRP, HASH, ACTIONS } from './constants';
// TODO TS partial :
import * as _forge from './forge.aes';
const forge: _forge.AES = <any>_forge;

export const Errors = { // TODO i18n?
	Param1: `Parameter 1 'group' is not supported.
Possible values: 1024 | 1536 | 2048 | 3072 | 4096 (default value)`,
	Param2: `Parameter 2 'hash' is not supported.
Possible values: SHA256 | SHA384 | SHA512 (default value)`,
	uIsZero: ``,
	FormAttributes: `Your form must have inputs with the name attributes
'identity' and 'password' and a hidden input with the name attribute 'credentials'`,
	NotForm: `Parameter form is not a HTMLFormElement.`,
	NoAction: `Your form is missing the action attribute (path to login).`,
	IllegalStateException: `IllegalStateException, wrong browser state`,
	IllegalActionException: `IllegalActionException, wrong browser action`,
	SRP6ExceptionB: `SRP6Exception Bad server public value 'B' as B === 0 (mod N)`,
	SRP6ExceptionCredentials: `SRP6Exception Bad server credentials`
}

export class Base extends PakeBase {
	protected randomFn = PakeBase.randomByteHex;
	// Big Integer Constants
	protected readonly N: BigInteger;
	protected readonly g: BigInteger;
	protected readonly k: BigInteger;
	// Parameters
	protected x: BigInteger|null = null; // salted hashed password
	protected v = null; // verifier
	protected A = null; // client public key
	protected B = null; // server public key
	protected S = null; // shared secret key long form
	protected K = null; // shared secret pbkdf2 form
	protected M2: string = null; // shared key proof

	static hash(...strings: (string|number)[]) {
		const hash = new SHA512();
		strings.forEach(s => hash.update(`${s}`));
		return codecHex.fromBits(hash.finalize());
	}
	static ACTIONS = ACTIONS;

  constructor(
		readonly group: SupportedRFC5054Bits = 4096,
		readonly hash: SupportedHashAlgo = 'SHA512'
	) {
    super();
		const _group = SRP[`${group}`];
		const _hash = HASH[`${hash}`];
		if (!_group) { throw new Error(Errors.Param1) }
		if (!_hash) { throw new Error(Errors.Param2) }
		this.group = <SupportedRFC5054Bits>`${group}`;
		this.g = PakeBase.BigInteger(_group.g, 10);
		this.N = PakeBase.BigInteger(_group.N, 16);
		this.k = PakeBase.BigInteger(this.H(_group.N, _group.g), 16);
  }

	getSessionSecret(deriveKeySalt: string = null) {
  	if (typeof this.S === 'undefined' || this.S === null) { return null }
  	const hexedS = Base.toHex(this.S);
  	if (!deriveKeySalt) { return hexedS; }
		if (this.K === null) { this.K = forge.pbkdf2(hexedS, deriveKeySalt, 8, 16, 'sha256') }
		return this.K;
  }
/*
const encryption = (secret, salt) => {
  const iv = aes.util.createBuffer(SRP.randomByteHex(16)).getBytes();
  const key = aes.pbkdf2(secret, salt, 8, 16, 'sha256');
  console.log(key)
  return {
    encrypt: (data) => {
      const cipher = crypto.createCipher('AES-CBC', key)
      cipher.start({iv: iv})
      cipher.update(aes.util.createBuffer(data))
      cipher.finish()
      return cipher.output.toHex()
    },
    decrypt: (data) => {
      data = aes.util.hexToBytes(data);
      const decipher = crypto.createDecipher('AES-CBC', key)
      decipher.start({iv: iv});
      decipher.update(aes.util.createBuffer(data))
      decipher.finish()
      return decipher.output.toString()
    }
  }
}
var e = encryption('Foo', '13333331111111111111111111333331xyz');
console.log(e.decrypt(e.encrypt('token')));
*/

	protected encrypt(message: string, key: string = this.K) {
		console.log('encrypt rand', this.randomFn(16));
		const { cipher, util } = forge;
		const c = cipher.createCipher('AES-CBC', key);
		c.start({iv: forge.util.createBuffer('abcdefghijklmnopabcdefghijklmnop').getBytes()});
		c.update(util.createBuffer(message));
		c.finish();
		// outputs encrypted hex
		return c.output.toHex();
	}
	protected decrypt(data: string, key: string = this.K) {
		console.log('decrypt rand', this.randomFn(16));
		const { cipher, util } = forge;
		data = util.hexToBytes(data);
		const dc = cipher.createDecipher('AES-CBC', key);
		dc.start({iv: forge.util.createBuffer('abcdefghijklmnopabcdefghijklmnop').getBytes()});
		dc.update(util.createBuffer(data));
		dc.finish();
		//console.log(dc.output);
		// outputs encrypted hex
		return dc.output.toString()
	}

	/**
	 * Computes the hashes for SRP
	 * <p> Specification RFC 2945 / 5054
	 *
	 */
	protected H(...strings: (string|number)[]) {
		return Base.hash(...strings)
	}

	/** TODO DOC */
	protected checkAB(key: 'A'|'B') {
		if (this[key].equals(Base.ZERO) || this[key].mod(this.N).equals(Base.ZERO)) {
  		throw new Error(`SRP6Exception bad server public value '${key}' as ${key} === 0 (mod N)`);
  	}
	}
  /**
   * Computes the random scrambling parameter u = H(A | B)
   * <p> Specification RFC 2945
   * Will throw an error if u is ZERO
   *
   * @param A      The public client value 'A'. Must not be {@code null}.
   * @param B      The public server value 'B'. Must not be {@code null}.
   *
   * @return The resulting 'u' value.
   */
  protected computeU(Astr: string, Bstr: string) {
  	// console.log('computeU');
  	this.checks({Astr, Bstr}, true);
  	var output = this.H(`${Astr}${Bstr}`);
  	// console.log('js raw u:'+output);
  	var u = PakeBase.BigInteger(`${output}`, 16);
  	// console.log('js u:'+PakeBase.toHex(u));
  	if (PakeBase.ZERO.equals(u)) {
  	   throw new Error(`SRP6Exception bad shared public value 'u' as u===0`);
  	}
  	return u;
  }

	/* Browser Helper */
	static checkForm(form: HTMLFormElement) {
		if (!(form instanceof HTMLFormElement)) {
			throw new Error(Errors.NotForm)
		} else if (!form.action || typeof form.action !== 'string') {
			throw new Error(Errors.NoAction)
		}
		if (!form.method || typeof form.method !== 'string') { form.method = 'post' }
		return form
	}
	static formResult(form: HTMLFormElement, delPW = true): SRPFORM {
		const formArr = new FormData(Base.checkForm(form));
		const formRes: any = {};
		for (let pair of formArr) { formRes[pair[0]] = pair[1] }
		const { password, ...shared } = formRes;
		if (delPW) { form.querySelector('[name="password"]')['value'] = '' }
		if (!shared.identity || !password || !shared.hasOwnProperty('credentials')) {
			throw new Error(Errors.FormAttributes);
		}
		return { shared, secret: { password }, toJSON: () => JSON.stringify(shared) }
	}
}

import { SRPFORM, SupportedRFC5054Bits, SupportedHashAlgo } from './interfaces';
import { BigInteger } from 'jsbn';
import { SHA512, codecHex } from '../../SHA512';
import { PakeBase } from '../Base';
import { SRP, HASH, ACTION } from './constants';
import * as clientForge from './forge.pki.aes.min';
import * as nodeForge from 'node-forge';
type FORGE = typeof nodeForge & {pbkdf2?: Function};
export type PrivateKey = nodeForge.pki.rsa.PrivateKey;
export type PublicKey = nodeForge.pki.rsa.PublicKey;

export const Errors = { // TODO i18n?
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
}

export class Base extends PakeBase {
	protected randomFn = PakeBase.randomByteHex;
	protected randomBytes = PakeBase.randomBytes;
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

	static ACTION = ACTION;
	static forge: FORGE = <any>clientForge;

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
		if (this.K === null) { this.K = Base.forge.pbkdf2(hexedS, deriveKeySalt, 8, 32, 'sha256') }
		return this.K;
  }

	static hash(...strings: (string|number)[]) {
		const hash = new SHA512();
		strings.forEach(s => hash.update(`${s}`));
		return codecHex.fromBits(hash.finalize());
	}
	/** UUID :
	 * version 4 without arguments
	 * version 5 with one string as arguments
	*/
	static uuid(/** optional string for uuid v5 */v5name?: string) {
	  if (typeof v5name === 'string') {
	    /* uuid v5 : */
	    let h = crypto.hash(v5name, 'sha1', 'buffer');
	    h[8] = h[8] & 0x3f | 0xa0; /* variant */
	    h[6] = h[6] & 0x0f | 0x50; /* version */
	    return (h.toString('hex', 0, 16).match(/.{1,8}/g)||[]).join('-');
	  }
	  /* uuid v4 */
	  return Base.uuid4()
	}
	private static uuid4(): string {
		return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function(c) {
			const r = (Math.random() * 16) | 0,
				v = c === 'x' ? r : (r & 0x3) | 0x8;
			return v.toString(16);
		});
	}

	// encrypt data with a public key using RSAES-OAEP/SHA-256/MGF1-SHA-1
	// compatible with Java's RSA/ECB/OAEPWithSHA-256AndMGF1Padding
	static encryptRSA(message: string, publicKey: PublicKey) {
		const { md, util } = Base.forge;
	  message = util.encodeUtf8(message);
	  return encodeURIComponent(util.encode64(publicKey.encrypt(message, 'RSA-OAEP', {
	    md: md.sha256.create(),
	    mgf1: { md: md.sha1.create() }
	  })))
	}
	protected encryptRSA(message: string, publicKey: PublicKey) {
		return Base.encryptRSA(message, publicKey)
	}
	// decrypt data with a private key using RSAES-OAEP/SHA-256/MGF1-SHA-1
	// compatible with Java's RSA/ECB/OAEPWithSHA-256AndMGF1Padding
	static decryptRSA(message: string, privateKey: PrivateKey) {
		const { md, util } = Base.forge;
	  message = decodeURIComponent(message);
	  return util.decodeUtf8(privateKey.decrypt(util.decode64(message), 'RSA-OAEP', {
	    md: md.sha256.create(),
	    mgf1: { md: md.sha1.create() }
	  }))
	}
	protected decryptRSA(message: string, privateKey: PrivateKey) {
		return Base.decryptRSA(message, privateKey)
	}
	// encrypt data with the shared secret key using AES-GCM
	encrypt(message: string, key: string) {
		const { cipher, util } = Base.forge;
		const iv = util.createBuffer(this.randomBytes(12));
		const c = cipher.createCipher("AES-GCM", key);
		c.start({ iv });
		c.update(util.createBuffer(util.encode64(message)));
		c.finish();
		return encodeURIComponent([iv, c.output, c.mode.tag].map((b) =>
			util.encode64(b.getBytes())).join(''))
	}
	// decrypt data with the shared secret key using AES-GCM
	decrypt(data: string, key: string) {
		data = decodeURIComponent(data);
		const { cipher, util } = Base.forge;
		const dc = cipher.createDecipher("AES-GCM", key);
    const end = data.length-24;
    let [iv, msg, tag] = [[0,16],[16,end],[end]].map((a) => util.decode64(data.slice(...a)));
    dc.start({ iv, tag: util.createBuffer(tag) });
    dc.update(util.createBuffer(msg));
    dc.finish();
    return util.decode64(dc.output.toString())
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
  /*
   * Generates a new verifier 'v' from the specified parameters.
   * <p>The verifier is computed as v = g^x (mod N).</p><p>Specification RFC 2945</p>
   *
   * @param salt     The salt 's'. Must not be null or empty.
   * @param identity The user identity/email 'I'. Must not be null or empty.
   * @param password The user password 'P'. Must not be null or empty
   * @return The resulting verifier 'v' as a hex string
   */
  protected makeV(I: string, P: string) {
  	// no need to check the parameters as generateX will do this
  	const x = this.generateX(I, P);
  	this.v = this.g.modPow(x, this.N);
  	return Base.toHex(this.v);
  }
	/** private<p>
	 *
	 * Computes x = H(s | H(I | ':' | P))
	 * <p> Uses string concatenation before hashing.</p><p> Specification RFC 2945</p>
	 *
	 * @param s   The salt 's'. Must not be null or empty.
	 * @param I 	The user identity/email 'I'. Must not be null or empty.
	 * @param P 	The user password 'P'. Must not be null or empty
	 * @return 		The resulting 'x' value as BigInteger.
	 */
	protected generateX(I: string, P: string): BigInteger {
    this.checks({I, P}, true);
    // console.log('js salt:', this.s, 'js i:', I, 'js p:', P);
		const _h = Base.trimLeadingZeros(this.H(`${I}:${P}`));
		const hash = Base.trimLeadingZeros(this.H(`${this.s}${_h}`.toUpperCase()));
		return Base.fromHex(hash).mod(this.N);
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
		const formArr: any = new FormData(Base.checkForm(form));
		const formRes: any = {};
		for (let pair of formArr) { formRes[pair[0]] = pair[1] }
		const { password, ...shared } = formRes;
		if (delPW) { form.querySelector('[name="password"]')['value'] = '' }
		if (!shared.identity || shared.identity.length < 2 ||
		shared.identity.length > 64 || !password) {
			throw new Error(Errors.FormAttributes);
		}
		return { shared, secret: { password }, toJSON: () => JSON.stringify(shared) }
	}
}

import {
	BrowserRegister, BrowserChallenge, BrowserLogin, SupportedRFC5054Bits,
	SharedSRP, SharedChallengeResponse, SharedLoginResponse
} from './interfaces';
import { BigInteger } from 'jsbn';
import { Base, Errors } from './Base';
type Identity = string;
type Password = string;

// browserify --standalone SRP -r ./dist/framework/PAKE/SRP/Browser.js
// \ -o ./dist/framework/PAKE/SRP/browser.bundle.js
export class Browser extends Base {
	private a = null; // client private key
	private u = null; // blended public keys
	private M1 = null;// password proof
	protected s: string = null; // salt

  constructor(_SRP: SupportedRFC5054Bits = 4096) {
    super(_SRP);
  }

	static register(form: HTMLFormElement, customSRPgroup: SupportedRFC5054Bits = 4096) {
		const { shared, secret } = Browser.formResult(form);
		let Client = new Browser(customSRPgroup);
		const parameters = JSON.stringify(Client.register(shared.identity, secret.password));
		(<HTMLInputElement>form.querySelector('[name="credentials"]')).value = parameters;
		Client = null;
		form.submit();
	}
	static login(form: HTMLFormElement, challengePath: string = form.action) {
		const { shared, secret } = Browser.formResult(form);
		const cData: BrowserChallenge = {
			I: Browser.hash(shared.identity),
			action: Base.ACTIONS.R_SRP_AUTH
		};
		Browser.send(challengePath, cData, shared, function(res: SharedChallengeResponse) {
			const client = new Browser(res.group);
			const lData = client.login(res, secret.password);
			Browser.send(form.action, lData, shared, (res: SharedLoginResponse) => {
				const vData = client.evidence.call(client, res);
				Browser.send(form.action, vData, shared, (res: any) => {
					console.log('FINAL', res)
				})
			})
		})
	}

	register(identity: Identity, P: Password): BrowserRegister {
		if(!!this.state) { throw new Error(Errors.IllegalStateException) }
		const action = Base.ACTIONS.R_REGISTER;
		const I = this.H(identity);
		this.put({I, P, s: this.generateRandomSalt(), state: action});
		const {s, group} = this;
		return this.registerResult({ I, identity, group, action, s, v: this.makeV() });
	}
	/** challenge
	 * Records the identity 'I' and password 'P' of the authenticating user.
	 * The session is incremented to {@link State#STEP1}.
	 * <p>Argument origin:
	 * <ul><li>From user: user identity 'I' and password 'P'.</li></ul>
	 * @param userID   The user identity 'I', UTF-8 encoded. Must not be {@code null} or empty.
	 * @param password The user password 'P', UTF-8 encoded. Must not be {@code null}.
	 * @throws IllegalStateException If the method is invoked in a state
	 *                               other than {@link State#INIT}.
	 */
	login(res: SharedChallengeResponse, P: Password): BrowserLogin {
		const { I } = res;
		if(!!this.state) { throw new Error(Errors.IllegalStateException) }
  	// console.log('login', I, '-', 'N:', this.N, 'g:', this.g, 'k:', this.k);
  	this.checks({I, P}, true) && this.put({I, P, state: Base.ACTIONS.R_SRP_AUTH});
		const result = this.crypto(res);
		return this.loginResult(result);
	}
	protected registerResult(res: BrowserRegister) { return res }
	protected loginResult(res: BrowserLogin) { return res }

  /** crypto
   * Receives the password salt 's' and public value 'B' from the server.
   * SRP-6a crypto parameters are set. The session is incremented to {@link State#STEP2}.
   * <p>Argument origin:
   * <ul>
   *   <li>From server: password salt 's', public value 'B'.
   *   <li>Pre-agreed: crypto parameters prime 'N', generator 'g' and hash function 'H'.
   * </ul>
   * @param s		The password salt 's' as a hex string. Must not be {@code null}.
   * @param B		The public server value 'B' as a hex string. Must not be {@code null}.
   * @param k   k is H(N,g) with padding by the server. Must not be {@code null}.
   * @return  	The client credentials consisting of the client public key
   *						'A' and the client evidence message 'M1'.
   * @throws IllegalStateException If the method is invoked in a state
   *                               other than {@link State#STEP1}.
   * @throws SRP6Exception         If the public server value 'B' is invalid.
   */
  private crypto(res: SharedChallengeResponse): BrowserLogin {
  	// console.log('crypto -', 's:', s, 'B:', B);
  	if (this.state !== Base.ACTIONS.R_SRP_AUTH) { throw new Error(Errors.IllegalStateException) }
		const action = Base.ACTIONS.R_SRP_EVIDENCE;
		const { B, s } = res;
		this.checks({s, B});
		this.put({s, B: Base.fromHex(B), a: this.randomA(s), state: action });
		this.checkAB('B');
  	this.generateX(this.I, this.P);
		this.put({P: null, A: this.g.modPow(this.a, this.N)});
		this.checkAB('A');
  	this.u = this.computeU(this.A.toString(16), B);
  	this.S = this.setSessionKey(this.x);
  	this.check(this.S, 'S');
  	const [A, S] = [ Base.toHex(this.A), Base.toHex(this.S)];
  	let M1 = Base.trimLeadingZeros(this.H(A+B+S));
  	this.check(M1, 'M1');
		this.M1 = M1;
  	return this.cryptoResult({ I: this.I, A, M1, action, token: res.token });
	}
	protected cryptoResult(res: BrowserLogin) { return res }

	/** evidence
	 * Receives the server evidence message 'M1'. The session is incremented
	 * to {@link State#STEP3}.
	 *
	 * <p>Argument origin:
	 * <ul>
	 *     <li>From server: evidence message 'M2'.
	 * </ul>
	 * @param M2 The server evidence message 'M2' as string. Must not be {@code null}.
	 * @throws IllegalStateException If the method is invoked in a state
	 *                               other than {@link State#STEP2}.
	 * @throws SRP6Exception         If the session has timed out or the
	 *                               server evidence message 'M2' is
	 *                               invalid.
	 */
	private evidence(res: SharedLoginResponse) {
		let { M2, token } = res;
		this.check(M2, 'M2');
		if (this.state !== Base.ACTIONS.R_SRP_EVIDENCE) { throw new Error(Errors.IllegalStateException) }

		const k = this.getSessionSecret(this.s);
console.log('encrypt token', token, 's', this.s);
		token = this.encrypt('token', k);
console.log('token:', token);
		const action = Base.ACTIONS.R_SRP_VERIFY;
		const computedM2 = this.H(Base.toHex(this.A)+this.M1+Base.toHex(this.S));
		if (`${Base.trimLeadingZeros(computedM2)}` !== M2) {
			throw new Error(Errors.SRP6ExceptionCredentials)
		} // console.log('jsServerM2:' + M2); console.log('jsClientM2:' + computedM2);
		this.put({M2, state: action});

		return { I: this.I, action, token };
	}

  /* CLIENTSIDE FUNCTIONS */
  /*
   * Generates a new salt 's'.
   *
   * @param opionalServerSalt An optional server salt which is hashed into a locally
   * generated random number. Can be left undefined when calling this function.
   * @return 's' Salt as hex-string of length driven by the bit size of hash-algorithm 'H'.
   */
  private generateRandomSalt(optionalServerSalt: string = 's') {
  	return this.H(`${new Date()}:${optionalServerSalt}:${Base.randomByteHex()}`)
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
  private makeV(I: string = this.I, P: string = this.P) {
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
	private generateX(I: string, P: string): BigInteger {
    this.checks({I, P}, true);
    // console.log('js salt:', this.s, 'js i:', I, 'js p:', P);
		const _h = Base.trimLeadingZeros(this.H(`${I}:${P}`));
		const hash = Base.trimLeadingZeros(this.H(`${this.s}${_h}`.toUpperCase()));
		this.x = Base.fromHex(hash).mod(this.N);
		return this.x;
	}
	/**
	 * Computes the session key S = (B - k * g^x) ^ (a + u * x) (mod N)
	 * from client-side parameters. <p>Specification: RFC 5054</p>
	 *
	 * @param N The constant group parameter prime 'N'.
	 * @param g The constant group parameter generator 'g'.
	 * @param k The constant group parameter SRP-6a multiplier 'k'.
	 * @param x The 'x' value, see {@link #computeX}. Must not be {@code null}.
	 * @param u The random scrambling parameter 'u'. Must not be {@code null}.
	 * @param a The clients private value 'a'. Must not be {@code null}.
	 * @param B The servers public value 'B'. Must not be {@code null}.
	 *
	 * @return The resulting session key 'S'.
	 */
	private setSessionKey(x: any, k = this.k, u = this.u, a = this.a, B = this.B) {
		this.checks({k, x, u, a, B});
		const exp = u.multiply(x).add(a);
		const tmp = this.g.modPow(x, this.N).multiply(k);
		return B.subtract(tmp).modPow(exp, this.N);
	}
	/**
	 * Generate a random value in the range `[1,N)` using a minimum of 256 random bits.
	 *
	 * See specification RFC 5054.
	 */
	private randomA(s: string) {
		const numBits = Math.max(256, this.N.bitLength()+8);
		const r = `${Base.randomByteHex(numBits)}${s}${(new Date()).getTime()}`;
		const Bi = Base.BigInteger(Base.randomByteHex(numBits), 16);
		const rBi = Base.BigInteger(this.H(r), 16);
		return (rBi.add(Bi)).mod(this.N)
	}

	static send(path: string, data: BrowserLogin|BrowserChallenge, pub: SharedSRP, cb: Function) {
		const { _csrf = '' } = pub;
		const req = new XMLHttpRequest();
		req.addEventListener('load', function() {
			if (this.readyState !== 4 || this.status !== 200) { return }
			cb.call(this, JSON.parse(this.responseText))
		});
		req.open('POST', path, true);
		req.setRequestHeader('Content-type', 'application/x-www-form-urlencoded');
		req.setRequestHeader('CSRF-Token', _csrf || '');
		req.send(`credentials=${JSON.stringify(data)}`);
	}
}

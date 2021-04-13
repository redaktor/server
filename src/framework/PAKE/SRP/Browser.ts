import {
	BrowserRegister, BrowserChallenge, BrowserLogin, BrowserToken,
	SharedSRP, SharedChallengeResponse, SharedLoginResponse, SharedVerifyResponse,
	SupportedRFC5054Bits
} from './interfaces';
import url from '../../url';
import { Base, Errors } from './Base';
type Identity = string;
type Password = string;
type StatusFn = (s: string, percent: number) => any;

// browserify --standalone SRP -r ./dist/framework/PAKE/SRP/Browser.js
// \ -o ./dist/framework/PAKE/SRP/browser.bundle.js
export class Browser extends Base {
	// add event listeners for forms with data-action
	static addEventListeners = true;
	//private worker = new Worker('worker.js');
	private a = null; // client private key
	private u = null; // blended public keys
	private M1 = null;// password proof
	protected s: string = null; // salt

  constructor(_SRP: SupportedRFC5054Bits = 4096) {
    super(_SRP);
  }
	static status(s: string) { console.log(s) }

	static register(form:HTMLFormElement, publicRsaKey:any, SRPgroup:SupportedRFC5054Bits = 4096) {
		const { shared, secret } = Browser.formResult(form);
		if (!shared.hasOwnProperty('_key') || !shared._key) { throw new Error(Errors.FormAttributes) }
		const Client = new Browser(SRPgroup);
		const rData = Client.register(shared.identity, secret.password, publicRsaKey);

		Browser.send(form.action, rData, shared, ((r) => r), function(res: Partial<BrowserRegister>) {
			if (!res.href) { throw new Error(Errors.SRP6ExceptionCredentials) }
			//status('Decryption OK: You are logged in!', 100);
			if (typeof window !== 'undefined') { window.location.href = res.href }
		})
		//(<HTMLInputElement>form.querySelector('[name="credentials"]')).value = parameters;
		//Client = null;
		//form.submit();
	}

	static login(form: HTMLFormElement, publicRsaKey:any, statusFn: StatusFn = Browser.status) {
		const { shared, secret } = Browser.formResult(form);

		const status = (s: string, percent: number) => {
			try {
				statusFn(s, percent);
			} catch (e) {
				throw new Error(`${Errors.StatusFnException}: ${JSON.stringify(e)}`);
			}
		}
		try {
			status('Trust: Got Token. Received JWT.', 10);
			const I = this.encryptRSA(shared.identity, publicRsaKey);
			const resI = { I: shared.identity };
			const cData: BrowserChallenge = { I, action: Base.ACTION.R_SRP_AUTH };
			status('Authentication: Starting an anonymous challenge.', 20);
			Browser.send(form.action, cData, shared, status, function(res: SharedChallengeResponse) {
				const client = new Browser(res.group);
				const lData = {...client.login({...res, ...resI}, secret.password), I};
				status('Sending anonymous credentials & public key.', 32);
				Browser.send(form.action, lData, shared, status, function(res: SharedLoginResponse) {
					const vData = {...client.evidence({...res, ...resI}), I};
					status('Evidence: Starting shared key proof.', 48);
					Browser.send(form.action, vData, shared, status, function(res: SharedVerifyResponse) {
						status('Verified the key proof. Got a shared secret key.', 64);
						const {U, ...idData} = {...client.verify({...res, ...resI}), I};
						status('LogIn: Exchanging encrypted messages now.', 80);
						Browser.send(U, idData, shared, status, function(res: any) {
							if (!res.href) { throw new Error(Errors.SRP6ExceptionCredentials) }
							status('Decryption OK: You are logged in!', 100);
							if (typeof window !== 'undefined') { window.location.href = res.href }
						})
						//if (typeof callback === 'function') { callback(idData.I) }
					})
				})
			})
		} catch(e) {
			status(e, -1)
		}
	}

	register(identity: Identity, P: Password, publicRsaKey:any): BrowserRegister {
		if(!!this.state) { throw new Error(Errors.IllegalStateException) }
		const action = Base.ACTION.R_REGISTER;
		const I = this.encryptRSA(identity, publicRsaKey);
		this.put({ s: this.generateRandomSalt(), state: action });
		const {s, group} = this;
		return this.registerResult({ I, group, action, s, v: this.makeV(identity, P) });
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
  	this.checks({I, P}, true) && this.put({I, P, state: Base.ACTION.R_SRP_AUTH});
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
  	if (this.state !== Base.ACTION.R_SRP_AUTH) { throw new Error(Errors.IllegalStateException) }
		const action = Base.ACTION.R_SRP_EVIDENCE;
		const { B, s } = res;
		this.checks({s, B});
		this.put({s, B: Base.fromHex(B), a: this.randomA(s), state: action });
		this.checkAB('B');
  	const x = this.generateX(this.I, this.P);
		this.put({P: null, A: this.g.modPow(this.a, this.N)});
		this.checkAB('A');
  	this.u = this.computeU(this.A.toString(16), B);
  	this.S = this.setSessionKey(x);
  	this.check(this.S, 'S');
  	const [A, S] = [ Base.toHex(this.A), Base.toHex(this.S)];
  	let M1 = Base.trimLeadingZeros(this.H(A+B+S));
  	this.check(M1, 'M1');
		this.M1 = M1;
  	return this.cryptoResult({ I: this.I, A, M1, action, t: res.t });
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
		let { M2, t } = res;
		this.check(M2, 'M2');
		if (this.state !== Base.ACTION.R_SRP_EVIDENCE) { throw new Error(Errors.IllegalStateException) }
		t = this.encrypt(t, this.getSessionSecret(this.s));
		const action = Base.ACTION.R_SRP_VERIFY;
		const computedM2 = this.H(Base.toHex(this.A)+this.M1+Base.toHex(this.S));
		if (`${Base.trimLeadingZeros(computedM2)}` !== M2) {
			throw new Error(Errors.SRP6ExceptionCredentials)
		} // console.log('jsServerM2:' + M2); console.log('jsClientM2:' + computedM2);
		this.put({M2, state: action});

		return { I: this.I, action, t };
	}

	private verify(res: SharedVerifyResponse) {
		if (res.action !== Base.ACTION.R_ID_TOKEN) { throw new Error(Errors.IllegalStateException) }
		const key = this.getSessionSecret(this.s);
		console.log(key);
		const idURL = this.decrypt(res.id, key);
		const u = url.parse(idURL);
		if (u.origin !== 'id://') { throw new Error(Errors.SRP6ExceptionCredentials) }
		let [U, I, t] = [u.searchParams.get('u'), u.searchParams.get('I'), u.searchParams.get('t')];
		t = this.encrypt(t, key);
		return { U, action: Base.ACTION.R_ID_TOKEN, I, t };
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

	private static send(
		path: string,
		data: Partial<BrowserRegister>|BrowserChallenge|BrowserLogin|BrowserToken,
		pub: SharedSRP,
		errCB: StatusFn,
		cb: Function
	) {
		const { _csrf = '' } = pub;
		try {
			const req = new XMLHttpRequest();
			req.addEventListener('load', function() {
				if (this.readyState !== 4 || this.status !== 200) { return }
				cb.call(this, JSON.parse(this.responseText))
			});
			req.addEventListener("error", function(e: any) {
				const err = `${path} - Request ${e.type}: ${e.loaded} bytes transferred\n`;
				errCB(err, -1);
				throw new Error(`${Errors.RequestException} ${err}`)
			});
			req.open('POST', path, true);
			req.setRequestHeader('Content-type', 'application/x-www-form-urlencoded');
			req.setRequestHeader('CSRF-Token', typeof _csrf !== 'undefined' ? _csrf : '');
			req.send(`credentials=${JSON.stringify(data)}`);
		} catch(err) {
			errCB(err, -1);
			throw new Error(Errors.RequestException)
		}
	}
}
if (typeof window !== 'undefined' && Browser.addEventListeners === true) {
	function getBtn(action: string): HTMLButtonElement {
		return document.querySelector(`form[data-action="${action}"] button[type="submit"]`) ||
			<any>{}
	}
	function getPublicKey(action: string) { return Browser.forge.pki.publicKeyFromPem(
		(<any>document.querySelector(`form[data-action="${action}"] *[name="_key"]`)).value
	)}
	window.addEventListener("load", function addListener() {
	  window.removeEventListener("load", addListener, false);
		const register: HTMLFormElement = document.querySelector('form[data-action="REGISTER"]');
		const login: HTMLFormElement = document.querySelector('form[data-action="LOGIN"]');
		if (!!register) {
			register.addEventListener('submit', function srpRegisterSubmit(evt){
			  evt.preventDefault();
				window.removeEventListener("submit", srpRegisterSubmit, false);
				getBtn('REGISTER').disabled = true;
				Browser.register(register, getPublicKey('REGISTER'))
			});
		}
		if (!!login) {
			login.addEventListener('submit', function srpLoginSubmit(evt){
			  evt.preventDefault();
				window.removeEventListener("submit", srpLoginSubmit, false);
				getBtn('LOGIN').disabled = true;
				Browser.login(login, getPublicKey('LOGIN'))
			})
		}
	}, false);
}

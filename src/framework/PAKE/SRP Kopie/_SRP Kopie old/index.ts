import {
	FormFields, ChallengeState, ChallengeResponse, LoginState, LoginResponse,
	VerifyState, VerifyResponse, SupportedRFC5054Bits, SupportedHashAlgo
} from './interfaces';
import { md, random, util } from 'node-forge';
import { BigInteger } from 'jsbn';
import jwt from '../../JSON/webtoken';
import uuid from '../../uuid';
import { saslprep } from '../saslprep';
import { Base } from './Base';
import { HASH } from './constants';
export const ServerErrors = {
	IllegalStateException: `IllegalStateException, wrong server state`,
	IllegalActionException: `IllegalActionException, wrong server action`,
	SRP6ExceptionCredentials: `SRP6Exception Bad client credentials`
}

type GenericState = LoginState | ChallengeState | VerifyState;
type GenericResponse = LoginResponse | ChallengeResponse | VerifyResponse;
// browserify --standalone SRP -r ./dist/framework/PAKE/Server.js -o ./dist/framework/PAKE/SRP_browser.js
// alternative OPAQUE, s
// https://blog.cryptographyengineering.com/2018/10/19/lets-talk-about-pake/
export class Server extends Base {
	protected randomFn = Server.randomByteHex;
	protected s: BigInteger = null; // salt
	private b: BigInteger = null; // server private key

  constructor(group: SupportedRFC5054Bits = 4096, hash: SupportedHashAlgo = 'SHA512') {
    super(group, hash);

  }
	static challenge(state: ChallengeState, serverLoginSecret: string): ChallengeResponse {
		const server = new Server(state.group);
		return server.challenge(state, serverLoginSecret);
	}
	challenge(state: ChallengeState, serverLoginSecret: string): ChallengeResponse {
		const shared = this.step1(state, serverLoginSecret);
		const __b = { ...state, b: Base.toHex(this.b) };
		return class ChallengeRes {
			static get shared() {  return shared }
			static get secret() { return __b }
			static toJSON() { return JSON.stringify(shared) }
		}
	}
	static login(state: LoginState, serverLoginSecret: string): GenericResponse {
		const server = new Server(state.group);
		return server.login(state, serverLoginSecret);
	}
	login(state: GenericState, serverLoginSecret: string): GenericResponse {
		if (state.action === Base.ACTIONS.R_SRP_AUTH) {
			return this.challenge(<ChallengeState>state, serverLoginSecret)
		} else if (state.action === Base.ACTIONS.R_SRP_VERIFY) {
			return this.verify(<VerifyState>state, serverLoginSecret);
		}
		console.log('EVIDENCE state', state);
		this.fromPrivateStoreState(state);
		const shared = this.step2(state);
		const __k = {
			s: state.s,
			key: this.getSessionSecret(state.s),
			action: Base.ACTIONS.R_SRP_EVIDENCE
		};
		return class LoginRes {
			static get shared() { return shared }
			static get secret() { return __k }
			static toJSON() { return JSON.stringify(shared) }
		}
	}
	static verify(state: VerifyState, serverLoginSecret: string): VerifyResponse {
		const server = new Server(state.group);
		return server.verify(state, serverLoginSecret);
	}
	verify(state: VerifyState, serverLoginSecret: string): VerifyResponse {
		this.fromPrivateStoreState(state);
		console.log('VERIFY state', state);
		const { token, key } = state;
		const decryptedToken = this.decrypt(token, key);
		console.log('VERIFY decrypted TOKEN', decryptedToken);
		// TODO signature, expires
		return { shared: { action: Base.ACTIONS.R_SRP_VERIFY }, secret: { token: '' }, toJSON: () =>{ return ''} }
	}

	static isHex(v: string) { return !isNaN(Number('0x' + v)) }
	static parseJSON(json: string, additionalFields: FormFields = {}) {
	  if (!json || typeof json !== 'string' || json.length > 30036) { return false }
	  const o = JSON.parse(json);
		const { I, action } = o;
		if (!I || !(action in Base.ACTIONS)) { return false }
		const allowed = {I:0, _csrf:0, identity: 1, s:1, v:1, A:1, M1:1, group:1, token:0};
	  let res = true;
	  for (let k in o) {
			if (k === 'action') { continue }
			const v = o[k];
			const allow = typeof v === 'string' && allowed.hasOwnProperty(k) &&
				(allowed[k] === 0 || Server.isHex(v));
	    if (!allow) {
				const allowByUser = additionalFields.hasOwnProperty(action) &&
					typeof additionalFields[action][k] === 'function' &&
					!!additionalFields[action][k](o[k]);
				if (!allowByUser) {
		      console.log('Not allowed', k, o[k]);
		      break
				}
	    }
	  }
	  return !!res ? o : false
	}

  private fromPrivateStoreState(obj: any) {
    this.I = obj.I;
    this.v = Base.fromHex(obj.v);
    this.s = Base.fromHex(obj.s);
    this.b = Base.fromHex(obj.b);
		this.B = this.g.modPow(this.b, this.N).add(this.v.multiply(this.k)).mod(this.N);
		this.checkAB('B');
    this.state = Base.ACTIONS.R_SRP_AUTH;
  }

  /** step1
   */
  private step1(state: ChallengeState, serverLoginSecret = '') {
		if (!!this.state) { throw new Error(ServerErrors.IllegalStateException) }
		const { I, s, v, group } = state;
  	this.checks({I, v, s}, true) && this.put({I, v: Base.fromHex(v), s: Base.fromHex(s) });
		this.b = this.randomB();
    this.B = this.g.modPow(this.b, this.N).add(this.v.multiply(this.k)).mod(this.N);
		this.checkAB('B');
  	this.state = Base.ACTIONS.R_SRP_EVIDENCE;
		const loginSecret = saslprep(serverLoginSecret);
		const iat = Date.now();
		const token = /*`${this.I}#` +*/ jwt.encode({
			iss: `redaktor`,
			iat, // issued at
			exp: (iat + (5 * 60 * 1000)), // expires in 5 minutes
			nonce: this.I // value used to associate a Client session with an ID Token
		}, loginSecret)
		return { I: this.I, B: Base.toHex(this.B), token, action: this.state, s, group }
  }

  /** step2
   * Increments this SRP-6a authentication session to
   * {@link State#STEP_2}.
   *
   * <p>Argument origin:
   *
   * <ul>
   *     <li>From client: public value 'A' and evidence message 'M1'.
   * </ul>
   *
   * @param A  The client public value. Must not be {@code null}.
   * @param M1 The client evidence message. Must not be {@code null}.
   *
   * @return The server evidence message 'M2'.
   *
   * @throws SRP6Exception If the session has timed out, the client public
   *                       value 'A' is invalid or the user credentials
   *                       are invalid.
   *
   * @throws IllegalStateException If the method is invoked in a state
   *                               other than {@link State#STEP_1}.
   */
  private step2(state: LoginState)  {
		const { I, token } = state;
  	if (this.state !== Base.ACTIONS.R_SRP_AUTH) {
  		throw new Error(ServerErrors.IllegalStateException);
  	}
		const { A: AHex, M1: M1client } = state;
	  this.checks({AHex, M1client}, true);
		const [A, BHex] = [Base.fromHex(AHex),Base.toHex(this.B)];
		this.A = A;
		this.checkAB('A');
    const u = this.computeU(AHex, BHex);
    this.S = this.v.modPow(u, this.N).multiply(A).modPow(this.b, this.N);
		const SHex = Base.toHex(this.S);
    const M1 = Base.trimLeadingZeros(this.H(`${AHex}${BHex}${SHex}`));
    this.checks({M1}, true);
    if (M1client !== M1) { throw new Error(ServerErrors.SRP6ExceptionCredentials) }
		this.M2 = Base.trimLeadingZeros(this.H(`${AHex}${M1}${SHex}`));
		const action = Base.ACTIONS.R_SRP_VERIFY;
console.log('!KEY', this.getSessionSecret())
    return { I, token, M2: this.M2, action };
  }


	/** nodeJS overwrites */
	protected H(...strings: (string|number)[]) {
		const hash = md[HASH[`${this.hash}`]].create();
		strings.forEach(s => hash.update(`${s}`));
		return hash.digest().toHex();
	}
	static hash(...strings: (string|number)[]) {
		const hash = md.sha512.create();
		strings.forEach(s => hash.update(`${s}`));
		return hash.digest().toHex();
	}
	static hashedUUID(...strings: (string|number)[]) {
		return uuid(Server.hash(...strings))
	}
	static randomByteHex(hexLength = 16) {
		let bytesSync = random.getBytesSync(hexLength);
		const rndHex = util.binary.hex.encode(bytesSync);
		return rndHex
	}
	/** <--- nodeJS overwrites */

  /**
   * Generate a random value in the range `[1,N)` using a minimum of 256 random bits.
   *
   * See specification RFC 5054.
   */
  private randomB() {
    const numBits = Math.max(256, this.N.bitLength()+8);
		const r = `${Server.randomByteHex(numBits)}${this.s}${(new Date()).getTime()}`;
    const Bi = Server.BigInteger(Server.randomByteHex(numBits), 16);
		const rBi = Server.BigInteger(this.H(r), 16);
		return (rBi.add(Bi)).mod(this.N)
  }
}

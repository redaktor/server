import {
	FormFields, SupportedRFC5054Bits, SupportedHashAlgo,
	ChallengeState, SharedChallengeResponse, ChallengeResponse,
	LoginState, SharedLoginResponse, LoginResponse,
	VerifyState, SharedVerifyResponse, VerifyResponse
} from './interfaces';
import * as fs from 'fs';
import * as path from 'path';
import * as nodeForge from 'node-forge';
import { BigInteger } from 'jsbn';
import jwt from '../../JSON/webtoken/index';
import uuid from '../../uuid';
import { saslprep } from '../saslprep/index';
//import { Setup } from '../CLI';
import { PrivateKey, Base } from './Base';
Base.forge = nodeForge;
const { md, random, util } = Base.forge;
import { HASH } from './constants';
export const ServerErrors = {
	IllegalStateException: `IllegalStateException, wrong server state`,
	IllegalActionException: `IllegalActionException, wrong server action`,
	SRP6ExceptionCredentials: `SRP6Exception Bad client credentials`,
	SRP6ExceptionToken: `SRP6Exception Bad token`,
	SRP6TimedOut: `SRP6Exception Session timed out`,
}

/* TODO : jwt AND uuid */

type GenericState = LoginState | ChallengeState | VerifyState;
type GenericResponse = LoginResponse | ChallengeResponse | VerifyResponse;
interface Keys { public: string; private: string; }
type PemP = { public: string; private: string; }
type KeysCallback = (e: Error, keypair?: {server?: PemP, client?: PemP}) => any;
// browserify --standalone SRP -r ./dist/framework/PAKE/Server.js -o ./dist/framework/PAKE/SRP_browser.js
// alternative OPAQUE, s
// https://blog.cryptographyengineering.com/2018/10/19/lets-talk-about-pake/
export class Server extends Base {
	protected randomFn = Server.randomByteHex;
	protected randomBytes = Server.randomBytes;
	protected s: BigInteger = null; // salt
	private b: BigInteger = null; // server private key
	private i: string = null; // server private id token

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
		if (!state.action || state.action === Base.ACTION.R_SRP_AUTH) {
			return this.challenge(<ChallengeState>state, serverLoginSecret)
		} else if (state.action === Base.ACTION.R_SRP_VERIFY) {
			return this.verify(<VerifyState>state, serverLoginSecret);
		}
		const shared = this.step2(state);
		const __k = {
			...state,
			key: this.getSessionSecret(state.s),
			action: Base.ACTION.R_SRP_EVIDENCE
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
		const shared = this.step3(state, serverLoginSecret);
		const __v = {
				...state,
			 i: this.i
		};
		return class VerifyRes {
			static get shared() { return shared }
			static get secret() { return __v }
			static toJSON() { return JSON.stringify(shared) }
		}
	}

	static authorize(me: any, token: string, serverLoginSecret: string) {
		try {
			const { identity, key } = me;
			const server = new Server();
			const idToken = jwt.decode(server.decrypt(token, key), serverLoginSecret);
			Server.verifyToken(me, idToken);
			//['s','v','b','i'].forEach((k) => { delete me[k] });
			idToken.identity = identity;
			const shared = { t: server.encrypt(jwt.encode(idToken, serverLoginSecret), key) }
			return class TokenRes {
				static get shared() { return shared }
				static get secret() { return me }
				static toJSON() { return JSON.stringify(shared) }
			}
			//{...me, action: Base.ACTION.R_LOGGED_IN}
		} catch (e) {
			throw new Error(ServerErrors.SRP6ExceptionToken)
		}
	}
	static verifyToken(me: any, token: any) {
		const { I, i } = me;
		if (token.iss !== 'redaktor' || token.nonce !== I) {
			throw new Error(ServerErrors.SRP6ExceptionToken)
		} else if (Date.now() > token.exp) {
			throw new Error(ServerErrors.SRP6TimedOut)
		} else if (token.aud !== i) {
			throw new Error(ServerErrors.SRP6ExceptionToken)
		}
		return true
	}

  /** step1
   */
  private step1(state: ChallengeState, serverLoginSecret = ''): SharedChallengeResponse {
		if (!!this.state) { throw new Error(ServerErrors.IllegalStateException) }
		const { I, s, v, group } = state;
  	this.checks({I, v, s}, true) && this.put({I, v: Base.fromHex(v), s: Base.fromHex(s) });
		this.b = this.randomB();
    this.B = this.g.modPow(this.b, this.N).add(this.v.multiply(this.k)).mod(this.N);
		this.checkAB('B');
  	this.state = Base.ACTION.R_SRP_EVIDENCE;
		const loginSecret = saslprep(serverLoginSecret);
		const iat = Date.now();
		const t = jwt.encode({
			iss: `redaktor`,
			iat, // issued at
			exp: (iat + (5 * 60 * 1000)), // expires in 5 minutes
			nonce: this.I // value used to associate a Client session with an ID Token
		}, loginSecret);
		return { I: this.I, B: Base.toHex(this.B), t, action: this.state, s, group }
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
  private step2(state: LoginState): SharedLoginResponse  {
		this.fromPrivateStoreState(state);
		const { I, t } = state;
  	if (this.state !== Base.ACTION.R_SRP_AUTH) {
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
		const action = Base.ACTION.R_SRP_VERIFY;
    return { I, t, M2: this.M2, action };
  }

	/** step3
   */
	private step3(state: VerifyState, serverLoginSecret = ''): SharedVerifyResponse {
	  this.fromPrivateStoreState(state);
	  let { t, key } = state;
	  t = this.decrypt(t, key);
	  const loginToken = jwt.decode(t, serverLoginSecret);
	  this.i = Server.randomByteHex(32);
	  loginToken.aud = this.i;
	  t = jwt.encode(loginToken, serverLoginSecret);
	  const action = Base.ACTION.R_ID_TOKEN;
	  return {action, id: this.encrypt(`id:?u=${'/token'}&I=${this.I}&t=${t}`, key)}
	}

	private fromPrivateStoreState(obj: any) {
		this.I = obj.I;
		this.v = Base.fromHex(obj.v);
		this.s = Base.fromHex(obj.s);
		this.b = Base.fromHex(obj.b);
		this.B = this.g.modPow(this.b, this.N).add(this.v.multiply(this.k)).mod(this.N);
		this.checkAB('B');
		this.state = Base.ACTION.R_SRP_AUTH;
	}
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

	static isHex(v: string) { return !isNaN(Number('0x' + v)) }
	static parseJSON(json: string, serverPrivateKey: PrivateKey, additionalFields: FormFields = {}) {
	  if (!json || typeof json !== 'string' || json.length > 30036) { return false }
	  const o = JSON.parse(json);
		const { I, action } = o;
		if (!I || typeof I!=='string' || !(action in Base.ACTION)) {
			console.log('"I" is not a string or "action" is invalid.', o);
			throw new Error(ServerErrors.SRP6ExceptionCredentials)
		}
		const allowed = {I:0, _csrf:0, s:1, v:1, A:1, M1:1, group:1, t:0};
		const identity = Server.decryptRSA(I, serverPrivateKey);
	  let res = true;
	  for (let k in o) {
			if (k === 'action') { continue }
			const v = o[k];
			let allow = typeof v === 'string' && allowed.hasOwnProperty(k) &&
				(allowed[k] === 0 || Server.isHex(v));
	    if (!allow) {
				const allowByUser = additionalFields.hasOwnProperty(action);
				if (allowByUser) {
					allow = typeof additionalFields[k] === 'function' && !!additionalFields[k](o[k]) ||
						!!additionalFields[k];
				}
				if (!allow) {
		      console.log('Not allowed', k, o[k]);
					throw new Error(ServerErrors.SRP6ExceptionCredentials)
				}
	    }
	  }
	  return !!res ? {...o, identity} : false
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
	static randomBytes(byteLength = 16) {
		return random.getBytesSync(byteLength);
	}
	static randomByteHex(hexLength = 16) {
		let bytesSync = random.getBytesSync(hexLength);
		const rndHex = util.binary.hex.encode(bytesSync);
		return rndHex
	}
	static createKeys(cb: any) {
	  Base.forge.pki.rsa.generateKeyPair({bits: 2048, workers: 2}, cb);
	}
	static writeKey(dirname: string | null, direction: string, type: string, o: any) {
		const { pki } = Base.forge;
		const k = o[`${type}Key`]
	  const PEM = type === 'public' ? pki.publicKeyToPem(k) : pki.privateKeyToPem(k);
	  !!dirname && fs.writeFileSync(path.join(dirname, `/${direction}.${type}.pem`), PEM, 'utf8');
		return PEM
	}
	static writeKeys(dirname: string, direction: string, o: any) {
		return {
			public: Server.writeKey(dirname, direction, 'public', o),
			private: Server.writeKey(dirname, direction, 'private', o)
		}
	}
	static getKeys(dirname: string | null, cb: KeysCallback) {
		let error = null;
	  if (!dirname || !fs.existsSync(path.join(dirname, '/server.public.pem'))) {
			!!dirname && fs.mkdirSync(dirname, { recursive: true });
	    Server.createKeys((err: Error, server: any) => {
	      if (err) { error = err }
	      Server.createKeys((err: Error, client: any) => {
	        if (err) { error = err }
					server = Server.writeKeys(dirname, 'server', server);
					client = Server.writeKeys(dirname, 'client', client);
	        cb(error, { server, client })
	      })
	    })
	  } else {
			try {
		    const keys: any = ['server', 'client'].reduce((o, k) => {
		      ['public', 'private'].forEach((t) => {
		        o[k][t] = fs.readFileSync(path.join(dirname, `/${k}.${t}.pem`), 'utf8');
		      })
		      return o
		    }, { server:{public:'', private:''}, client:{public:'', private:''} });
				cb(error, keys)
			} catch(err) {
				cb(err)
			}
	  }
	}
	static initKeys(o: Keys) {
		return {
	  	public: Base.forge.pki.publicKeyFromPem(o.public),
	  	private: Base.forge.pki.privateKeyFromPem(o.private)
		}
	}

	static async getCredentials(appEnv?: string) {
		try {
			let cType = process.env.SRP_type;
			if (!cType || cType !== 'SRP_CREDENTIALS') { throw('No credentials given.') }
		} catch(e) {
			const { Setup } = require('../CLI');
			await (new Setup()).run(appEnv);
		}
		return true
	}
	/* TODO : jwt AND uuid	*/
	/** <--- nodeJS overwrites */
}

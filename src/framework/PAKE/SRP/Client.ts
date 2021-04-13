import {
	BrowserRegister, BrowserChallenge, BrowserLogin, BrowserToken,
	SharedSRP, SharedChallengeResponse, SharedLoginResponse, SharedVerifyResponse,
	SupportedRFC5054Bits
} from './interfaces';
type Identity = string;
type Password = string;
import { Base } from './Base';
import { Server } from './';

export class Client extends Server {
	protected x: any = null; // salted hashed password

	register(identity: Identity, P: Password, publicRsaKey:any): BrowserRegister {
		const action = Base.ACTION.R_REGISTER;
		const I = this.encryptRSA(identity, publicRsaKey);
		this.put({ s: Server.randomByteHex(), state: action });
		const {s, group} = this;
		return { I, group, action, s: s.toString(), v: this.makeV(identity, P) };
	}


}

// Shared
import { ACTION, SRP, HASH } from './constants';
export type Action = keyof typeof ACTION;
export type SupportedRFC5054Bits = keyof typeof SRP | 1024 | 1536 | 2048 | 3072 | 4096;
export type SupportedHashAlgo = keyof typeof HASH;

// Browser
export interface SharedSRP {
	identity?: string;
	password?: string;
	credentials?: string;
	_csrf?: string;
	_key?: string;
}
export interface PrivateSRP {
	password: string;
}
export interface SRPFORM {
	shared: SharedSRP;
	secret?: PrivateSRP;
	toJSON: () => string;
}
export interface BrowserRegister {
	I: string;
	s: string;
	v: string;
	group: SupportedRFC5054Bits;
	action: ACTION.R_REGISTER;
	href?: string;
}
export interface BrowserChallenge {
	I: string;
	action: ACTION.R_SRP_AUTH;
}
export interface BrowserToken {
	I: string;
	t: string;
}
export interface BrowserLogin {
	I: string;
	A: string;
	M1: string;
	t: string;
	action: ACTION.R_SRP_EVIDENCE;
}
export interface BrowserEvidence {
	I: string;
	t: string;
	action: ACTION.R_SRP_EVIDENCE;
}
// Server
interface FormFieldObject {
	[k: string]: (value: any) => boolean
}

/* R_REGISTER R_SRP_AUTH R_SRP_EVIDENCE R_ID_TOKEN */
export interface FormFields {
	[k: Action]: FormFieldObject
}
// Server Challenge
export interface ChallengeState {
	I: string;
	v: string;
	s: string;
	group: SupportedRFC5054Bits;
	action: ACTION.R_SRP_AUTH;
}
export interface SharedChallengeResponse {
	I: string;
	B: string;
	s: string;
	t: string;
	group: SupportedRFC5054Bits;
	action: ACTION.R_SRP_EVIDENCE;
}
export interface PrivateChallengeResponse extends ChallengeState {
	b: string;
}
export interface ChallengeResponse {
	shared: SharedChallengeResponse;
	secret: PrivateChallengeResponse;
	toJSON: () => string;
}
// Server Log In
export interface LoginState {
	I: string;
	A: string;
	M1: string;
	v: string;
	s: string;
	b: string;
	t: string;
	group?: SupportedRFC5054Bits;
	action: ACTION.R_SRP_AUTH | ACTION.R_SRP_EVIDENCE | ACTION.R_SRP_VERIFY /* evt. redirect */;
}
export interface SharedLoginResponse { I: string; M2: string; action: any; t?: string; };
export interface SecretLoginResponse { key: string; };
export interface LoginResponse {
	shared: SharedLoginResponse;
	secret: SecretLoginResponse;
	toJSON: () => string;
}
// Verify and Token Exchange
export interface VerifyState {
	group?: SupportedRFC5054Bits;
	action: ACTION.R_SRP_VERIFY;
	key: string;
	t?: string;
}
type TokenState = LoginState & VerifyState;
export interface SharedVerifyResponse { action: ACTION.R_ID_TOKEN; id: string; };
export interface SecretVerifyResponse { i: string; };
export interface VerifyResponse {
	shared: SharedVerifyResponse;
	secret: SecretVerifyResponse;
	toJSON: () => string;
}

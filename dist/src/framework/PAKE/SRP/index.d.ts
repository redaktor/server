import { FormFields, ChallengeState, ChallengeResponse, LoginState, LoginResponse, SupportedRFC5054Bits, SupportedHashAlgo } from './interfaces';
import { BigInteger } from 'jsbn';
import { Base } from './Base';
import { ACTIONS } from './constants';
export declare const ServerErrors: {
    IllegalStateException: string;
    IllegalActionException: string;
    SRP6ExceptionCredentials: string;
};
export declare class Server extends Base {
    private b;
    protected s: BigInteger;
    constructor(_SRP?: SupportedRFC5054Bits, _HASH?: SupportedHashAlgo);
    static ACTIONS: typeof ACTIONS;
    static challenge(challengeState: ChallengeState): ChallengeResponse;
    challenge(challengeState: ChallengeState): ChallengeResponse;
    static login(state: LoginState): LoginResponse;
    login(state: LoginState): LoginResponse;
    static isHex(v: string): boolean;
    static parseJSON(json: string, additionalFields?: FormFields): any;
    private fromPrivateStoreState;
    private step1;
    private step2;
    protected H(...strings: (string | number)[]): any;
    static randomByteHex(hexLength?: number): string;
    private randomB;
}

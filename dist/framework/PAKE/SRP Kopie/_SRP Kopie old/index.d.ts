import { FormFields, ChallengeState, ChallengeResponse, LoginState, LoginResponse, VerifyState, VerifyResponse, SupportedRFC5054Bits, SupportedHashAlgo } from './interfaces';
import { BigInteger } from 'jsbn';
import { Base } from './Base';
export declare const ServerErrors: {
    IllegalStateException: string;
    IllegalActionException: string;
    SRP6ExceptionCredentials: string;
};
declare type GenericState = LoginState | ChallengeState | VerifyState;
declare type GenericResponse = LoginResponse | ChallengeResponse | VerifyResponse;
export declare class Server extends Base {
    protected randomFn: typeof Server.randomByteHex;
    protected s: BigInteger;
    private b;
    constructor(group?: SupportedRFC5054Bits, hash?: SupportedHashAlgo);
    static challenge(state: ChallengeState, serverLoginSecret: string): ChallengeResponse;
    challenge(state: ChallengeState, serverLoginSecret: string): ChallengeResponse;
    static login(state: LoginState, serverLoginSecret: string): GenericResponse;
    login(state: GenericState, serverLoginSecret: string): GenericResponse;
    static verify(state: VerifyState, serverLoginSecret: string): VerifyResponse;
    verify(state: VerifyState, serverLoginSecret: string): VerifyResponse;
    static isHex(v: string): boolean;
    static parseJSON(json: string, additionalFields?: FormFields): any;
    private fromPrivateStoreState;
    private step1;
    private step2;
    protected H(...strings: (string | number)[]): any;
    static hash(...strings: (string | number)[]): string;
    static hashedUUID(...strings: (string | number)[]): any;
    static randomByteHex(hexLength?: number): string;
    private randomB;
}
export {};

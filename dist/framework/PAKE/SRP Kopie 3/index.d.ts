import { FormFields, SupportedRFC5054Bits, SupportedHashAlgo, ChallengeState, ChallengeResponse, LoginState, LoginResponse, VerifyState, VerifyResponse } from './interfaces';
import { BigInteger } from 'jsbn';
import { Base } from './Base';
export declare const ServerErrors: {
    IllegalStateException: string;
    IllegalActionException: string;
    SRP6ExceptionCredentials: string;
    SRP6ExceptionToken: string;
    SRP6TimedOut: string;
};
declare type GenericState = LoginState | ChallengeState | VerifyState;
declare type GenericResponse = LoginResponse | ChallengeResponse | VerifyResponse;
export declare class Server extends Base {
    protected randomFn: typeof Server.randomByteHex;
    protected randomBytes: typeof Server.randomBytes;
    protected s: BigInteger;
    private b;
    private i;
    constructor(group?: SupportedRFC5054Bits, hash?: SupportedHashAlgo);
    static challenge(state: ChallengeState, serverLoginSecret: string): ChallengeResponse;
    challenge(state: ChallengeState, serverLoginSecret: string): ChallengeResponse;
    static login(state: LoginState, serverLoginSecret: string): GenericResponse;
    login(state: GenericState, serverLoginSecret: string): GenericResponse;
    static verify(state: VerifyState, serverLoginSecret: string): VerifyResponse;
    verify(state: VerifyState, serverLoginSecret: string): VerifyResponse;
    static verifyToken(me: any, token: any): boolean;
    static authorize(me: any, token: string, serverLoginSecret: string): {
        new (): {};
        readonly shared: {
            t: string;
        };
        readonly secret: any;
        toJSON(): string;
    };
    static isAuthorizedFn(serverLoginSecret: string): (o: any) => boolean;
    private step1;
    private step2;
    private step3;
    private fromPrivateStoreState;
    protected H(...strings: (string | number)[]): any;
    static hash(...strings: (string | number)[]): string;
    static hashedUUID(...strings: (string | number)[]): string;
    static randomBytes(byteLength?: number): string;
    static randomByteHex(hexLength?: number): string;
    private randomB;
    static isHex(v: string): boolean;
    static parseJSON(json: string, additionalFields?: FormFields): any;
}
export {};

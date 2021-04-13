import { FormFields, SupportedRFC5054Bits, SupportedHashAlgo, ChallengeState, ChallengeResponse, LoginState, LoginResponse, VerifyState, VerifyResponse } from './interfaces';
import * as nodeForge from 'node-forge';
import { BigInteger } from 'jsbn';
import { PrivateKey, Base } from './Base';
export declare const ServerErrors: {
    IllegalStateException: string;
    IllegalActionException: string;
    SRP6ExceptionCredentials: string;
    SRP6ExceptionToken: string;
    SRP6TimedOut: string;
};
declare type GenericState = LoginState | ChallengeState | VerifyState;
declare type GenericResponse = LoginResponse | ChallengeResponse | VerifyResponse;
interface Keys {
    public: string;
    private: string;
}
declare type PemP = {
    public: string;
    private: string;
};
declare type KeysCallback = (e: Error, keypair?: {
    server?: PemP;
    client?: PemP;
}) => any;
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
    static authorize(me: any, token: string, serverLoginSecret: string): {
        new (): {};
        readonly shared: {
            t: string;
        };
        readonly secret: any;
        toJSON(): string;
    };
    static verifyToken(me: any, token: any): boolean;
    private step1;
    private step2;
    private step3;
    private fromPrivateStoreState;
    private randomB;
    static isHex(v: string): boolean;
    static parseJSON(json: string, serverPrivateKey: PrivateKey, additionalFields?: FormFields): any;
    protected H(...strings: (string | number)[]): any;
    static hash(...strings: (string | number)[]): string;
    static hashedUUID(...strings: (string | number)[]): string;
    static randomBytes(byteLength?: number): string;
    static randomByteHex(hexLength?: number): string;
    static createKeys(cb: any): void;
    static writeKey(dirname: string | null, direction: string, type: string, o: any): string;
    static writeKeys(dirname: string, direction: string, o: any): {
        public: string;
        private: string;
    };
    static getKeys(dirname: string | null, cb: KeysCallback): void;
    static initKeys(o: Keys): {
        public: nodeForge.pki.PublicKey;
        private: nodeForge.pki.PrivateKey;
    };
    static getCredentials(appEnv?: string): Promise<boolean>;
}
export {};

import { BrowserRegister, BrowserLogin, SharedChallengeResponse, SupportedRFC5054Bits } from './interfaces';
import { Base } from './Base';
declare type Identity = string;
declare type Password = string;
declare type StatusFn = (s: string, percent: number) => any;
export declare class Browser extends Base {
    static addEventListeners: boolean;
    private a;
    private u;
    private M1;
    protected s: string;
    constructor(_SRP?: SupportedRFC5054Bits);
    static status(s: string): void;
    static register(form: HTMLFormElement, publicRsaKey: any, SRPgroup?: SupportedRFC5054Bits): void;
    static login(form: HTMLFormElement, publicRsaKey: any, statusFn?: StatusFn): void;
    register(identity: Identity, P: Password, publicRsaKey: any): BrowserRegister;
    login(res: SharedChallengeResponse, P: Password): BrowserLogin;
    protected registerResult(res: BrowserRegister): BrowserRegister;
    protected loginResult(res: BrowserLogin): BrowserLogin;
    private crypto;
    protected cryptoResult(res: BrowserLogin): BrowserLogin;
    private evidence;
    private verify;
    private generateRandomSalt;
    private setSessionKey;
    private randomA;
    private static send;
}
export {};

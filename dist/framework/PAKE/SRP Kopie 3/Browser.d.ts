import { BrowserRegister, BrowserChallenge, BrowserLogin, BrowserToken, SharedSRP, SharedChallengeResponse, SupportedRFC5054Bits } from './interfaces';
import { Base } from './Base';
declare type Identity = string;
declare type Password = string;
export declare class Browser extends Base {
    private a;
    private u;
    private M1;
    protected s: string;
    constructor(_SRP?: SupportedRFC5054Bits);
    static register(form: HTMLFormElement, customSRPgroup?: SupportedRFC5054Bits): void;
    static login(form: HTMLFormElement, status: any): void;
    register(identity: Identity, P: Password): BrowserRegister;
    login(res: SharedChallengeResponse, P: Password): BrowserLogin;
    protected registerResult(res: BrowserRegister): BrowserRegister;
    protected loginResult(res: BrowserLogin): BrowserLogin;
    private crypto;
    protected cryptoResult(res: BrowserLogin): BrowserLogin;
    private evidence;
    private verify;
    private generateRandomSalt;
    private makeV;
    private generateX;
    private setSessionKey;
    private randomA;
    static send(path: string, data: BrowserChallenge | BrowserLogin | BrowserToken, pub: SharedSRP, cb: Function): void;
}
export {};

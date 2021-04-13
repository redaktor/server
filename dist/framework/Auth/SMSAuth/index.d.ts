import AuthBase from '../';
declare class SMSAuth extends AuthBase {
    protected authUrl?: string | any;
    protected callbackUrl?: string;
    protected key?: string;
    protected secret?: string;
    protected scope?: string;
    text: string;
    private _E;
    debug: boolean;
    protected _protocol: string;
    protected _version: string;
    protected _type: string;
    constructor(authUrl?: string | any, callbackUrl?: string, key?: string, secret?: string, scope?: string, text?: string);
    initSMSAuth(): void;
    auth(req: any, res: any, kwArgs?: any): void;
    access(req: any, res: any): any;
}
export default SMSAuth;

import AuthBase from '../';
declare class GPGAuth extends AuthBase {
    private clientSecret?;
    protected validity: number;
    protected _nonceSize: number;
    protected renderForm: boolean;
    protected iss: string;
    debug: boolean;
    protected _protocol: string;
    protected _version: string;
    protected _type: string;
    constructor(clientSecret?: string | any, validity?: number, _nonceSize?: number, renderForm?: boolean, iss?: string);
    initGPGAuth(): void;
    options(o?: any): any;
    protected challenge(o?: any): any;
    protected verify(o?: any): Promise<unknown>;
    success(o: any, cb?: string): any;
    auth(req?: any, res?: any, kwArgs?: any): Promise<any>;
    access(req?: any, res?: any, kwArgs?: any): Promise<unknown>;
}
export default GPGAuth;

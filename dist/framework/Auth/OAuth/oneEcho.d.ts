import { OAuthArgs, OAuth1Options } from './interfaces';
import OAuthOne from './one';
export declare class OAuthEcho extends OAuthOne {
    private realm;
    private verify_credentials?;
    protected _type: any;
    protected _authKey: string;
    constructor(realm: OAuth1Options | string, verify_credentials?: string, ...args: any[]);
    get _headerPrefix(): string;
    protected _getOAuthParams(kwArgs: OAuthArgs): any;
}
export default OAuthEcho;

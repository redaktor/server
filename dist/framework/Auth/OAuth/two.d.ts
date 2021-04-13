import { OAuthArgs, OAuth2Options } from './interfaces';
import AuthBase from '..';
declare class OAuthTwoClient extends AuthBase {
    protected authUrl: OAuth2Options | string;
    protected accessUrl?: string;
    protected callbackUrl?: string;
    protected scope?: string;
    protected clientId?: string;
    protected clientSecret?: string;
    protected _nonceSize: number;
    protected implicit: boolean;
    verify: any;
    protected _protocol: string;
    protected _version: string;
    protected _headerPrefix: string;
    protected authOptions: any;
    protected accessOptions: any;
    protected accessTokenName: string;
    get user(): string;
    set user(user: string);
    get password(): string;
    set password(pw: string);
    constructor(authUrl: OAuth2Options | string, accessUrl?: string, callbackUrl?: string, scope?: string, clientId?: string, clientSecret?: string, _nonceSize?: number, implicit?: boolean, verify?: any);
    _init(): void;
    initOAuthTwo(): void;
    type(t?: string): string | (this & {
        _type: string;
    });
    protected getAuthHeader(kwArgs: OAuthArgs | string): string;
    initOAuth2(o?: any): any;
    rewrite(o?: any): any;
    react(o: any): any;
    success(o?: any, req?: any, res?: any, finish?: boolean): Promise<unknown>;
    auth(req?: any, res?: any, kwArgs?: any): Promise<unknown>;
    access(req?: any, res?: any, kwArgs?: any): Promise<unknown>;
}
export default OAuthTwoClient;

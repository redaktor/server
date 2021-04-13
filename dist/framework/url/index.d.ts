import { UrlSearchParams } from './UrlSearchParams';
export declare class Parameters extends UrlSearchParams {
    constructor(input?: any);
    get(this: any, key?: string): any;
}
declare class url {
    static protocolPattern: RegExp;
    static defaultProtocolPattern: RegExp;
    static hostlessProtocol: {
        'javascript': boolean;
        'javascript:': boolean;
    };
    static slashedProtocol: {
        'http': boolean;
        'https': boolean;
        'ftp': boolean;
        'gopher': boolean;
        'file': boolean;
    };
    static format(urlAny: any | string): any;
    static parse(urlStr: string, parseQuery?: boolean, slashesDenoteHost?: boolean): any;
    static parameters(input?: any): any;
    static withParameters(baseUrl: string | any, queryObj: any): any;
    static concat(baseUrl: string, path: string): string;
    static resolve(from: string, to: string): any;
    static resolveRelative(mainUrl: string, u: string): any;
    static normalizeUrl(u: any, inclQuery?: boolean, defaultProtocol?: string, forceProtocol?: boolean): string;
    static hasIdentical(urls: string | string[], myUrl: string): boolean;
}
export default url;

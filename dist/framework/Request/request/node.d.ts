import { RequestOptions, ResponsePromise } from '../request';
import WritableStream from '../streams/WritableStream';
export interface NodeRequestOptions<T> extends RequestOptions {
    agent?: any;
    ca?: any;
    cert?: string;
    ciphers?: string;
    followRedirects?: boolean;
    key?: string;
    localAddress?: string;
    maxRedirects?: number;
    passphrase?: string;
    pfx?: any;
    proxy?: string;
    redirects?: string[];
    rejectUnauthorized?: boolean;
    secureProtocol?: string;
    socketPath?: string;
    socketOptions?: {
        keepAlive?: number;
        noDelay?: boolean;
        timeout?: number;
    };
    streamData?: boolean;
    streamEncoding?: string;
    streamTarget?: WritableStream<T>;
    url?: string;
    id?: string;
}
export default function node<T>(url: string, options?: NodeRequestOptions<T>): ResponsePromise<T>;

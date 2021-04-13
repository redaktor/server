/// <reference types="node" />
import * as EventEmitter from 'events';
import * as Puppeteer from 'Puppeteer';
export interface ServerProperties extends Puppeteer.LaunchOptions {
    depthPriority?: boolean;
    customCrawl?: (page: any, crawl: Function) => any;
    onSuccess?: (result: FetchResponse) => void;
    onError?: (error: Error) => void;
}
export interface FetchProperties extends RequestInit {
    body?: BodyInit | NodeJS.ReadableStream | null;
    cache?: RequestCache;
    credentials?: RequestCredentials;
    headers?: HeadersInit;
    integrity?: string;
    keepalive?: boolean;
    method?: string;
    mode?: RequestMode;
    redirect?: RequestRedirect;
    referrer?: string;
    referrerPolicy?: ReferrerPolicy;
    signal?: any;
    window?: any;
    agent: any;
    compress: boolean;
    follow: number;
    isRobot: boolean;
    timeout: number;
    size: number;
    skipDuplicates?: boolean;
    priority?: number;
    preRequest?: (options: FetchProperties) => any;
    retryCount?: number;
    retryDelay?: number;
    server?: ServerProperties | null;
}
export interface FetchResponse extends Response {
}
export default class F extends EventEmitter {
    options: any;
    private _browser;
    private _options;
    private _cache;
    private _queue;
    private _exporter;
    private _preRequest;
    private _requestedCount;
    private _onSuccess;
    private _onError;
    private _customCrawl;
    static Events: {
        RequestStarted: string;
        RequestSkipped: string;
        RequestDisallowed: string;
        RequestFinished: string;
        RequestRetried: string;
        RequestFailed: string;
        RobotsTxtRequestFailed: string;
        SitemapXmlRequestFailed: string;
        MaxDepthReached: string;
        MaxRequestReached: string;
        Disconnected: string;
    };
    protected fetchFn: any;
    protected isHeadless: boolean;
    constructor(options: any, _browser: Puppeteer.Browser, _options?: any, _cache?: any, _queue?: any, _exporter?: any, _preRequest?: any, _requestedCount?: number, _onSuccess?: any, _onError?: any, _customCrawl?: any);
    protected fetch(options: any): Promise<void>;
}

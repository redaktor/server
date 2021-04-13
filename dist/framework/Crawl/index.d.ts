/// <reference types="node" />
import * as Puppeteer from 'puppeteer';
import * as EventEmitter from 'events';
declare const devices: any;
export interface CrawlerHeaders {
    [key: string]: string;
}
export interface CrawlerCookies {
    name: string;
    value: string;
    url?: string;
    domain?: string;
    path?: string;
    expires?: number;
    httpOnly?: boolean;
    secure?: boolean;
    sameSite?: string;
}
export interface CrawlerViewport {
    width: number;
    height: number;
    deviceScaleFactor?: number;
    isMobile?: boolean;
    hasTouch?: boolean;
    isLandscape?: boolean;
}
export interface CrawlerScreenshotClip {
    x: number;
    y: number;
    width: number;
    height: number;
}
export interface CrawlerScreenshot {
    path?: string;
    type?: string;
    quality?: number;
    fullPage?: boolean;
    clip?: CrawlerScreenshotClip;
    omitBackground?: boolean;
    encoding?: string;
}
export interface CrawlerWait {
    selectorOrFunctionOrTimeout: string | number | Function;
    options?: Puppeteer.WaitForSelectorOptions;
    args?: string[];
}
export interface CrawlerRedirectChain {
    url: string;
    headers: Object;
}
export interface CrawlerResponse {
    ok: boolean;
    status: string;
    url: string;
    headers: Object;
}
export interface CrawlerError {
    options: any;
    depth: number;
    previousUrl: string;
}
export interface CrawlerResult extends CrawlerError {
    redirectChain: CrawlerRedirectChain[];
    cookies: CrawlerCookies[];
    response: CrawlerResponse;
    result: any;
    screenshot: Buffer;
    links: string[];
}
export interface CrawlerLaunchProperties extends Puppeteer.LaunchOptions {
}
export interface CrawlerConnectProperties extends Puppeteer.ConnectOptions {
    maxConcurrency?: number;
    maxRequest?: number;
    exporter?: any | null;
    cache?: Cache;
    persistCache?: boolean;
    preRequest?: (options: CrawlerConnectProperties) => any;
    customCrawl?: (page: Puppeteer.Page, crawl: Function) => any;
    onSuccess?: (result: CrawlerResult) => void;
    onError?: (error: CrawlerError) => void;
}
declare type PuppeteerAll = CrawlerConnectProperties & CrawlerLaunchProperties;
export interface CrawlerProperties extends PuppeteerAll {
    url: string;
    maxDepth?: number;
    priority?: number;
    depthPriority?: boolean;
    skipDuplicates?: boolean;
    skipRequestedRedirect?: boolean;
    obeyRobotsTxt?: boolean;
    followSitemapXml?: boolean;
    allowedDomains?: (string | RegExp)[] | null;
    deniedDomains?: (string | RegExp)[] | null;
    delay?: number;
    timeout?: number;
    waitUntil?: Puppeteer.WaitForSelectorOptions;
    waitFor?: CrawlerWait;
    retryCount?: number;
    retryDelay?: number;
    jQuery?: boolean;
    browserCache?: boolean;
    device?: keyof typeof devices;
    username?: string | null;
    screenshot?: CrawlerScreenshot | null;
    viewport?: CrawlerViewport | null;
    password?: string | null;
    userAgent?: string;
    extraHeaders?: CrawlerHeaders;
    cookies?: CrawlerCookies[];
    evaluatePage?: any;
}
export default class HeadlessCrawler extends EventEmitter {
    options: CrawlerConnectProperties;
    protected _browser: Puppeteer.Browser;
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
    protected _defaultOptions: CrawlerProperties;
    constructor(options: CrawlerConnectProperties, _browser: Puppeteer.Browser, _options?: any, _cache?: any, _queue?: any, _exporter?: any, _preRequest?: any, _requestedCount?: number, _onSuccess?: any, _onError?: any, _customCrawl?: any);
    static launch(options: CrawlerLaunchProperties & CrawlerProperties): Promise<HeadlessCrawler>;
    static connect(options: Puppeteer.ConnectOptions): Promise<HeadlessCrawler>;
    static executablePath(): string;
    static defaultArgs(): string[];
    init(): Promise<void>;
    queue(optionsOrURIs: string | any[]): Promise<void>;
    close(): Promise<void>;
    disconnect(): Promise<void>;
    version(): Promise<string>;
    userAgent(): Promise<string>;
    wsEndpoint(): string;
    onIdle(): Promise<void>;
    setMaxRequest(maxRequest: number): void;
    pause(): void;
    resume(): void;
    clearCache(): Promise<void>;
    isPaused(): any;
    queueSize(): any;
    pendingQueueSize(): any;
    requestedCount(): number;
    _newCrawler(options: any, depth: number, previousUrl: string): Promise<any>;
    _push(options: any, depth: number, previousUrl: string): Promise<void>;
    _startRequest(options: any, depth: number, previousUrl: string): Promise<void>;
    _skipRequest(options: any): Promise<boolean>;
    _request(options: any, depth: number, previousUrl: string, retryCount?: number): any;
    _checkAllowedRobots(options: any, depth: number, previousUrl: string): Promise<any>;
    _followSitemap(options: any, depth: number, previousUrl: string): Promise<void>;
    _getSitemapXml(sitemapUrl: string, options: any, depth: number, previousUrl: string): Promise<any>;
    _getRobot(options: any, depth: number, previousUrl: string): Promise<any>;
    _getUserAgent(options: any): Promise<any>;
    _checkAllowedDomains(options: any): boolean;
    _checkRequested(options: any): Promise<boolean>;
    _checkRequestedRedirect(options: any, response: any): Promise<boolean>;
    _markRequested(options: any): Promise<void>;
    _markRequestedRedirects(options: any, redirectChain: any, response: any): Promise<void>;
    _shouldRequest(options: any): Promise<any>;
    _success(result: any): Promise<void>;
    _error(error: Error): Promise<void>;
    _crawl(crawler: any): Promise<any>;
    _followLinks(urls: string[], options: any, depth: number): Promise<void>;
    _checkRequestCount(): void;
    _exportHeader(): void;
    _exportLine(res: any): void;
    _endExporter(): Promise<void>;
    _clearCacheOnEnd(): Promise<void>;
    _closeCache(): Promise<void>;
}
export {};

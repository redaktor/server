/// <reference types="node" />
import * as EventEmitter from 'events';
import * as Puppeteer from 'Puppeteer';
export default class Fetch extends EventEmitter {
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
    static fetch(options: any): Promise<void>;
}

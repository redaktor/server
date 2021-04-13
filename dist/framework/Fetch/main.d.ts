import { Url, FetchProperties } from './index';
export default class Fetch {
    options: FetchProperties;
    private errors;
    private _cache;
    private _queue;
    private _seen;
    protected fetchFn: any;
    protected isHeadless: boolean;
    constructor(options?: FetchProperties);
    fetch(url: Url, options?: FetchProperties): Promise<any>;
    private clientFetch;
}

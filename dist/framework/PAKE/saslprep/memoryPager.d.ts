export declare class Page {
    offset: number;
    buffer: Uint8Array;
    updated: boolean;
    deduplicate: number;
    constructor(i: number, buf: Uint8Array);
}
export interface PagerOptions {
    deduplicate?: Uint8Array;
}
export declare class Pager {
    readonly pageSize: number;
    maxPages: number;
    pages: Page[];
    length: number;
    level: number;
    private updates;
    private path;
    private deduplicate;
    private zeros;
    constructor(pageSize: number, opts?: PagerOptions);
    updated(page: Page): void;
    lastUpdate(): Page;
    get(i: number, noAllocate?: boolean): Page;
    set(i: number, buf: Uint8Array): void;
    toBuffer(): Uint8Array;
    private _array;
}

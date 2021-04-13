import Bitap, { BitapProperties, BitapResult } from './bitap';
declare type GetFn = (obj: any, path?: string | null, list?: any[]) => any[];
declare type SortFn = (a: SearchResult, b: SearchResult) => number;
interface AnalyzeOptions {
    key: string | undefined;
    arrayIndex?: number;
    index: number;
    value: string | string[];
    record: any;
}
interface AnalyzeSearchers {
    tokenSearchers: any[];
    fullSearcher: any;
    resultMap: any;
    results: any[];
}
export interface SearchProperties extends BitapProperties {
    id?: string | null;
    keys?: any[];
    shouldSort?: boolean;
    getFn?: GetFn | undefined;
    sortFn?: SortFn;
    tokenize?: boolean;
    matchAllTokens?: boolean;
    includeMatches?: boolean;
    includeScore?: boolean;
    verbose?: boolean;
}
export interface SearchResult extends BitapResult {
    matches: any[];
    item: any[];
    output: any;
}
export default class StringSearch {
    protected properties: SearchProperties;
    protected _list: string[];
    set collection(list: string[]);
    constructor(list: any[], options: SearchProperties);
    test(): Promise<void>;
    search(pattern: string): any[];
    _prepareSearchers(pattern?: string): {
        tokenSearchers: any[];
        fullSearcher: Bitap;
    };
    _search(fullSearcher: Bitap, tokenSearchers: any[]): {
        weights: any;
        results: any[];
    };
    _analyze(options: AnalyzeOptions, searchers: AnalyzeSearchers): void;
    _computeScore(weights: any[], results: SearchResult[]): void;
    _sort(results: SearchResult[]): void;
    _format(results: SearchResult[]): any[];
    _log(...args: any[]): void;
}
export {};

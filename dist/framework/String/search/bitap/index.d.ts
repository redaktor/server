export interface BitapProperties {
    location?: number;
    distance?: number;
    threshold?: number;
    maxPatternLength?: number;
    caseSensitive?: boolean;
    tokenSeparator?: RegExp;
    findAllMatches?: boolean;
    minMatchCharLength?: number;
}
export interface BitapResult {
    isMatch: boolean;
    score: number;
    matchedIndices: any[];
}
export declare const SPECIAL_CHARS_REGEX: RegExp;
export declare function regexSearch(text: string, pattern: string, tokenSeparator?: RegExp): {
    score: number;
    isMatch: boolean;
    matchedIndices: any[];
};
export declare function patternAlphabet(pattern: string): any;
export default class Bitap {
    protected properties: BitapProperties;
    private pattern;
    private patternAlphabet;
    constructor(pattern: string, options?: BitapProperties);
    search(text: string): {
        isMatch: boolean;
        score: number;
        matchedIndices: any[];
    };
}

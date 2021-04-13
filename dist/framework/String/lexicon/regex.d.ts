interface RegExps {
    [id: string]: RegExp;
}
interface SpecRegExp {
    reg: RegExp;
    str: string;
    tag: string | string[];
}
interface RegExpGroups {
    [id: string]: string[];
}
export declare const notRealWord: any;
export declare const regexps: RegExps;
export declare const regexpGroups: RegExpGroups;
export declare function itIs(s: string, rName?: string): boolean;
export declare function splitBy(s: string, rName?: string): string[];
export declare const replacers: any;
export declare const punctuationRegexps: SpecRegExp[];
export declare const suffixRegexps: any[];
export declare const emojiRegexp: RegExp;
export {};

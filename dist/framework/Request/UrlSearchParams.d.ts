export interface Hash<T> {
    [id: string]: T;
}
export declare type ParamList = Hash<string | string[]>;
export declare class UrlSearchParams {
    constructor(input?: string | ParamList | UrlSearchParams);
    protected readonly _list: Hash<string[] | undefined>;
    append(key: string, value: string): void;
    delete(key: string): void;
    get(key: string): string | undefined;
    getAll(key: string): string[] | undefined;
    has(key: string): boolean;
    keys(): string[];
    set(key: string, value: string): void;
    toString(): string;
}
export default UrlSearchParams;

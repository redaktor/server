import { PatchOptions } from './interfaces';
export declare type pointerCB = (v: any, pointer: string) => any;
export declare type _S = string | string[];
export declare class JSONpointer {
    protected root: any;
    protected options: PatchOptions;
    constructor(root?: any, options?: PatchOptions);
    tokens(pointer?: _S): string[];
    has(pointer: _S): boolean;
    get(pointer?: _S): any;
    set(pointer: _S, value: any, replacing?: boolean): this;
    remove(pointer: _S): any;
    dict(descend?: any): any;
    walk(iterator: pointerCB, descend?: any): boolean;
    compile(refTokens: string[]): string;
    escape(str: string): string;
    unescape(str: string): string;
    parse(pointer: string): string[];
}
export declare function escape(str: string): string;
export declare function unescape(str: string): string;
export declare function parse(pointer: string): string[];
declare function jsonpointer(obj: any, pointer: _S, value: any): JSONpointer;
declare function jsonpointer(obj: any, pointer: _S): any;
declare function jsonpointer(obj: any): JSONpointer;
export default jsonpointer;

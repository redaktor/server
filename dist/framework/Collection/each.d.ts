import { eachFN, eachCB, reduceCB } from '../core/interfaces';
export declare function pullAt(a: any, indexes: number[]): any[];
export declare const each: eachFN, every: eachFN, filter: eachFN, map: eachFN, partition: eachFN, reject: eachFN, some: eachFN;
export declare function reduce(a: any[], fn: reduceCB, accumulator: any, start?: number, end?: number, step?: number): any;
export declare function remove(a: any, fn: number | eachCB): any;
export declare function fromPairs(a: any[], r?: any): any;
export declare function fill(a: any[], value: any, start?: number, end?: number): any;
export declare function excludeFalsy(a: any[], ...b: any[]): any;
export declare function zipObject(a: any[], b: any[], o?: any): any;

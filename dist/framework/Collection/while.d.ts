import { eachCB } from '../core/interfaces';
export declare function find(a: any, fn: eachCB, start?: number, end?: number): any;
export declare function findLast(a: any, fn: eachCB, start?: number, end?: number): any;
export declare function findIndex(a: any, predicate: eachCB, start?: number, end?: number): any;
export declare function findLastIndex(a: any, predicate: eachCB, start?: number, end?: number): any;
export declare function dropWhile(a: any, predicate: eachCB, start?: number, end?: number): any;
export declare function dropLastWhile(a: any, predicate: eachCB, start?: number, end?: number): any;
export declare function takeWhile(a: any, predicate: eachCB, start?: number, end?: number): any;
export declare function takeLastWhile(a: any, predicate: eachCB, start?: number, end?: number): any;

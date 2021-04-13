import { eachCB, reduceCB, vCB } from '../core/interfaces';
import API from '../core';
export default class Collection extends API {
    protected _input: {};
    protected _options: any;
    constructor(_input?: {}, _options?: any);
    at(...paths: string[]): any[];
    count: (start?: number, end?: number, step?: number) => any;
    countBy: (fn: vCB, start?: number, end?: number, step?: number) => any;
    each: (iteratee: eachCB, start?: number, end?: number, step?: number) => this;
    every: (iteratee: eachCB, start?: number, end?: number, step?: number) => this;
    filter: (iteratee: eachCB, start?: number, end?: number, step?: number) => this;
    find: (fn: eachCB, start?: number, end?: number) => this;
    findLast: (fn: eachCB, start?: number, end?: number) => this;
    groupBy: (fn: vCB, start?: number, end?: number, step?: number) => this;
    includes: (...b: any[]) => this;
    invoke: (path: string | string[], fnName: string, ...args: any[]) => this;
    keyBy: (fn: vCB, start?: number, end?: number, step?: number) => this;
    map: (iteratee: eachCB, start?: number, end?: number, step?: number) => this;
    partition: (iteratee: eachCB, start?: number, end?: number, step?: number) => this;
    reduce: (iteratee: reduceCB, accumulator: any, start?: number, end?: number, step?: number) => this;
    reject: (iteratee: eachCB, start?: number, end?: number, step?: number) => this;
    sample: () => this;
    sampleSize: (size: number) => this;
    shuffle: () => this;
    some: (iteratee: eachCB, start?: number, end?: number, step?: number) => this;
}

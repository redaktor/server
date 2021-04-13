import { Iterable } from '@dojo/framework/shim/iterator';
import { Thenable } from '@dojo/framework/shim/interfaces';
export declare function every<T>(items: Iterable<T | Promise<T>> | (T | Promise<T>)[], callback: Filterer<T>): Promise<boolean>;
export declare function filter<T>(items: Iterable<T | Promise<T>> | (T | Promise<T>)[], callback: Filterer<T>): Promise<T[]>;
export declare function find<T>(items: Iterable<T | Promise<T>> | (T | Promise<T>)[], callback: Filterer<T>): Promise<T | undefined>;
export declare function findIndex<T>(items: Iterable<T | Promise<T>> | (T | Thenable<T>)[], callback: Filterer<T>): Promise<number>;
export declare function map<T, U>(items: Iterable<T | Promise<T>> | (T | Promise<T>)[], callback: Mapper<T, U>): Promise<U[] | null | undefined>;
export declare function reduce<T, U>(this: any, items: Iterable<T | Promise<T>> | (T | Promise<T>)[], callback: Reducer<T, U>, initialValue?: U): Promise<U>;
export declare function reduceRight<T, U>(this: any, items: Iterable<T | Promise<T>> | (T | Promise<T>)[], callback: Reducer<T, U>, initialValue?: U): Promise<U>;
export declare function series<T, U>(items: Iterable<T | Promise<T>> | (T | Promise<T>)[], operation: Mapper<T, U>): Promise<U[]>;
export declare function some<T>(items: Iterable<T | Promise<T>> | Array<T | Promise<T>>, callback: Filterer<T>): Promise<boolean>;
export interface Filterer<T> extends Mapper<T, boolean> {
}
export interface Mapper<T, U> {
    (value: T, index: number, array: T[]): U | Thenable<U>;
}
export interface Reducer<T, U> {
    (previousValue: U, currentValue: T, index: number, array: T[]): U | Thenable<U>;
}

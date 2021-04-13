import { Thenable } from '@dojo/framework/shim/interfaces';
import { Iterable } from '@dojo/framework/shim/iterator';
import { Executor } from '@dojo/framework/shim/Promise';
import '@dojo/framework/shim/Symbol';
export declare function unwrapPromises(iterable: Iterable<any> | any[]): any[];
export declare type DictionaryOfPromises<T> = {
    [_: string]: T | Promise<T> | Thenable<T>;
};
export declare type ListOfPromises<T> = Iterable<T | Thenable<T>>;
export declare class ExtensiblePromise<T> {
    static reject<T>(reason?: any): ExtensiblePromise<never>;
    static resolve<P extends ExtensiblePromise<void>>(): P;
    static resolve<T, P extends ExtensiblePromise<T>>(value: T | PromiseLike<T>): P;
    static all<T>(iterable: DictionaryOfPromises<T>): ExtensiblePromise<{
        [key: string]: T;
    }>;
    static all<T>(iterable: (T | Thenable<T>)[]): ExtensiblePromise<T[]>;
    static all<T>(iterable: T | Thenable<T>): ExtensiblePromise<T[]>;
    static all<T>(iterable: ListOfPromises<T>): ExtensiblePromise<T[]>;
    static race<T>(iterable: Iterable<T | PromiseLike<T>> | (T | PromiseLike<T>)[]): ExtensiblePromise<T>;
    readonly _promise: Promise<T>;
    constructor(executor: Executor<T>);
    catch<TResult = never>(onRejected?: ((reason: any) => TResult | PromiseLike<TResult>) | undefined | null): ExtensiblePromise<T | TResult>;
    then<TResult1 = T, TResult2 = never>(onFulfilled?: ((value: T) => TResult1 | PromiseLike<TResult1>) | undefined | null, onRejected?: ((reason: any) => TResult2 | PromiseLike<TResult2> | void) | undefined | null): ExtensiblePromise<TResult1 | TResult2>;
    readonly [Symbol.toStringTag]: 'Promise';
}
export default ExtensiblePromise;

import { Thenable } from '@dojo/framework/shim/interfaces';
import { Iterable } from '@dojo/framework/shim/iterator';
import { Executor } from '@dojo/framework/shim/Promise';
import ExtensiblePromise, { DictionaryOfPromises, ListOfPromises } from './ExtensiblePromise';
export declare const enum State {
    Fulfilled = 0,
    Pending = 1,
    Rejected = 2,
    Canceled = 3
}
export declare function isTask<T>(value: any): value is Task<T>;
export declare function isThenable<T>(value: any): value is Thenable<T>;
export declare class Task<T> extends ExtensiblePromise<T> {
    static race<T>(iterable: Iterable<T | Thenable<T>> | (T | Thenable<T>)[]): Task<T>;
    static reject<T>(reason?: Error): Task<T>;
    static resolve(): Task<void>;
    static resolve<T>(value: T | Thenable<T>): Task<T>;
    static all<T>(iterable: DictionaryOfPromises<T>): Task<{
        [key: string]: T;
    }>;
    static all<T>(iterable: (T | Thenable<T>)[]): Task<T[]>;
    static all<T>(iterable: T | Thenable<T>): Task<T[]>;
    static all<T>(iterable: ListOfPromises<T>): Task<T[]>;
    private canceler;
    private readonly children;
    private _finally;
    protected _state: State;
    get state(): State;
    constructor(executor: Executor<T>, canceler?: () => void);
    private _cancel;
    cancel(): void;
    catch<TResult = never>(onRejected?: ((reason: any) => TResult | PromiseLike<TResult>) | undefined): Task<T | TResult>;
    finally(callback: () => void): Task<T>;
    then<TResult1 = T, TResult2 = never>(onFulfilled?: ((value: T) => TResult1 | PromiseLike<TResult1>) | undefined | null, onRejected?: ((reason: any) => TResult2 | PromiseLike<TResult2>) | undefined | null): Task<TResult1 | TResult2>;
}
export default Task;

import Promise from './ExtensiblePromise';
import { Thenable } from '@dojo/framework/shim/interfaces';
export declare type IdentityValue<T> = T | (() => T | Thenable<T>);
export interface Identity<T> {
    (value?: IdentityValue<T>): Promise<T>;
}
export declare function delay<T>(milliseconds: number): Identity<T>;
export declare function timeout<T>(milliseconds: number, reason: Error): Identity<T>;
export declare class DelayedRejection extends Promise<any> {
    constructor(milliseconds: number, reason?: Error);
}

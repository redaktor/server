import { Strategy } from './interfaces';
export declare function getApproximateByteSize(object: any): number;
export declare function invokeOrNoop(O: any, P: string, args?: any[]): any;
export declare function normalizeStrategy<T>({ size, highWaterMark }: Strategy<T>): Strategy<T>;
export declare function promiseInvokeOrFallbackOrNoop(object: any, method1: string, args1: any[], method2: string, args2?: any[]): Promise<any>;
export declare function promiseInvokeOrNoop(O: any, P: string, args?: any[]): Promise<any>;

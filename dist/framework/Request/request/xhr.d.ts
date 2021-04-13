import { Handle } from '@dojo/framework/core/Destroyable';
import { RequestOptions, ResponsePromise } from '../request';
export declare function getStringFromFormData(formData: any): string;
export declare function createTimer(callback: (...args: any[]) => void, delay?: number): Handle;
export interface XhrRequestOptions extends RequestOptions {
    blockMainThread?: boolean;
}
export default function xhr<T>(url: string, options?: XhrRequestOptions): ResponsePromise<T>;

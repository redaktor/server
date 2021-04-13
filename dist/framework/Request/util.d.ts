import { Handle } from '@dojo/framework/core/Destroyable';
import { RequestOptions } from './request';
export declare function createHandle(destructor: () => void): Handle;
export declare function createCompositeHandle(...handles: Handle[]): Handle;
export declare function generateRequestUrl(url: string, options?: RequestOptions): string;
export declare function getStringFromFormData(formData: any): string;

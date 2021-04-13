import { Load } from '../load';
export interface LoadPlugin<T> {
    normalize?: (resourceId: string, resolver: (resourceId: string) => string) => string;
    load(resourceId: string, load: Load): Promise<T>;
}
export declare function isPlugin(value: any): value is LoadPlugin<any>;
export declare function useDefault(modules: any[]): any[];
export declare function useDefault(module: any): any;

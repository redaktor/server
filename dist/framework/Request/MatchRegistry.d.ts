import { Handle } from '@dojo/framework/core/Destroyable';
export declare class MatchRegistry<T> {
    protected _defaultValue: T | undefined;
    private readonly _entries;
    constructor(defaultValue?: T);
    match(...args: any[]): T;
    register(test: Test | null, value: T | null, first?: boolean): Handle;
}
export interface Test {
    (...args: any[]): boolean | null;
}
export default MatchRegistry;

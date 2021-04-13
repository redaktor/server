import jsonPointer from '../JSON/Pointer';
import wrap from './wrap';
interface strO {
    [key: string]: string;
}
interface APIINIT {
    readonly self?: strO;
    awaits?: strO;
    proxyHandler?: any;
}
export default class API {
    protected readonly _input: any;
    protected _options: any;
    pointer: typeof jsonPointer;
    isA: string;
    constructor(_input?: any, _options?: any, ...args: any[]);
    init(o: APIINIT): any;
    get options(): any;
    set options(o: any);
    get value(): any;
    get parent(): any;
    protected $load(m: string): Promise<any>;
    protected $fn(m: string | string[], ...args: any[]): Promise<any>;
    protected fn(m: string | string[]): (...args: any[]) => any;
    static options(defaultOptions?: any): <T extends new (...args: any[]) => {}>(constructor: T) => {
        new (...args: any[]): {
            isA: string;
        };
    } & T;
    static _: typeof wrap;
}
export {};

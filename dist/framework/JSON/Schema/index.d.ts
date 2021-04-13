import { REQ, RES, NEXT } from '../../Server/interfaces';
import Tv4async from './Tv4async';
declare class Schema extends Tv4async {
    protected schema: any;
    protected language: string;
    protected baseUrl: string;
    protected fixes: any;
    protected dereference: boolean;
    protected checkRecursive: boolean;
    protected banUnknown: boolean;
    protected useDefault: boolean;
    static fixes: any;
    promise: Promise<any>;
    constructor(schema: any, language?: string, baseUrl?: string, fixes?: any, dereference?: boolean, checkRecursive?: boolean, banUnknown?: boolean, useDefault?: boolean);
    protected init(): void;
    private _getProperty;
    protected _getCallerDir(): string;
    protected schemaErr(verb?: string, url?: string): (err: Error) => void;
    protected fromPath(schema: any, path: string): any;
    deref(): Promise<any>;
    getProperty(key: string, schemas?: any): any;
    coerce(data: any, customSchema: any): any;
    validate(data: any, multipleErr?: boolean): Promise<any>;
    validateRoute(req: REQ, res: RES, next: NEXT): any;
    route(router: any): this;
    static addFix(code: any, fixFunction: any): typeof Schema;
}
export default Schema;

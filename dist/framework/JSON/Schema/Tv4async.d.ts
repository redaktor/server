import RequestMixin from '../../Request/main';
import * as tv4 from 'tv4';
export interface TV4 extends tv4.TV4 {
    hasAsync: boolean;
    validate: any;
    syncValidate: any;
}
declare class Tv4async extends RequestMixin {
    static errorCodes: tv4.ErrorCodes;
    protected schemaUrl: string;
    protected baseUrl: string;
    protected schema: any;
    protected failed: any;
    tv4: TV4;
    constructor();
    protected _getUrl(u: string): string;
    static possibleSchemas(schema: any, dataPath: string): any[];
}
export default Tv4async;

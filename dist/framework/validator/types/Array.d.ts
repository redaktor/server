import Chain from './base';
import { TYPE_KEY } from '../constants';
interface _Array {
    [k: string]: any;
    typeName: 'array';
}
declare class _Array extends Chain<Array<any>> {
    [TYPE_KEY]: {
        type: string;
    };
    items(schemaOrSchemas: any | {}[]): this;
    additionalItems(schema: any): this;
    contains(...values: any[]): this;
    notContains(...values: any[]): this;
    containsSome(...values: any[]): this;
    unique(): this;
    notEmpty(): this;
    minSize(min: number): this;
    maxSize(max: number): this;
}
declare const _default: _Array;
export default _default;

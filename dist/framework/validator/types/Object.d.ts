import Chain from './base';
import { TYPE_KEY } from '../constants';
interface _Object {
    [k: string]: any;
    typeName: 'object';
}
declare class _Object extends Chain<any> {
    [TYPE_KEY]: {
        type: string;
    };
    propertyNames(stringSchema: any): this;
    minProperties(min: number): this;
    maxProperties(max: number): this;
    isRDFstring(): this;
}
declare const _default: _Object;
export default _default;

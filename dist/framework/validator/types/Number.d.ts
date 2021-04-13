import Chain from './base';
import { TYPE_KEY } from '../constants';
interface Number {
    [k: string]: any;
    typeName: 'number';
}
declare class Number extends Chain<number> {
    [TYPE_KEY]: {
        type: string;
    };
    isInt(): this;
    isInteger(): this;
    isDivisibleBy(num: number): this;
    isPositive(): this;
    isNegative(): this;
    min(min: number): this;
    max(max: number): this;
}
declare const _default: Number;
export default _default;

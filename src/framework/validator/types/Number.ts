import Chain from './base';
import { TYPE_KEY } from '../constants';
interface Number {[k: string]: any; typeName: 'number';}
class Number extends Chain<number> {
  [TYPE_KEY] = {type: 'number'};
  /** Checks if the value is an integer number. */
  isInt() { return this._({type: ['integer']}) }
  isInteger() { return this._({type: ['integer']}) }
  /** Checks if the value is a number that's divisible by another. */
  isDivisibleBy(num: number) { return this.T({multipleOf: num}) }
  /** Checks if the value is a positive number. */
  isPositive() { return this.T({exclusiveMinimum: 0}) }
  /** Checks if the value is a negative number. */
  isNegative() { return this.T({exclusiveMaximum: 0}) }
  /** Checks if the given number is greater than or equal to given number. */
  min(min: number) { return this.T({minimum: min}) }
  /** Checks if the given number is less than or equal to given number. */
  max(max: number) { return this.T({maximum: max}) }
}
export default new Number();

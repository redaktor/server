import Chain from './base';
import { TYPE_KEY, VALUE_KEY } from '../constants';
import { bcp47 } from '../../String/regex/regexStringFormats';
interface _Object {[k: string]: any; typeName: 'object';}
class _Object extends Chain<any> {
  [TYPE_KEY] = {type: 'object'};
  //o(_o: {}) { return () => ({ type: 'object', ..._o }) }
  /** Checks if given array is not empty. */
  propertyNames(stringSchema: any) {
    if (TYPE_KEY in stringSchema && VALUE_KEY in stringSchema) {
      return this.T({propertyNames: stringSchema[VALUE_KEY][0]})
    }
    return this.T({propertyNames: stringSchema})
  }
  /** Checks if its number of properties is greater than, or equal to this number */
  minProperties(min: number) { return this.T({minProperties: min}) }
  /** Checks if its number of properties is less than, or equal to this number */
  maxProperties(max: number) { return this.T({maxProperties: max}) }

  isRDFstring() {
    return this.T({
      propertyNames: {
        type: 'string',
        pattern: bcp47.toString().replace(/^[\\/]/,'').replace(/[\\/]$/,'')
      },
      patternProperties: {
        "^.*$": { type: 'string' }
      }
    });
  }
}
export default new _Object();

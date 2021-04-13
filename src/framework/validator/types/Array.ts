import Chain from './base';
import { TYPE_KEY, VALUE_KEY } from '../constants';
interface _Array {[k: string]: any; typeName: 'array';}
class _Array extends Chain<Array<any>> {
  [TYPE_KEY] = {type: 'array'};
  /**
  * MUST be either a valid JSON Schema or an array of valid JSON Schemas.
  * If "items" is a schema, validation succeeds if all elements in the array
  * successfully validate against that schema.
  * If "items" is an array of schemas, validation succeeds if each element
  * of the instance validates against the schema at the same position, if any.
  */
  items(schemaOrSchemas: any | {}[]) {
    if (TYPE_KEY in schemaOrSchemas && VALUE_KEY in schemaOrSchemas) {
      return this.T({items: schemaOrSchemas[VALUE_KEY][0]})
    }
    return this.T({items: schemaOrSchemas})
  }
  /**
  * MUST be a valid JSON Schema.
  * If property "items" is an array of schemas, validation succeeds if every
  * instance element at a position greater than the size of "items" validates
  * against "additionalItems".
  * Otherwise, "additionalItems" is ignored.
  */
  additionalItems(schema: any) {
    if (TYPE_KEY in schema && VALUE_KEY in schema) {
      return this.T({additionalItems: schema[VALUE_KEY][0]})
    }
    return this.T({additionalItems: schema})
  }
  /** Checks if array contains all values from the given array of values. */
  contains(...values: any[]) { return this.T({
    allOf: values.map((v) => ({contains: {const: typeof v === 'undefined' ? null : v}}))
  }) }
  /** Checks if array does not contain any of the given values. */
  notContains(...values: any[]) { return this.T({
    not: {enum: values.map((v) => typeof v === 'undefined' ? null : v)}
  }) }
  /** Checks if array contains any value from the given array of values. */
  containsSome(...values: any[]) { return this.T({
    contains: { enum: values.map((v) => (typeof v === 'undefined' ? null : v)) }
  }) }
  /** Checks if all array's values are unique. Comparison for objects is reference-based. */
  unique() { return this.T({uniqueItems: true}) }
  /** Checks if given array is not empty. */
  notEmpty() { return this.T({minItems: 0}) }
  /** Checks if array's length is as minimal this number. */
  minSize(min: number) { return this.T({minItems: min}) }
  /** Checks if array's length is as maximal this number. */
  maxSize(max: number) { return this.T({maxItems: max}) }
}
export default new _Array();

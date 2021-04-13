import { getSchema, toSchema } from './shared';
import Formats from './types/StringFormat';
import * as AJV from 'ajv';

interface NumberOptions {
  allowNaN?: boolean;
  allowInfinity?: boolean;
}
interface ErrorObject extends AJV.ErrorObject {
  parentSchema?: {[key: string]: any} | undefined;
}

/* TODO : coerce (e.g. const coerce + Dates), useDefaults, async */
const ajv = new AJV({useDefaults: true, jsonPointers: true, verbose: true});
let name: keyof typeof Formats;
for (name in Formats) { ajv.addFormat(name, Formats[name]) }

// TODO
function toDate(v: any) {
  return v instanceof Date && !isNaN(v.getTime()) ? v.toISOString() : void 0
}
const coerce: {[key: string]: Function} = {
  isDate: () => toDate,
  isTime: () => toDate,
  isDateTime: () => toDate,
  isNumber: (options: NumberOptions = {allowNaN: false, allowInfinity: false}) => (v: any) => {
    if (options.allowNaN) { return isNaN(v) ? 0 : v }
    if (options.allowInfinity) { return !isFinite(v) ? 0 : v }
    return v
  },
  noVoid: (...values: any[]) => values.map((v) => typeof v === 'undefined' ? null : v)
}

// export : see below
function errorJS(errors: ErrorObject[]) {
  return errors.map(err => { // TODO parameter name -> parentSchema.title AND stack
    const name = (err.parentSchema && typeof err.parentSchema.title === 'string') ?
      err.parentSchema.title : err.dataPath;
    return {
      ...err,
      name,
      text: `Parameter '${name}' ${err.message}`
    }
  })
}
export function Validator(errorFn: (errors: ErrorObject[]) => ErrorObject[] | void = errorJS) {
  return function validateDecorator(target: any, key: string | symbol, descriptor: PropertyDescriptor) {
    // save a reference to the original method this way we keep the values currently in the
    // descriptor and don't overwrite what another decorator might have done to the descriptor.
    if (descriptor === undefined) {
      descriptor = <PropertyDescriptor>Object.getOwnPropertyDescriptor(target, key);
    }
    const isMethod = descriptor.value instanceof Function;
    if (!isMethod) { return descriptor }
    const originalMethod = descriptor.value;

    const argSchema = Reflect.hasMetadata('schema', target, key) ?
      JSON.parse(Reflect.getMetadata('schema', target, key)) : {};

    const schemas = Reflect.getMetadata('design:paramtypes', target, key)
      .map((param: any, i: number) => {
        let schema: any = getSchema(param) || {};
        if (argSchema[i]) {
          schema = toSchema({...schema, ...argSchema[i]})
        }
        return schema
      });

    const schema = {type: 'array', items: schemas};
//console.log(JSON.stringify(schema));
    const vFn = ajv.compile(schema);
    //editing the descriptor/value parameter
    descriptor.value = function(...args: any[]) {
      const valid = vFn(args);
      (<ValidateFn>Validate).errors = void 0;
      if (!valid && vFn.errors) {
        (<ValidateFn>Validate).errors = errorFn(vFn.errors) || vFn.errors
      }
      return originalMethod.apply(this, args)
    };
    // return edited descriptor as opposed to overwriting the descriptor
    return descriptor;
  }
}

interface ValidateFn {
  (errorFn?: (errors: ErrorObject[]) => ErrorObject[] | void):
    ((target: any, key: string | symbol, descriptor: PropertyDescriptor) => PropertyDescriptor);
  errors: any;
};
export const Validate = Validator();
// for server pipe
export function validateMeta(metatype: any, value: any) {
  if (!metatype) { return { valid: true, errors: [] } }
  const schema = getSchema(metatype) || {};
  const validate = ajv.compile(schema);
  const valid = validate(value);
  return { valid, errors: validate.errors ? errorJS(validate.errors) : [] }
}

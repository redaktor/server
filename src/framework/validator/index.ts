/* NOTE
Hopefully TS will do https://github.com/Microsoft/TypeScript/issues/4881
so that types must not be specified seperately from decorators !
*/
// TODO Optional eq LIKE @eq('literal') l?: 'literal'
// TODO Checks if the value is an valid enum. isEnum: (entity: object) ??? // object
import 'reflect-metadata';
import { Validators, ExclusiveValidators, ValidatorDecoName } from './interfaces';
import { getSchema, toSchema, getMeta, setMeta } from './shared';
import A from './types/Array';
import B from './types/Boolean';
import N from './types/Number';
import O from './types/Object';
import S from './types/String';
import { UNSPECIFIEDS } from './types';
import { TYPE_KEY } from './constants';
import * as VALIDATE from './validate';

function decorateParameter(
  target: any, key: string | symbol, paramIndex: number,
  name: string, check: Validators
) {
  const schema = decorateMember(target, key, name, check)[key] || {};
  const argSchema = getMeta(target, key) || {};
  argSchema[paramIndex] = toSchema(schema);
  setMeta(argSchema, target, key);
  return
}

function decorateInstance(ctor: (new (...args:any) => any)) {
  const schema: any = {};
  const instance: any = new ctor();
  for (const k of Reflect.ownKeys(instance)) {
    if (!schema[k] && typeof k === 'string') {
      const type = typeof instance[k];
      const vObj = typeof instance[k] === 'undefined' ? {} : {default: instance[k]};
      if (type === 'function') {
        const _schema = getSchema(instance[k], ctor);
        if (_schema) { schema[k] = _schema }
      } else {
        const _schema = getSchema(type, ctor, vObj);
        if (_schema) { schema[k] = _schema }
      }
    }
  }
  setMeta(schema, ctor, null, 'instanceSchema');
  return schema
}

function decorateMember(
  target: any, key: string | symbol,
  name: string, check: Validators, ctor?: (new (...args:any) => any)
) {
  const schema: any = {};
  let schemas: any[] = [];
  console.log(check.length);
  if (!check.length) {
    const propType = Reflect.getMetadata('design:type', target, key);
    const _schema = getSchema(propType, ctor);
    !!_schema && schemas.push(_schema)
  }
  let optional = false;
  if (check.length) {
    check.forEach((validator) => {
      console.log('v_', validator.toString());
      if (typeof validator === 'function') {
        let _schema = getSchema(validator, ctor);
        !!_schema && schemas.push(_schema);
      } else if (!!validator.isMain && TYPE_KEY in validator) {
        if (name !== 'not' && validator.optional) {
          optional = true;
        }
        //@ts-ignore
        schemas.push(validator[TYPE_KEY])
      } else {
        schemas.push(...validator.value)
      }
    });
  }
  if (name === 'allOf') {
    schemas = schemas.map((o: any, i: number) => {
      if (!!i && !!o.type) { delete o.type }
      return o
    });
  }
  if (!schema[key]) { schema[key] = ctor ? { optional } : {} }

  if (name === 'not') {
    if (!schema[key][name]) { schema[key][name] = {} }
    if (!schema[key][name].allOf) { schema[key][name].allOf = [] }
    schema[key][name].allOf = schema[key][name].allOf.concat(schemas)
  } else {
    if (!schema[key][name]) { schema[key][name] = [] }
    schema[key][name] = schema[key][name].concat(schemas)
  }
  return ctor ? { schema, optional } : schema
}

function validatorDecoFn(name: ValidatorDecoName, ...check: Validators) {
  return function propertyDecorator(target: any, key: string | symbol, paramIndex?: number) {
    const ctor = target.constructor;
    if (!key || (typeof key !== 'string' && typeof key !== 'symbol') || !ctor) {
      return
    }
    if (typeof paramIndex === 'number') {
      return decorateParameter(target, key, paramIndex, name, check)
    }

    const instanceSchema = getMeta(ctor, null, 'instanceSchema') || decorateInstance(ctor);
    const baseSchema: any = decorateMember(target, key, name, check, ctor);
    const oldSchema = getMeta(ctor) || { required: [] };

    if (!baseSchema.optional) { oldSchema.required.push(key) }
    if ('optional' in baseSchema.schema[key]) { delete baseSchema.schema[key].optional }
    const newSchema = {...oldSchema.properties, ...toSchema(baseSchema.schema)};
    const schema = !!baseSchema.schema.type ? baseSchema.schema : {
      type: 'object',
      properties: {...newSchema, ...instanceSchema},
      required: oldSchema.required
    };
    setMeta(schema, ctor)
  }
}
/* EXPORTS */
export function All(...check: ExclusiveValidators) {
  return validatorDecoFn('allOf', ...check)
}
export function Any(...check: Validators) {
  return validatorDecoFn('anyOf', ...check)
}
export function Not(...check: Validators) {
  return validatorDecoFn('not', ...check)
}
/* NOTE: oneOf must test all of the subschemas. */
export function One(...check: Validators) {
  return validatorDecoFn('oneOf', ...check)
}
export const array: typeof A = A;
export const boolean: typeof B = B;
export const number: typeof N = N;
export const object: typeof O = O;
export const string: typeof S = S;
export const { optional, empty } = UNSPECIFIEDS;
export const { Validate, Validator, validateMeta } = VALIDATE;


/**
* Checks if value equals ('===') comparison ["const"].
* If multiple comparison are given checks if value matches any of them ["enum"].
* @alias equals
*/
export function eq(...comparisons: any[]) {
  //if (!values.length) TODO
  const isOne = comparisons.length === 1;
  const eqFn = isOne ? One : Any;
  return eqFn({ value: [isOne ? {const: comparisons[0]} : {enum: comparisons}] })
}
export function equals(comparisons: any[]) { return eq(comparisons) }

/*
// TESTS
class t {
  @Any(number.isPositive())
  nr: number;
  @Any(string.isHashtag())
  h: string;
  @Any(string.isISBN(13))
  isbn: string;
  @Any(object.isRDFstring())
  o: any;
  //@Any(optional)
  //lorem? = '';
}
class y {
  @Validate
  testFn(o: t) {
    console.log( 'errors', (<any>Validate).errors )
    return [o]
  }
}
const myCL = new y();
myCL.testFn({nr:1, h: '#valid', isbn: '978-3-86680-192-9', o: {'en-GB':''}})

class x {
  @Any()
  a: string;
  @All(number.min(0).max(2))
  n: number;
  @All(string.isAscii().contains('@domain').isEmail())
  s: string;

  x = '';
  c = 1;
  aaa = new t();
  //OR @Any(t) aaa: t;

  @Any(string, number)
  mm: string | number;
  //@All(t, x)
  //aa: t & x;// & t;
  @Any(string, empty)
  noDeco?: string;
}


class t {
  @Any(string.isISBN(13))
  isbn: string;
  @Any(optional)
  lorem = '';
  ipsum = 2
}
class y {
  @Validate
  testFn(a: string, b: t, @Any(string, number) c: string | number) {
    console.log( (<any>Validate).errors )
    return [a,b,c]
  }
}

//console.log(new x())
const myCL = new y();
myCL.testFn('s', {isbn: '978-3-86680-192-'}, '')


// myCL.testFn('s', {a: 'hello2', n:1, c:1, s:'', x:'', mm:''}, '')
/* TODO
// TODO @String
// TODO chain w. 'redaktor.schema'-Symbol @Any(Number.min(0), Any.isEmpty)
// TODO optional like @optionalAny

Other decorators
@Allow()	Prevent stripping off the property when no other constraint is specified for it.
@IsDefined(value: any)	Checks if value is defined (!== undefined, !== null).
This is the only decorator that ignores skipMissingProperties option.
@IsOptional()	Checks if given value is empty (=== null, === undefined) and if so,
ignores all the check on the property.
- remove from required

Object validation decorators
@IsInstance(value: any)	Checks if the property is an instance of the passed value.
  - ???

Date validation decorators
@MinDate(date: Date)	Checks if the value is a date that's after the specified date.
  - ???
@MaxDate(date: Date)	Checks if the value is a date that's before the specified date.
  - ???

  https://jsfiddle.net/h9q5osgh/7/
  https://jsfiddle.net/j2uezd5v/
*/

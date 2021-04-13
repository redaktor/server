import { TYPE_KEY } from './constants';
import { PRIMITIVES } from './types';

export function getSchema(target: any, ctor?: any, defaultObject = {}) {
  if (ctor && target.name === ctor.name) {
    return {'$ref': '#'}
  }
  if (target.name in PRIMITIVES) {
    return PRIMITIVES[target.name][TYPE_KEY]
  } else {
    let schema = Reflect.getMetadata('schema', target);
    if (typeof schema !== 'string') { return }
    schema = JSON.parse(schema);
    if (typeof schema !== 'object') { return }
    return { ...toSchema(schema), ...defaultObject }
  }
}
export function toSchema(schema: any) {
  console.log('!', schema)
  let tmp = schema.type === 'object' && schema.properties ?
    schema.properties : schema;
  for (let k in tmp) {
    const keys = typeof tmp[k] === 'object' && Object.keys(tmp[k]);
    if (keys && keys.length === 1) {
      if (Array.isArray(tmp[k])) {
        ['const', 'enum'].forEach(k0 => {
          if (tmp[k] && tmp[k][0][k0]) {
            Object.assign(tmp, {...{}, ...tmp[k][0]});
            delete tmp[k];
          }
        })
        continue;
      }

      ['anyOf', 'allOf', 'oneOf'].forEach(k0 => {
        if (typeof tmp[k] === 'object') {
          if (tmp[k][k0] && tmp[k][k0].length === 1) {
            tmp[k] = tmp[k][k0][0]
          } else if (tmp[k][k0] && !tmp[k][k0].length) {
            console.log('DELETING EMPTY', k, tmp[k])
            delete tmp[k];
          }
        }
      })
    }
  }
  return schema
}


export function getMeta(target: any, key?: string|symbol|null, m = 'schema') {
  const s = key ? Reflect.getMetadata(m, target, key) : Reflect.getMetadata(m, target);
  return typeof s === 'string' && JSON.parse(s);
}
export function setMeta(value: {}, target: any, key?: string|symbol|null, m = 'schema') {
  if (key) { return Reflect.defineMetadata(m, JSON.stringify(value), target, key) }
  Reflect.defineMetadata(m, JSON.stringify(value), target)
}

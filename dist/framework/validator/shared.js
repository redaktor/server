"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const constants_1 = require("./constants");
const types_1 = require("./types");
function getSchema(target, ctor, defaultObject = {}) {
    if (ctor && target.name === ctor.name) {
        return { '$ref': '#' };
    }
    if (target.name in types_1.PRIMITIVES) {
        return types_1.PRIMITIVES[target.name][constants_1.TYPE_KEY];
    }
    else {
        let schema = Reflect.getMetadata('schema', target);
        if (typeof schema !== 'string') {
            return;
        }
        schema = JSON.parse(schema);
        if (typeof schema !== 'object') {
            return;
        }
        return Object.assign(Object.assign({}, toSchema(schema)), defaultObject);
    }
}
exports.getSchema = getSchema;
function toSchema(schema) {
    console.log('!', schema);
    let tmp = schema.type === 'object' && schema.properties ?
        schema.properties : schema;
    for (let k in tmp) {
        const keys = typeof tmp[k] === 'object' && Object.keys(tmp[k]);
        if (keys && keys.length === 1) {
            if (Array.isArray(tmp[k])) {
                ['const', 'enum'].forEach(k0 => {
                    if (tmp[k] && tmp[k][0][k0]) {
                        Object.assign(tmp, Object.assign({}, tmp[k][0]));
                        delete tmp[k];
                    }
                });
                continue;
            }
            ['anyOf', 'allOf', 'oneOf'].forEach(k0 => {
                if (typeof tmp[k] === 'object') {
                    if (tmp[k][k0] && tmp[k][k0].length === 1) {
                        tmp[k] = tmp[k][k0][0];
                    }
                    else if (tmp[k][k0] && !tmp[k][k0].length) {
                        console.log('DELETING EMPTY', k, tmp[k]);
                        delete tmp[k];
                    }
                }
            });
        }
    }
    return schema;
}
exports.toSchema = toSchema;
function getMeta(target, key, m = 'schema') {
    const s = key ? Reflect.getMetadata(m, target, key) : Reflect.getMetadata(m, target);
    return typeof s === 'string' && JSON.parse(s);
}
exports.getMeta = getMeta;
function setMeta(value, target, key, m = 'schema') {
    if (key) {
        return Reflect.defineMetadata(m, JSON.stringify(value), target, key);
    }
    Reflect.defineMetadata(m, JSON.stringify(value), target);
}
exports.setMeta = setMeta;
//# sourceMappingURL=shared.js.map
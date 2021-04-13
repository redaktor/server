"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
require("reflect-metadata");
const shared_1 = require("./shared");
const Array_1 = require("./types/Array");
const Boolean_1 = require("./types/Boolean");
const Number_1 = require("./types/Number");
const Object_1 = require("./types/Object");
const String_1 = require("./types/String");
const types_1 = require("./types");
const constants_1 = require("./constants");
const VALIDATE = require("./validate");
function decorateParameter(target, key, paramIndex, name, check) {
    const schema = decorateMember(target, key, name, check)[key] || {};
    const argSchema = shared_1.getMeta(target, key) || {};
    argSchema[paramIndex] = shared_1.toSchema(schema);
    shared_1.setMeta(argSchema, target, key);
    return;
}
function decorateInstance(ctor) {
    const schema = {};
    const instance = new ctor();
    for (const k of Reflect.ownKeys(instance)) {
        if (!schema[k] && typeof k === 'string') {
            const type = typeof instance[k];
            const vObj = typeof instance[k] === 'undefined' ? {} : { default: instance[k] };
            if (type === 'function') {
                const _schema = shared_1.getSchema(instance[k], ctor);
                if (_schema) {
                    schema[k] = _schema;
                }
            }
            else {
                const _schema = shared_1.getSchema(type, ctor, vObj);
                if (_schema) {
                    schema[k] = _schema;
                }
            }
        }
    }
    shared_1.setMeta(schema, ctor, null, 'instanceSchema');
    return schema;
}
function decorateMember(target, key, name, check, ctor) {
    const schema = {};
    let schemas = [];
    console.log(check.length);
    if (!check.length) {
        const propType = Reflect.getMetadata('design:type', target, key);
        const _schema = shared_1.getSchema(propType, ctor);
        !!_schema && schemas.push(_schema);
    }
    let optional = false;
    if (check.length) {
        check.forEach((validator) => {
            console.log('v_', validator.toString());
            if (typeof validator === 'function') {
                let _schema = shared_1.getSchema(validator, ctor);
                !!_schema && schemas.push(_schema);
            }
            else if (!!validator.isMain && constants_1.TYPE_KEY in validator) {
                if (name !== 'not' && validator.optional) {
                    optional = true;
                }
                schemas.push(validator[constants_1.TYPE_KEY]);
            }
            else {
                schemas.push(...validator.value);
            }
        });
    }
    if (name === 'allOf') {
        schemas = schemas.map((o, i) => {
            if (!!i && !!o.type) {
                delete o.type;
            }
            return o;
        });
    }
    if (!schema[key]) {
        schema[key] = ctor ? { optional } : {};
    }
    if (name === 'not') {
        if (!schema[key][name]) {
            schema[key][name] = {};
        }
        if (!schema[key][name].allOf) {
            schema[key][name].allOf = [];
        }
        schema[key][name].allOf = schema[key][name].allOf.concat(schemas);
    }
    else {
        if (!schema[key][name]) {
            schema[key][name] = [];
        }
        schema[key][name] = schema[key][name].concat(schemas);
    }
    return ctor ? { schema, optional } : schema;
}
function validatorDecoFn(name, ...check) {
    return function propertyDecorator(target, key, paramIndex) {
        const ctor = target.constructor;
        if (!key || (typeof key !== 'string' && typeof key !== 'symbol') || !ctor) {
            return;
        }
        if (typeof paramIndex === 'number') {
            return decorateParameter(target, key, paramIndex, name, check);
        }
        const instanceSchema = shared_1.getMeta(ctor, null, 'instanceSchema') || decorateInstance(ctor);
        const baseSchema = decorateMember(target, key, name, check, ctor);
        const oldSchema = shared_1.getMeta(ctor) || { required: [] };
        if (!baseSchema.optional) {
            oldSchema.required.push(key);
        }
        if ('optional' in baseSchema.schema[key]) {
            delete baseSchema.schema[key].optional;
        }
        const newSchema = Object.assign(Object.assign({}, oldSchema.properties), shared_1.toSchema(baseSchema.schema));
        const schema = !!baseSchema.schema.type ? baseSchema.schema : {
            type: 'object',
            properties: Object.assign(Object.assign({}, newSchema), instanceSchema),
            required: oldSchema.required
        };
        shared_1.setMeta(schema, ctor);
    };
}
function All(...check) {
    return validatorDecoFn('allOf', ...check);
}
exports.All = All;
function Any(...check) {
    return validatorDecoFn('anyOf', ...check);
}
exports.Any = Any;
function Not(...check) {
    return validatorDecoFn('not', ...check);
}
exports.Not = Not;
function One(...check) {
    return validatorDecoFn('oneOf', ...check);
}
exports.One = One;
exports.array = Array_1.default;
exports.boolean = Boolean_1.default;
exports.number = Number_1.default;
exports.object = Object_1.default;
exports.string = String_1.default;
exports.optional = types_1.UNSPECIFIEDS.optional, exports.empty = types_1.UNSPECIFIEDS.empty;
exports.Validate = VALIDATE.Validate, exports.Validator = VALIDATE.Validator, exports.validateMeta = VALIDATE.validateMeta;
function eq(...comparisons) {
    const isOne = comparisons.length === 1;
    const eqFn = isOne ? One : Any;
    return eqFn({ value: [isOne ? { const: comparisons[0] } : { enum: comparisons }] });
}
exports.eq = eq;
function equals(comparisons) { return eq(comparisons); }
exports.equals = equals;
//# sourceMappingURL=index.js.map
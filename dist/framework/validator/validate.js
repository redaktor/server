"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const shared_1 = require("./shared");
const StringFormat_1 = require("./types/StringFormat");
const AJV = require("ajv");
const ajv = new AJV({ useDefaults: true, jsonPointers: true, verbose: true });
let name;
for (name in StringFormat_1.default) {
    ajv.addFormat(name, StringFormat_1.default[name]);
}
function toDate(v) {
    return v instanceof Date && !isNaN(v.getTime()) ? v.toISOString() : void 0;
}
const coerce = {
    isDate: () => toDate,
    isTime: () => toDate,
    isDateTime: () => toDate,
    isNumber: (options = { allowNaN: false, allowInfinity: false }) => (v) => {
        if (options.allowNaN) {
            return isNaN(v) ? 0 : v;
        }
        if (options.allowInfinity) {
            return !isFinite(v) ? 0 : v;
        }
        return v;
    },
    noVoid: (...values) => values.map((v) => typeof v === 'undefined' ? null : v)
};
function errorJS(errors) {
    return errors.map(err => {
        const name = (err.parentSchema && typeof err.parentSchema.title === 'string') ?
            err.parentSchema.title : err.dataPath;
        return Object.assign(Object.assign({}, err), { name, text: `Parameter '${name}' ${err.message}` });
    });
}
function Validator(errorFn = errorJS) {
    return function validateDecorator(target, key, descriptor) {
        if (descriptor === undefined) {
            descriptor = Object.getOwnPropertyDescriptor(target, key);
        }
        const isMethod = descriptor.value instanceof Function;
        if (!isMethod) {
            return descriptor;
        }
        const originalMethod = descriptor.value;
        const argSchema = Reflect.hasMetadata('schema', target, key) ?
            JSON.parse(Reflect.getMetadata('schema', target, key)) : {};
        const schemas = Reflect.getMetadata('design:paramtypes', target, key)
            .map((param, i) => {
            let schema = shared_1.getSchema(param) || {};
            if (argSchema[i]) {
                schema = shared_1.toSchema(Object.assign(Object.assign({}, schema), argSchema[i]));
            }
            return schema;
        });
        const schema = { type: 'array', items: schemas };
        const vFn = ajv.compile(schema);
        descriptor.value = function (...args) {
            const valid = vFn(args);
            exports.Validate.errors = void 0;
            if (!valid && vFn.errors) {
                exports.Validate.errors = errorFn(vFn.errors) || vFn.errors;
            }
            return originalMethod.apply(this, args);
        };
        return descriptor;
    };
}
exports.Validator = Validator;
;
exports.Validate = Validator();
function validateMeta(metatype, value) {
    if (!metatype) {
        return { valid: true, errors: [] };
    }
    const schema = shared_1.getSchema(metatype) || {};
    const validate = ajv.compile(schema);
    const valid = validate(value);
    return { valid, errors: validate.errors ? errorJS(validate.errors) : [] };
}
exports.validateMeta = validateMeta;
//# sourceMappingURL=validate.js.map
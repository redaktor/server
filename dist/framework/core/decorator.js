"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const AJV = require("ajv");
const ajv = new AJV({ useDefaults: true, jsonPointers: true, verbose: true });
function API(SCHEMA = {}, INITIALIZERS = {}) {
    const vFn = ajv.compile(SCHEMA);
    const toObj = (o, c, i) => { o[i.toString()] = c; return o; };
    const fullErr = (err) => {
        const name = (err.parentSchema && typeof err.parentSchema.title === 'string') ?
            err.parentSchema.title : err.dataPath;
        return Object.assign(Object.assign({}, err), { name, text: `There was an error with the request. Parameter "${name}" ${err.message}` });
    };
    return function validate(target) {
        for (const k of Object.getOwnPropertyNames(Object.getPrototypeOf(new target()))) {
            const descriptor = Object.getOwnPropertyDescriptor(target.prototype, k);
            const isMethod = descriptor.value instanceof Function;
            if (!isMethod)
                continue;
            const originalMethod = descriptor.value;
            descriptor.value = function (...args) {
                if (typeof INITIALIZERS[k] === 'function') {
                    const INITS = INITIALIZERS[k].apply(this);
                    args = args.map((arg, i) => (arg === void 0) ? INITS[i] : arg);
                }
                const o = { [k]: args.reduce(toObj, {}) };
                const VALID = vFn(o);
                console.log(`!The method args are: ${JSON.stringify(args)}`);
                this.errors = (!VALID && vFn.errors) ? vFn.errors.map(fullErr) : void 0;
                return originalMethod.apply(this, args);
            };
            Object.defineProperty(target.prototype, k, descriptor);
        }
        return class extends target {
            constructor(...args) {
                super(...args);
                const o = { _constructor: args.reduce(toObj, {}) };
                const VALID = vFn(o);
                console.log(`cThe method args are: ${VALID ? 'VALID!' : `INVALID: ${JSON.stringify(vFn.errors)}`}`);
            }
        };
    };
}
exports.default = API;
//# sourceMappingURL=decorator.js.map
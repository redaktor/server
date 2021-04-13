"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const isObjectTypes_1 = require("../lang/isObjectTypes");
const keys_1 = require("./keys");
function _merge(a, b, fnOrDefaults = false, inherited = true, assign = false, stack) {
    if (!isObjectTypes_1.isObject(a)) {
        return a;
    }
    keys_1.each(b, (source) => {
        if (isObjectTypes_1.isObject(a) && isObjectTypes_1.isObject(source)) {
            return keys_1.eachKeys(source, inherited, 0, (k, _i, _o, goOn) => {
                stack || (stack = new Map());
                let v = source[k];
                if (typeof fnOrDefaults === 'function') {
                    const CV = fnOrDefaults(a[k], v, k, _o, stack);
                    if (assign || typeof CV !== 'undefined') {
                        Object.assign(a, { [k]: CV });
                    }
                    return goOn;
                }
                if (assign || (!!a[k] && typeof v === 'undefined')) {
                    if (assign) {
                        Object.assign(a, { [k]: v });
                    }
                    return goOn;
                }
                if (Array.isArray(v)) {
                    if (fnOrDefaults && typeof a[k] === 'undefined') {
                        a[k] = v;
                    }
                    if (Array.isArray(a[k]) && !!a[k].length) {
                        keys_1.each(source[k], (_v, i, _a, next, stop) => {
                            if (i === a[k].length) {
                                return stop;
                            }
                            if (typeof _v !== 'undefined') {
                                a[k][i] = _v;
                            }
                        });
                    }
                }
                else if (isObjectTypes_1.isObject(v)) {
                    if (!a[k]) {
                        Object.assign(a, { [k]: {} });
                    }
                    return _merge(v, a[k], fnOrDefaults, inherited, assign, stack);
                }
                else {
                    return Object.assign(a, { [k]: v });
                }
            });
        }
    });
    return a;
}
function merge(o, ...sources) { return _merge(o, sources); }
exports.merge = merge;
function mergeWith(o, ...sources) { return _merge(o, sources, sources.pop(), true); }
exports.mergeWith = mergeWith;
function assignIn(o, ...sources) { return _merge(o, sources, false, true, true); }
exports.assignIn = assignIn;
function assignWith(o, ...sources) { return _merge(o, sources, sources.pop(), false, true); }
exports.assignWith = assignWith;
function assignInWith(o, ...sources) { return _merge(o, sources, sources.pop(), true, true); }
exports.assignInWith = assignInWith;
function defaults(o, ...sources) { return _merge(o, sources, true, true, true); }
exports.defaults = defaults;
function defaultsDeep(o, ...sources) { return _merge(o, sources, true, true); }
exports.defaultsDeep = defaultsDeep;
//# sourceMappingURL=merge.js.map
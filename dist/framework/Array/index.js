"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const Collection_1 = require("../Collection");
const range_1 = require("../lang/range");
const [_C, _A] = ['Collection/', 'Array/'];
const [E, S, U, W] = [`${_C}each`, `${_C}slice`, `${_C}unique`, `${_C}while`];
const [D, F, Z] = [`${_A}diu`, `${_A}flat`, `${_A}zip`];
class ARRAY extends Collection_1.default {
    constructor(_input = [], _options = {}) {
        super(_input);
        this._input = _input;
        this._options = _options;
        return this.init({ proxyHandler: VIRTUAL_ARRAY, awaits: {
                chunk: S, drop: S, dropLast: S, take: S, takeLast: S,
                zip: Z, zipWith: Z, unzip: Z, unzipWith: Z, pullAt: E, slice: S,
                without: D, difference: D, differenceBy: D, differenceWith: D, intersection: D,
                intersectionBy: D, intersectionWith: D, union: D, unionBy: D, unionWith: D,
                xor: D, xorBy: D, xorWith: D, pull: D, pullAll: D, pullAllBy: D,
                makeUniq: U, uniqBy: U, uniqWith: U, flatten: F, flattenDeep: F, flattenDepth: F,
                findIndex: W, findLastIndex: W, dropWhile: W, dropLastWhile: W,
                takeWhile: W, takeLastWhile: W, fromPairs: E, fill: E
            } });
    }
}
exports.default = ARRAY;
const NATIVE_METHODS = Object.getOwnPropertyNames(Object.getPrototypeOf([]));
const aGets = {
    rest: 'drop', tail: 'drop', initial: 'dropLast',
    compact: 'excludeFalsy', reversed: 'reverse', uniq: 'makeUniq', unique: 'makeUniq',
    flat: 'flatten', deepFlat: 'flattenDeep', sampled: 'sample', shuffled: 'shuffle'
};
const aAlias = {
    size: 'length', makeUnique: 'makeUniq', uniqueBy: 'uniqBy', uniqueWith: 'uniqWith'
};
function doIndex(a, s) {
    if (s === 'first' || s === 'head') {
        return 0;
    }
    if (s === 'last') {
        return a.length - 1;
    }
    const nr = parseInt(s, 10);
    return nr < 0 ? a.length + nr : nr;
}
function pythonRange(target, prop, indices = false) {
    const PYTHON_INDEX_REG = /^[+-\d:]+$/;
    if (!PYTHON_INDEX_REG.test(prop)) {
        return void 0;
    }
    let [start, end, step] = prop.split(':').map(part => parseInt(part, 10));
    return !indices ? target.slice(start, end, step) : range_1.default(target.value, start, end, step);
}
const INDEX_REG = (/index(?:of|by)?$/gi);
const VIRTUAL_ARRAY = {
    has: function (target, prop) {
        return (typeof prop === 'string' && prop.charAt(0) !== '_');
    },
    get: function (target, prop) {
        const v = target.value;
        if (aAlias[prop]) {
            prop = aAlias[prop];
        }
        if (aGets[prop]) {
            prop = aGets[prop];
        }
        console.log('pv', prop, v);
        if (typeof prop !== 'string') {
            return Reflect.get(v, prop);
        }
        if (prop === 'prototype') {
            return void 0;
        }
        if (prop === 'name') {
            return ARRAY;
        }
        if (Reflect.has(target, prop)) {
            console.log('PROXY:', prop, Reflect.get(target, prop));
            return Reflect.get(target, prop);
        }
        if (prop === 'get' || prop === 'nth') {
            return (p) => (typeof p === 'undefined' && target) || target[doIndex(target, p)];
        }
        if (prop.indexOf(':') > -1) {
            return (prop === ':') ? [...v] : pythonRange(v, prop);
        }
        if (!!NATIVE_METHODS[prop]) {
            return Reflect.get(v, prop);
        }
        return v[doIndex(v, prop)];
    },
    set: function (target, prop, val) {
        const v = target.value;
        if (typeof prop !== 'string') {
            return Reflect.set(v, prop, val);
        }
        if (prop.indexOf(':') > -1) {
            if (!Array.isArray(val)) {
                val = Array.of(val);
            }
            let j = 0;
            target.each((_v, i) => {
                if (j >= val.length) {
                    return Reflect.deleteProperty(v, i) && j++;
                }
                v[i] = val[j];
                j++;
            }, ...pythonRange(v, prop, true));
        }
        else {
            v[doIndex(v, prop)] = val;
        }
        return true;
    }
};
//# sourceMappingURL=index.js.map
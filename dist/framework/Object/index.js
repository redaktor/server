"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const Collection_1 = require("../Collection");
const [_C, _O] = ['Collection/', 'Object/'];
const [K, M, W] = [`${_O}keys`, `${_O}merge`, `${_C}while`];
class OBJECT extends Collection_1.default {
    constructor(_input = {}, ...args) {
        super(_input, ...args);
        this._input = _input;
        return this.init({ awaits: {
                keys: K, keysIn: K, forIn: K, forInRight: K, forOwn: K, forOwnRight: K, invert: K,
                invertBy: K, mapKeys: K, mapKeysIn: K, mapValues: K, pick: K, pickBy: K, omit: K,
                omitBy: K, unset: K, values: K, valuesIn: K, functions: K, functionsIn: K, toPairs: K,
                toPairsIn: K, merge: M, mergeWith: M, assignIn: M, assignWith: M, assignInWith: M,
                defaults: M, defaultsDeep: M, findKey: W, findLastKey: W
            } });
    }
    create(proto, keys) { return Object.assign(Object.create(proto), keys); }
    assign(o, ...sources) { return Object.assign(o, ...sources); }
}
exports.default = OBJECT;
//# sourceMappingURL=index.js.map
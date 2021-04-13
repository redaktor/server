"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const Pointer_1 = require("../JSON/Pointer");
const isArgs_1 = require("../lang/isArgs");
const isPrototype_1 = require("../lang/isPrototype");
const isObjectTypes_1 = require("../lang/isObjectTypes");
const isArrayTypes_1 = require("../lang/isArrayTypes");
const to_1 = require("../lang/to");
const each_1 = require("../Collection/each");
exports.each = each_1.each;
const hasOwnProperty = Object.hasOwnProperty;
const oIs = (v) => {
    const _is = {
        arr: Array.isArray(v), buf: (typeof Buffer !== 'undefined' && Buffer.isBuffer(v)), args: isArgs_1.default(v)
    };
    _is.typed = !_is.buf && isArrayTypes_1.isTypedArray(v);
    return _is;
};
const pathArr = (v) => Array.isArray(v) ? (Array.isArray(v[0]) ? v[0] : v) : [v];
const noPath = (paths) => {
    paths = pathArr(paths);
    return (k) => (paths.indexOf(k) < 0 && paths.indexOf(k.slice(1)) < 0);
};
function enumerableInherited(o, R = []) {
    if (o === null) {
        return [];
    }
    if (!isObjectTypes_1.isObject(o)) {
        o = Object(o) || {};
    }
    var isProto = isPrototype_1.default(o);
    for (var k in o) {
        !(k === 'constructor' && (isProto || !hasOwnProperty.call(o, k))) && R.push(k);
    }
    return R;
}
function doTimes(n, iteratee, i = -1) {
    let R = Array(n);
    while (++i < n) {
        R[i] = iteratee(i);
    }
    return R;
}
function _keys(o, inherited = false) {
    if (o instanceof Set || o instanceof Map) {
        return o.keys();
    }
    if (!isArrayTypes_1.isArrayLike(o)) {
        return !!inherited ? enumerableInherited(o) : Object.keys(o);
    }
    const _is = oIs(o);
    const _no = { buf: { offset: 1, parent: 1 }, typed: { buffer: 1, byteLength: 1, byteOffset: 1 } };
    _is.typed = !_is.buf && isArrayTypes_1.isTypedArray(o);
    const skip = _is.arr || _is.buf || _is.args || _is.typed;
    const R = skip ? doTimes(o.length || 0, String) : [];
    const L = R.length;
    for (var k in o) {
        const doSkip = (isArrayTypes_1.isIndex(k, length) || k === 'length' || (_is.buf && !!_no.buf[k]) ||
            (_is.typed && !!_no.typed[k]));
        if ((inherited || hasOwnProperty.call(o, k)) && !(skip && doSkip)) {
            R.push(k);
        }
    }
    return R;
}
function eachKeys(o, inherited, start, fn) {
    const myKeys = _keys(o, inherited);
    return exports.each(myKeys, fn, start);
}
exports.eachKeys = eachKeys;
function keys(o) { return _keys(o); }
exports.keys = keys;
function keysIn(o) { return _keys(o, true); }
exports.keysIn = keysIn;
function forIn(o, iteratee) { return eachKeys(o, true, 0, iteratee); }
exports.forIn = forIn;
function forInRight(o, iteratee) { return eachKeys(o, true, -1, iteratee); }
exports.forInRight = forInRight;
function forOwn(o, iteratee) { return eachKeys(o, false, 0, iteratee); }
exports.forOwn = forOwn;
function forOwnRight(o, iteratee) { return eachKeys(o, false, -1, iteratee); }
exports.forOwnRight = forOwnRight;
function invert(o) {
    return each_1.reduce(o, (_o, v, k) => { _o[to_1.toStr(v)] = k; return _o; }, {});
}
exports.invert = invert;
function invertBy(o, fn) {
    return each_1.reduce(o, (_o, v, k) => { _o[fn(v, k, _o)] = k; return _o; }, {});
}
exports.invertBy = invertBy;
function mapKeys(o, fn) {
    return each_1.reduce(keys(o), (_o, k) => { _o[fn(o[k], k, _o)] = o[k]; return _o; }, {});
}
exports.mapKeys = mapKeys;
function mapKeysIn(o, fn) {
    return each_1.reduce(keysIn(o), (_o, k) => { _o[fn(o[k], k, _o)] = o[k]; return _o; }, {});
}
exports.mapKeysIn = mapKeysIn;
function mapValues(o, fn) {
    return each_1.reduce(o, (_o, v, k) => { _o[`${k}`] = fn(v, k, _o); return _o; }, {});
}
exports.mapValues = mapValues;
function unset(o, ...paths) {
    return each_1.map(pathArr(paths), (p) => Pointer_1.default(o).remove(p)) && o;
}
exports.unset = unset;
function values(o) { return each_1.map(keys(o), (k) => o[k]); }
exports.values = values;
function valuesIn(o) { return each_1.map(keysIn(o), (k) => o[k]); }
exports.valuesIn = valuesIn;
function functions(o, inherited = false) {
    return !o ? [] : each_1.filter(_keys(o, inherited), (k) => (typeof o[k] === 'function'));
}
exports.functions = functions;
function functionsIn(o) { return functions(o, true); }
exports.functionsIn = functionsIn;
function pick(o, ...paths) {
    return each_1.reduce(pathArr(paths), (_o, p, i) => Pointer_1.default(_o, p, Pointer_1.default(o, p)) && _o, {});
}
exports.pick = pick;
function pickBy(o, fn, _o = {}) {
    return Pointer_1.default(o).walk((v, k) => !!fn(v) && Pointer_1.default(_o, k, v)) && _o;
}
exports.pickBy = pickBy;
function omit(o, ...paths) {
    return pick(o, ...Object.keys(Pointer_1.default(o).dict()).filter(noPath(paths)));
}
exports.omit = omit;
function omitBy(o, fn, _o = {}) {
    return Pointer_1.default(o).walk((v, k) => !fn(v) && Pointer_1.default(_o, k, v)) && _o;
}
exports.omitBy = omitBy;
function toPairs(o, inherited = false) {
    if (o instanceof Set || o instanceof Map) {
        return o.entries();
    }
    return each_1.map(_keys(o, inherited), (k) => [k, o[k]]);
}
exports.toPairs = toPairs;
function toPairsIn(o) { return toPairs(o, true); }
exports.toPairsIn = toPairsIn;
//# sourceMappingURL=keys.js.map
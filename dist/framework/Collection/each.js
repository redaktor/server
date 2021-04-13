"use strict";
var __read = (this && this.__read) || function (o, n) {
    var m = typeof Symbol === "function" && o[Symbol.iterator];
    if (!m) return o;
    var i = m.call(o), r, ar = [], e;
    try {
        while ((n === void 0 || n-- > 0) && !(r = i.next()).done) ar.push(r.value);
    }
    catch (error) { e = { error: error }; }
    finally {
        try {
            if (r && !r.done && (m = i["return"])) m.call(i);
        }
        finally { if (e) throw e.error; }
    }
    return ar;
};
var _b;
Object.defineProperty(exports, "__esModule", { value: true });
const constants_1 = require("../core/constants");
const isFlattenable_1 = require("../lang/isFlattenable");
const range_1 = require("../lang/range");
function pullAt(a, indexes) {
    const r = [];
    const _a = new Map(a.map((v, i) => [i, v]));
    for (let key of indexes) {
        r.push(_a.get(key));
        _a.delete(key);
    }
    return ((a.length = 0) || a.push.apply(a, Array.from(_a.values()))) && r;
}
exports.pullAt = pullAt;
function _each(a, fn, start, end, step, _is = { each: 1 }, v, R, T, L) {
    [start, end, step, L, R] = range_1.default(a, start, end, step);
    const _end = !end ? L : end;
    const countFn = (start <= _end ? (i) => i < _end : (i) => i > _end);
    const isPlain = !!a && !isFlattenable_1.default(a) && typeof a === 'object';
    if (_is.reduce) {
        if (typeof v === 'undefined') {
            v = R[0];
        }
        for (let i = start; countFn(i); i += step) {
            v = fn(R[i], (isPlain ? Object.keys(a)[i] : i), R, constants_1.CONTINUE, constants_1.BREAK);
            if (v === constants_1.BREAK) {
                break;
            }
        }
        return v;
    }
    else if (_is.filter || _is.reject || _is.partition) {
        let OK = [];
        for (let i = start; countFn(i); i += step) {
            v = fn(R[i], (isPlain ? Object.keys(a)[i] : i), R, constants_1.CONTINUE, constants_1.BREAK);
            if ((_is.reject && !v) || (!_is.reject && !!v)) {
                OK.push(R[i]);
            }
            if (v === constants_1.BREAK) {
                break;
            }
            else if (!_is.partition || v === constants_1.CONTINUE) {
                continue;
            }
            pullAt(a, [i]);
        }
        return OK;
    }
    for (let i = start; countFn(i); i += step) {
        v = fn(R[i], (isPlain ? Object.keys(a)[i] : i), R, constants_1.CONTINUE, constants_1.BREAK);
        if (v === constants_1.CONTINUE || _is.each) {
            continue;
        }
        else if (v === constants_1.BREAK) {
            break;
        }
        if (_is.every && !v) {
            return false;
        }
        else if (_is.some && !!v) {
            return true;
        }
        if (_is.map) {
            R[i] = v;
        }
    }
    return (_is.every || _is.some) ? !!_is.every : R;
}
const eachFns = ['each', 'every', 'filter', 'map', 'partition', 'reject', 'some'];
_b = __read(eachFns.map((k) => (a, fn, start = 0, end, step) => _each(a, fn, start, end, step, { [k]: 1 })), 7), exports.each = _b[0], exports.every = _b[1], exports.filter = _b[2], exports.map = _b[3], exports.partition = _b[4], exports.reject = _b[5], exports.some = _b[6];
function reduce(a, fn, accumulator, start = 0, end, step) {
    return _each(a, fn, start, end, step, { reduce: 1 }, accumulator);
}
exports.reduce = reduce;
function remove(a, fn) {
    if (typeof fn === 'number') {
        const nr = fn;
        fn = (v, i) => (nr === i);
    }
    const R = [];
    pullAt(a, _each(a, (v, i) => { if (fn(v, i)) {
        R.push(v);
        return i;
    } }, 0, void 0, 1, { map: 1 }));
    return R;
}
exports.remove = remove;
function fromPairs(a, r = {}) { return _each(a, (v) => { r[v[0]] = v[1]; }) && r; }
exports.fromPairs = fromPairs;
function fill(a, value, start, end) {
    return _each(a, (v) => value, start, end, 1, { map: 1 });
}
exports.fill = fill;
function excludeFalsy(a, ...b) {
    return _each(a, (v) => v, 0, void 0, 1, { filter: 1 });
}
exports.excludeFalsy = excludeFalsy;
function zipObject(a, b, o = {}) {
    return _each(a, (r, v, i) => { r[v] = b[i]; return r; }, 0, void 0, 1, { reduce: 1 }, o);
}
exports.zipObject = zipObject;
//# sourceMappingURL=each.js.map
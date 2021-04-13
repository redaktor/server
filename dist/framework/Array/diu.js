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
var _c, _d;
Object.defineProperty(exports, "__esModule", { value: true });
const each_1 = require("../Collection/each");
const unique_1 = require("../Collection/unique");
const flat_1 = require("./flat");
function _RS() {
    return { R: [], S: new Set() };
}
function _diuCheck(v, R, S, _is = {}, iteratee) {
    const computed = (!iteratee ? v : iteratee(v));
    (_is.intersection ? S.has(computed) : !S.has(computed)) && R.push(v);
}
function _diu(a, b, _is = { difference: 1 }) {
    if (_is.union) {
        return unique_1.makeUniq(a.concat(flat_1.flatten(b)));
    }
    const { R, S } = _RS();
    each_1.each(b, (v) => { S.add(v); });
    each_1.each(a, (v) => _diuCheck(v, R, S, _is));
    return R;
}
function _diu_byWith(a, b, _is = { difference: 1 }) {
    const FN = b.pop();
    b = flat_1.flatten(b);
    const { R, S } = _RS();
    if (!_is.with) {
        if (_is.union) {
            return unique_1.uniqBy(a.concat(b), FN);
        }
        each_1.each(b, (v) => S.add(FN(v)));
        each_1.each(a, (v) => _diuCheck(v, R, S, Object.keys(_is)[0], FN));
        return _is.difference ? R : unique_1.uniqBy(R, FN);
    }
    if (_is.union) {
        return unique_1.uniqWith(a.concat(b), FN);
    }
    const BL = b.length;
    each_1.each(a, (v, i, _a, next, stop, j = -1) => {
        while (++j < BL) {
            if (FN(v, b[j])) {
                return next;
            }
        }
        if (!S.has(v)) {
            !_is.intersection && R.push(v);
            S.add(v);
        }
    });
    if (_is.difference) {
        return R;
    }
    each_1.each(a, (v) => !S.has(v) && R.push(v));
    return unique_1.uniqWith(R, FN);
}
function _dx(a, b, byWith = '') {
    let r;
    const FN = !byWith ? void 0 : a.pop();
    each_1.each(a.concat(b), (v, i, _a, next, stop) => {
        if (!Array.isArray(v)) {
            return next;
        }
        if (!i) {
            r = v;
            return next;
        }
        if (!byWith) {
            r = _diu(r, v, 'D').concat(_diu(v, r, 'D'));
        }
        else {
            const _is = { difference: 1, with: (byWith === 'with') };
            const A = _diu_byWith(r, v.concat([FN]), _is);
            r = A.concat(_diu_byWith(v, r.concat([FN]), _is));
        }
    });
    return !byWith ? unique_1.makeUniq(r) : ((byWith === 'by') ? unique_1.uniqBy(r, FN) : unique_1.uniqWith(r, FN));
}
function pullAll(a, values) { a.push.apply(a, _diu(a, values)); }
exports.pullAll = pullAll;
function pull(a, ...values) { a.push.apply(a, _diu(a, values)); }
exports.pull = pull;
function pullAllBy(a, b, iteratee) {
    const _b = [...b, iteratee];
    return a.push.apply(a, _diu_byWith(a, _b, { difference: 1, with: 1 }));
}
exports.pullAllBy = pullAllBy;
function without(a, ...values) { return _diu(a, values); }
exports.without = without;
function xor(a, ...values) { return _dx(a, values); }
exports.xor = xor;
function xorBy(a, ...values) { return _dx(a, values, 'by'); }
exports.xorBy = xorBy;
function xorWith(a, ...values) { return _dx(a, values, 'with'); }
exports.xorWith = xorWith;
const diuFns = ['difference', 'intersection', 'union'];
_c = __read(diuFns.map((k) => (a, ...values) => _diu(a, values, { [k]: 1 })), 3), exports.difference = _c[0], exports.intersection = _c[1], exports.union = _c[2];
_d = __read(diuFns.reduce((a, k) => a.concat([
    (a, ...b) => _diu_byWith(a, b, { [k]: 1 }),
    (a, ...b) => _diu_byWith(a, b, { [k]: 1, with: 1 })
]), []), 6), exports.differenceBy = _d[0], exports.differenceWith = _d[1], exports.intersectionBy = _d[2], exports.intersectionWith = _d[3], exports.unionBy = _d[4], exports.unionWith = _d[5];
//# sourceMappingURL=diu.js.map
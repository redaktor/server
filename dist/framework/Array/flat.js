"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const isFlattenable_1 = require("../lang/isFlattenable");
const each_1 = require("../Collection/each");
const IE_MAX = 20670;
function _flat(a, depth = 1, iteratee, R = []) {
    depth--;
    const hasIteratee = typeof iteratee === 'function';
    each_1.each(a, (v, i, _a, goOn) => {
        if (hasIteratee && !iteratee(v, i, a)) {
            return goOn;
        }
        (depth > -1 && isFlattenable_1.default(v)) ? _flat(v, depth, iteratee, R) : R.push(v);
    });
    return R;
}
function flatten(a, predicate) { return _flat(a, 1, predicate); }
exports.flatten = flatten;
function flattenDeep(a, predicate) { return _flat(a, IE_MAX, predicate); }
exports.flattenDeep = flattenDeep;
function flattenDepth(a, depth = IE_MAX, predicate) {
    return _flat(a, depth, predicate);
}
exports.flattenDepth = flattenDepth;
//# sourceMappingURL=flat.js.map
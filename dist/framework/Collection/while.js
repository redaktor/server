"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const constants_1 = require("../core/constants");
const isFlattenable_1 = require("../lang/isFlattenable");
const range_1 = require("../lang/range");
function _while(a, fn, i = 0, end, _is = { key: 1 }, st, L, R) {
    [i, end, st, L, R] = range_1.default(a, i, end);
    if (i > end) {
        i++;
    }
    else {
        i--;
    }
    const countFn = i > end ? (() => (--i > (end || 0))) : (() => (++i < (end || a.length)));
    const isPlain = !!a && !isFlattenable_1.default(a) && typeof a === 'object';
    const kArgs = (k) => [R[k], (isPlain ? Object.keys(a)[k] : k), R, constants_1.CONTINUE, constants_1.BREAK];
    if (_is.key) {
        let _args;
        while (countFn()) {
            _args = kArgs(i);
            if (fn(..._args)) {
                return _args[1];
            }
        }
        return -1;
    }
    else if (_is.value) {
        while (countFn()) {
            if (fn(...kArgs(i))) {
                return R[i];
            }
        }
        return void 0;
    }
    while (countFn() && fn(...kArgs(i))) { }
    return R.slice(...(i > end ? (_is.drop ? [0, i + 1] : [i + 1, L]) : (_is.drop ? [i, L] : [0, i])));
}
function find(a, fn, start = 0, end) {
    return _while(a, fn, start, end, { value: 1 });
}
exports.find = find;
function findLast(a, fn, start = -1, end) {
    return _while(a, fn, start, end, { value: 1 });
}
exports.findLast = findLast;
function findIndex(a, predicate, start = 0, end) {
    return _while(a, predicate, start, end, { key: 1 });
}
exports.findIndex = findIndex;
function findLastIndex(a, predicate, start = -1, end) {
    return _while(a, predicate, start, end, { key: 1 });
}
exports.findLastIndex = findLastIndex;
function dropWhile(a, predicate, start = 0, end) {
    return _while(a, predicate, start, end, { drop: 1 });
}
exports.dropWhile = dropWhile;
function dropLastWhile(a, predicate, start = -1, end) {
    return _while(a, predicate, start, end, { drop: 1 });
}
exports.dropLastWhile = dropLastWhile;
function takeWhile(a, predicate, start = 0, end) {
    return _while(a, predicate, start, end);
}
exports.takeWhile = takeWhile;
function takeLastWhile(a, predicate, start = -1, end) {
    return _while(a, predicate, start, end);
}
exports.takeLastWhile = takeLastWhile;
//# sourceMappingURL=while.js.map
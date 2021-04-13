"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const isArgs_1 = require("../lang/isArgs");
const isBuffer_1 = require("../lang/isBuffer");
var pSlice = Array.prototype.slice;
function objEq(a, b, opts = { strict: false }) {
    var i, key;
    if (!a || !b || a.prototype !== b.prototype) {
        return false;
    }
    if (isArgs_1.default(a)) {
        if (!isArgs_1.default(b)) {
            return false;
        }
        a = pSlice.call(a);
        b = pSlice.call(b);
        return isEqual(a, b, opts);
    }
    if (isBuffer_1.default(a)) {
        if (!isBuffer_1.default(b) || a.length !== b.length) {
            return false;
        }
        for (i = 0; i < a.length; i++) {
            if (a[i] !== b[i]) {
                return false;
            }
        }
        return true;
    }
    try {
        var ka = Object.keys(a), kb = Object.keys(b);
    }
    catch (e) {
        return false;
    }
    if (ka.length != kb.length)
        return false;
    ka.sort();
    kb.sort();
    for (i = ka.length - 1; i >= 0; i--) {
        if (ka[i] != kb[i]) {
            return false;
        }
    }
    for (i = ka.length - 1; i >= 0; i--) {
        key = ka[i];
        if (!isEqual(a[key], b[key], opts)) {
            return false;
        }
    }
    return (typeof a === typeof b);
}
function isEqual(a, b, opts = { strict: false }) {
    if (Object.is(a, b)) {
        return true;
    }
    else if (a instanceof Date && b instanceof Date) {
        return a.getTime() === b.getTime();
    }
    else if (!a || !b || typeof a != 'object' && typeof b != 'object') {
        return opts.strict ? a === b : a == b;
    }
    else {
        return objEq(a, b, opts);
    }
}
exports.default = isEqual;
//# sourceMappingURL=isEqual.js.map
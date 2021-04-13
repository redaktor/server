"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
function eq(a, b) { return a === b || (a !== a && b !== b); }
function baseAssignValue(o, key, value) {
    if (key == '__proto__' && Object.defineProperty) {
        Object.defineProperty(o, key, {
            configurable: true, enumerable: true, value, writable: true
        });
    }
    else {
        o[key] = value;
    }
}
function assignValue(o, key, value) {
    var objValue = o[key];
    if (!(Object.hasOwnProperty.call(o, key) && eq(objValue, value)) ||
        (value === undefined && !(key in o))) {
        baseAssignValue(o, key, value);
    }
}
exports.default = assignValue;
//# sourceMappingURL=assignValue.js.map
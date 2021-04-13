"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const constants_1 = require("../core/constants");
const isObjectTypes_1 = require("./isObjectTypes");
const isUintReg = /^(?:0|[1-9]\d*)$/;
function isLength(v) {
    return typeof v == 'number' && v > -1 && v % 1 === 0 && v <= constants_1.MAX_SAFE_INTEGER;
}
exports.isLength = isLength;
function isIndex(v, length) {
    length = length == null ? constants_1.MAX_SAFE_INTEGER : length;
    return !!length && (typeof v == 'number' || isUintReg.test(v)) && (v > -1 && v % 1 == 0 && v < length);
}
exports.isIndex = isIndex;
function isArray(v) {
    return (!Array.isArray ? Object.prototype.toString.call(v) === '[object Array]' : Array.isArray(v));
}
exports.isArray = isArray;
function isArrayLike(v) { return !!v && isLength(v.length) && typeof v !== 'function'; }
exports.isArrayLike = isArrayLike;
function isTypedArray(v) {
    if (!isObjectTypes_1.isObjectLike(v)) {
        return false;
    }
    const T = Object.prototype.toString.call(v);
    return !Array.isArray(v) && T.slice(-5) === 'Array' && constants_1.TypedTypesReg.test(T) && isLength(v.length);
}
exports.isTypedArray = isTypedArray;
//# sourceMappingURL=isArrayTypes.js.map
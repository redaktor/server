"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const reIsUint = /^(?:0|[1-9]\d*)$/;
const MAX_SAFE_INTEGER = 9007199254740991;
exports.MAX_ARRAY_LENGTH = 4294967295;
exports.MAX_ARRAY_INDEX = exports.MAX_ARRAY_LENGTH - 1;
exports.HALF_MAX_ARRAY_LENGTH = exports.MAX_ARRAY_LENGTH >>> 1;
function baseSlice(array, start = 0, end) {
    let index = -1;
    let l = array.length;
    end = end === void 0 ? l : end;
    if (start < 0) {
        start = -start > l ? 0 : (l + start);
    }
    end = end > l ? l : end;
    if (end < 0) {
        end += l;
    }
    l = start > end ? 0 : ((end - start) >>> 0);
    start >>>= 0;
    var result = Array(l);
    while (++index < l) {
        result[index] = array[index + start];
    }
    return result;
}
function castSlice(array, start = 0, end) {
    const l = array.length;
    end = end === void 0 ? l : end;
    return (!start && end >= l) ? array : baseSlice(array, start, end);
}
exports.castSlice = castSlice;
function isIndex(value, length) {
    length = length == null ? MAX_SAFE_INTEGER : length;
    return !!length &&
        (typeof value == 'number' || reIsUint.test(value)) &&
        (value > -1 && value % 1 == 0 && value < length);
}
exports.isIndex = isIndex;
//# sourceMappingURL=helper.js.map
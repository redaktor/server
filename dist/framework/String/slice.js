"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
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
exports.baseSlice = baseSlice;
function castSlice(array, start = 0, end) {
    const l = array.length;
    end = end === void 0 ? l : end;
    return (!start && end >= l) ? array : baseSlice(array, start, end);
}
exports.default = castSlice;
//# sourceMappingURL=slice.js.map
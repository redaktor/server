"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const range_1 = require("../lang/range");
const hasMin = (n, min = 2) => (typeof n === 'number' && n >= min);
function slice(start = 0, end, step = 1, length) {
    [start, end, step, length] = range_1.default(this.value, start, end, step);
    let r = new Array(length);
    let j = 0;
    for (let i = start; start <= end ? i < end : i > end; i += step) {
        r[j] = this.value[i];
        j++;
    }
    return r;
}
exports.slice = slice;
function chunk(size = 2, i = 0, rI = 0) {
    size = Math.max(size, 0);
    const L = this.value.length;
    const R = new Array(Math.ceil(L / size));
    while (i < L) {
        R[rI++] = this.value.slice(i, (i += size));
    }
    return R;
}
exports.chunk = chunk;
function drop(n = 1) { return hasMin(n) ? this.value.slice(n) : this.value.slice(1); }
exports.drop = drop;
function dropLast(n = 1) { return hasMin(n) ? this.value.slice(0, 0 - n) : this.value.slice(0, 1); }
exports.dropLast = dropLast;
function take(n = 1) { return hasMin(n) ? this.value.slice(0, n) : this.value[0]; }
exports.take = take;
function takeLast(n = 1) {
    return hasMin(n) ? this.value.slice(this.value.length - n) : this.value[this.value.length - 1];
}
exports.takeLast = takeLast;
//# sourceMappingURL=slice.js.map
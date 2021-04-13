"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
function copyArray(source, a) {
    var index = -1, length = source.length;
    a || (a = Array(length));
    while (++index < length) {
        a[index] = source[index];
    }
    return a;
}
exports.default = copyArray;
//# sourceMappingURL=array.js.map
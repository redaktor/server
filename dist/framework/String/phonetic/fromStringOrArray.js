"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
function stringOrArray(pattern, fn) {
    let patterns = Array.isArray(pattern) ? pattern : [];
    if (typeof pattern === 'string') {
        if (pattern.indexOf(' ') !== -1) {
            patterns = pattern.toLowerCase().split(' ');
        }
        else {
            patterns.push(pattern.toLowerCase());
        }
    }
    return patterns.map(fn);
}
exports.default = stringOrArray;
//# sourceMappingURL=fromStringOrArray.js.map
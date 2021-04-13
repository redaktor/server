"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
function isBuffer(v) {
    if (!v || typeof v !== 'object' || typeof v.length !== 'number' ||
        typeof v.copy !== 'function' || typeof v.slice !== 'function') {
        return false;
    }
    return !(v.length > 0 && typeof v[0] !== 'number');
}
exports.default = isBuffer;
//# sourceMappingURL=isBuffer.js.map
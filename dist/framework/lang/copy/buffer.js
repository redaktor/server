"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const hasFrom = Buffer.hasOwnProperty('from') && typeof Buffer.from === 'function';
function copyBuffer(buf, isDeep = false) {
    if (isDeep) {
        return buf.slice();
    }
    if (hasFrom) {
        return Buffer.from(buf);
    }
    let copy = new Buffer(buf.length);
    buf.copy(copy);
    return copy;
}
exports.default = copyBuffer;
//# sourceMappingURL=buffer.js.map
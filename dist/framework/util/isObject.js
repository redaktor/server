"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
function isObject(v) {
    if (!!(v) && typeof v === 'object') {
        return (!(v instanceof RegExp) && !(v instanceof Array));
    }
    return false;
}
exports.default = isObject;
//# sourceMappingURL=isObject.js.map
"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
function deepClone(value, forceObject = false) {
    switch (typeof value) {
        case "string":
            return forceObject ? JSON.parse(value) : value;
        case "object":
            return JSON.parse(JSON.stringify(value));
        case "undefined":
            return null;
        default:
            return forceObject ? JSON.parse(JSON.stringify({ value })) : value;
    }
}
exports.default = deepClone;
//# sourceMappingURL=clone.js.map
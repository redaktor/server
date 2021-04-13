"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const isFlattenable_1 = require("./isFlattenable");
const isObjectTypes_1 = require("./isObjectTypes");
const keys_1 = require("../Object/keys");
function toStr(v, fn) {
    if (typeof fn === 'function') {
        v = fn(v);
    }
    return typeof v === 'string' ? v : JSON.stringify(v);
}
exports.toStr = toStr;
function toValues(v) {
    const isF = isFlattenable_1.default(v);
    return !isF && isObjectTypes_1.isObjectLike(v) ? keys_1.values(v) : (isF || typeof v === 'string' ? v : [...v]);
}
exports.toValues = toValues;
//# sourceMappingURL=to.js.map
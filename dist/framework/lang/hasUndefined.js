"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const each_1 = require("../Collection/each");
function hasUndefined(o) {
    if (o === undefined) {
        return true;
    }
    if (!!o && typeof o === 'object' && each_1.some(o, hasUndefined)) {
        return true;
    }
    return false;
}
exports.default = hasUndefined;
//# sourceMappingURL=hasUndefined.js.map
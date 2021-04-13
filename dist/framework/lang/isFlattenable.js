"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const isArgs_1 = require("./isArgs");
function isFlattenable(v) {
    return Array.isArray(v) || isArgs_1.default(v) ||
        !!(Symbol.isConcatSpreadable && v && v[Symbol.isConcatSpreadable]);
}
exports.default = isFlattenable;
//# sourceMappingURL=isFlattenable.js.map
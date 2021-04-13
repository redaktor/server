"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const constants_1 = require("../core/constants");
function isLength(v) {
    return typeof v == 'number' && v > -1 && v % 1 === 0 && v <= constants_1.MAX_SAFE_INTEGER;
}
exports.isLength = isLength;
//# sourceMappingURL=isLength.js.map
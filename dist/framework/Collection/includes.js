"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const isEqual_1 = require("../lang/isEqual");
const to_1 = require("../lang/to");
const diu_1 = require("../Array/diu");
function includes(a, ...b) {
    return (diu_1.differenceBy(to_1.toValues(a), b, isEqual_1.default).length === 0);
}
exports.includes = includes;
//# sourceMappingURL=includes.js.map
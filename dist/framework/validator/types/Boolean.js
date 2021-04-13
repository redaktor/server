"use strict";
var _a;
Object.defineProperty(exports, "__esModule", { value: true });
const base_1 = require("./base");
const constants_1 = require("../constants");
class Boolean extends base_1.default {
    constructor() {
        super(...arguments);
        this[_a] = { type: 'boolean' };
    }
}
_a = constants_1.TYPE_KEY;
exports.default = new Boolean();
//# sourceMappingURL=Boolean.js.map
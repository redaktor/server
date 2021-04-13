"use strict";
var _a;
Object.defineProperty(exports, "__esModule", { value: true });
const base_1 = require("./base");
const constants_1 = require("../constants");
class Number extends base_1.default {
    constructor() {
        super(...arguments);
        this[_a] = { type: 'number' };
    }
    isInt() { return this._({ type: ['integer'] }); }
    isInteger() { return this._({ type: ['integer'] }); }
    isDivisibleBy(num) { return this.T({ multipleOf: num }); }
    isPositive() { return this.T({ exclusiveMinimum: 0 }); }
    isNegative() { return this.T({ exclusiveMaximum: 0 }); }
    min(min) { return this.T({ minimum: min }); }
    max(max) { return this.T({ maximum: max }); }
}
_a = constants_1.TYPE_KEY;
exports.default = new Number();
//# sourceMappingURL=Number.js.map
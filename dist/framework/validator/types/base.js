"use strict";
var _a, _b, _c;
Object.defineProperty(exports, "__esModule", { value: true });
const constants_1 = require("../constants");
class Chain {
    constructor() {
        this[_a] = { type: 'object' };
        this[_b] = true;
        this[_c] = [];
    }
    get isMain() {
        const v = this[constants_1.MAIN_KEY];
        this[constants_1.MAIN_KEY] = true;
        return v;
    }
    get value() {
        const v = this[constants_1.VALUE_KEY];
        this[constants_1.VALUE_KEY] = [];
        return v;
    }
    or(next) {
        return this;
    }
    _(schema) {
        this[constants_1.MAIN_KEY] = false;
        this[constants_1.VALUE_KEY].push(schema);
        return this;
    }
    T(o) { return this._(Object.assign(Object.assign({}, this[constants_1.TYPE_KEY]), o)); }
}
exports.default = Chain;
_a = constants_1.TYPE_KEY, _b = constants_1.MAIN_KEY, _c = constants_1.VALUE_KEY;
//# sourceMappingURL=base.js.map
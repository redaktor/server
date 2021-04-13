"use strict";
var _a, _b;
Object.defineProperty(exports, "__esModule", { value: true });
const base_1 = require("./base");
const constants_1 = require("../constants");
class Empty extends base_1.default {
    constructor() {
        super(...arguments);
        this[_a] = { enum: ['', null] };
        this.optional = true;
    }
}
exports.default = Empty;
_a = constants_1.TYPE_KEY;
class Optional extends base_1.default {
    constructor() {
        super(...arguments);
        this[_b] = {};
        this.optional = true;
    }
}
exports.Optional = Optional;
_b = constants_1.TYPE_KEY;
//# sourceMappingURL=Empty.js.map
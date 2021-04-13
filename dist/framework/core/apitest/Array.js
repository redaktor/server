"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const wrap_1 = require("../base/wrap");
class ARRAY {
    constructor(_input, _options = {}, ...args) {
        this._input = _input;
        this._options = _options;
        this.isA = 'Array';
        this.pushIt = wrap_1.default((pushIt) => {
            this._input.push(pushIt);
            return this._input;
        });
        this.value = _input;
    }
    filter(fn) { return this._input.filter(fn); }
    get count() { return { 'TEST': 1, '2': 2 }; }
}
exports.default = ARRAY;
ARRAY.test = 'test';
//# sourceMappingURL=Array.js.map
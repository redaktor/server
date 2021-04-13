"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
class Thing {
    constructor(_input, _options = {}, ...args) {
        this._input = _input;
        this._options = _options;
        this.isA = 'Thing';
    }
    get testThing() { return { 'TEST': 1, 'THING': 2 }; }
}
exports.default = Thing;
//# sourceMappingURL=Thing.js.map
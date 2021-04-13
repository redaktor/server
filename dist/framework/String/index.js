"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const Collection_1 = require("../Collection");
class STRING extends Collection_1.default {
    constructor(_input = '', ...args) {
        super(_input, ...args);
        this._input = _input;
        return this.init({ awaits: {} });
    }
    async $splitSentences() {
    }
}
exports.default = STRING;
//# sourceMappingURL=index.js.map
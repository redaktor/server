"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const core_1 = require("../core");
const pathArr = (v) => Array.isArray(v) && Array.isArray(v[0]) ? v[0] : v;
const _C = 'Collection/';
const [C, E, S, W, I, IN] = ['cgk', 'each', 'shuffle', 'while', 'invoke', 'includes'].map((s) => `${_C}${s}`);
class Collection extends core_1.default {
    constructor(_input = {}, _options = {}) {
        super(_input);
        this._input = _input;
        this._options = _options;
        this.sampleSize = (size) => this;
        this.init({ awaits: {
                count: C, countBy: C, each: E, every: E, filter: E, find: W, findLast: W,
                groupBy: C, includes: IN, invoke: I, keyBy: C, map: E, partition: E,
                reduce: E, reject: E, sample: S, sampleSize: S, shuffle: S, some: E
            } });
    }
    at(...paths) { return pathArr(paths).map((p) => this.pointer(this.value, p)); }
}
exports.default = Collection;
//# sourceMappingURL=index.js.map
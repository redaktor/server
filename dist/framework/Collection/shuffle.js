"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const range_1 = require("../lang/range");
function _shuffle(a, size = 1) {
    let [i, end, s, L, R] = range_1.default(a, 0, size + 1, 1);
    for (i = L - 1; i > L - end; i -= 1) {
        const randI = Math.floor(Math.random() * (i + 1));
        const tmp = R[i];
        R[i] = R[randI];
        R[randI] = tmp;
    }
    return R.slice(0, size);
}
function sample(a) { return _shuffle(a, 1); }
exports.sample = sample;
function sampleSize(a, size = 1) { return _shuffle(a, size); }
exports.sampleSize = sampleSize;
function shuffle(a) { return _shuffle(a); }
exports.shuffle = shuffle;
//# sourceMappingURL=shuffle.js.map
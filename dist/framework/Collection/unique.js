"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const each_1 = require("./each");
function _unique(a, iteratee, comparator, retSet = false) {
    const { R, S } = { R: [], S: new Set() };
    if (!iteratee && !comparator) {
        return each_1.each(a, (v) => S.add(v)) && [...S];
    }
    let rl = 0, _v;
    each_1.each(a, (v, i, _a, next, stop, j = -1) => {
        _v = !iteratee ? v : iteratee(v);
        if (S.has(_v)) {
            return next;
        }
        else {
            S.add(_v);
        }
        if (comparator) {
            while (++j < rl) {
                if (comparator(v, R[j])) {
                    return next;
                }
            }
        }
        if (!retSet) {
            R.push(a[i]);
        }
        rl++;
    });
    return !retSet ? R : S;
}
function makeUniq(a) { return _unique(a); }
exports.makeUniq = makeUniq;
function uniqBy(a, iteratee) { return _unique(a, iteratee); }
exports.uniqBy = uniqBy;
function uniqWith(a, comparator) { return _unique(a, comparator); }
exports.uniqWith = uniqWith;
//# sourceMappingURL=unique.js.map
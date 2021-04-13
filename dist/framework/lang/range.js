"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const to_1 = require("./to");
function startEndStepLength(a, start = 0, end, step = 1, L = 0) {
    const R = to_1.toValues(a);
    L = !L ? R.length : L;
    end = typeof end === 'undefined' || !end ? L : end;
    const parse = (v, defaultValue, resolveNegative = true) => {
        if (typeof v === 'undefined' || isNaN(v)) {
            return defaultValue;
        }
        if (resolveNegative && v < 0) {
            v += L;
        }
        return v;
    };
    step = parse(step, 1, false);
    if (step === 0) {
        return [start, end || L, step, L, R];
    }
    else if (step > 1 && L !== 0) {
        L = L / step;
    }
    [start, end] = (step > 0) ? [parse(start, 0), parse(end, (start < 0) ? 0 : L)] : [parse(start, L - 1), parse(end, -1)];
    return [start, end, step, L, R];
}
exports.default = startEndStepLength;
//# sourceMappingURL=range.js.map
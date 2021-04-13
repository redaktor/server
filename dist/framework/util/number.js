"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
function sign(n) {
    if (typeof Math.sign === 'undefined') {
        if (!n) {
            return 0;
        }
        return (n > 0) ? 1 : -1;
    }
    return Math.sign(n);
}
function preciseRound(n, exp = 4) {
    var t = Math.pow(10, exp);
    var f = (10 / Math.pow(100, exp));
    var a = ((n * t) + (exp > 0 ? 1 : 0) * (sign(n) * f));
    return parseFloat((Math.round(a) / t).toFixed(exp));
}
exports.preciseRound = preciseRound;
//# sourceMappingURL=number.js.map
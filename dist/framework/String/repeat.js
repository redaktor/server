"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const constants_1 = require("../lang/constants");
function repeat(str, n) {
    var result = '';
    if (!str || n < 1 || n > constants_1.MAX_SAFE_INTEGER) {
        return result;
    }
    do {
        if (n % 2) {
            result += str;
        }
        n = Math.floor(n / 2);
        if (n) {
            str += str;
        }
    } while (n);
    return result;
}
exports.repeat = repeat;
//# sourceMappingURL=repeat.js.map
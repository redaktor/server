"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const QueuingStrategy_1 = require("./QueuingStrategy");
class CountQueuingStrategy extends QueuingStrategy_1.default {
    size(chunk) {
        return 1;
    }
}
exports.default = CountQueuingStrategy;
//# sourceMappingURL=CountQueuingStrategy.js.map
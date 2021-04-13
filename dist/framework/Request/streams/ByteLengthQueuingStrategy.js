"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const QueuingStrategy_1 = require("./QueuingStrategy");
const util_1 = require("./util");
class ByteLengthQueuingStrategy extends QueuingStrategy_1.default {
    size(chunk) {
        if (chunk.byteLength !== undefined) {
            return chunk.byteLength;
        }
        else {
            return util_1.getApproximateByteSize(chunk);
        }
    }
}
exports.default = ByteLengthQueuingStrategy;
//# sourceMappingURL=ByteLengthQueuingStrategy.js.map
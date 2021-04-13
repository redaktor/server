"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const checks_1 = require("./checks");
function words(str, pattern, guard) {
    str = `${str}`;
    pattern = guard ? void 0 : pattern;
    if (pattern === void 0) {
        return checks_1.hasUnicodeWord(str) ? checks_1.unicodeWords(str) : checks_1.asciiWords(str);
    }
    return str.match(pattern) || [];
}
exports.default = words;
//# sourceMappingURL=words.js.map
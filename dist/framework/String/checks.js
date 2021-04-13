"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const common_1 = require("./regex/common");
function hasUnicode(str) {
    return common_1.HasUnicode.test(str);
}
exports.hasUnicode = hasUnicode;
function hasUnicodeWord(str) {
    return common_1.HasUnicodeWord.test(str);
}
exports.hasUnicodeWord = hasUnicodeWord;
function unicodeWords(str) {
    return str.match(common_1.UnicodeWord) || [];
}
exports.unicodeWords = unicodeWords;
function asciiWords(str) {
    return str.match(common_1.AsciiWord) || [];
}
exports.asciiWords = asciiWords;
function stringToArray(str, splitter = '') {
    return hasUnicode(str) ? (str.match(common_1.Unicode) || []) : str.split(splitter);
}
exports.stringToArray = stringToArray;
//# sourceMappingURL=checks.js.map
"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const regexesTrim_1 = require("./regex/regexesTrim");
const slice_1 = require("./slice");
function symbolsForTrim(str, chars, guard, regexSuffix = '') {
    str = `${str}`;
    chars = `${chars}`;
    if (!str.length) {
        return '';
    }
    if (str && (guard || chars === undefined)) {
        return str.replace(regexesTrim_1.trimAll, '');
    }
    return Array.from(str);
}
function charsStartIndex(strSymbols, chrSymbols) {
    var index = -1, length = strSymbols.length;
    while (++index < length && chrSymbols.indexOf(strSymbols[index]) > -1) { }
    return index;
}
function charsEndIndex(strSymbols, chrSymbols) {
    var index = strSymbols.length;
    while (index-- && chrSymbols.indexOf(strSymbols[index]) > -1) { }
    return index;
}
function baseTrim(str, chars, guard, type) {
    var strSymbols = symbolsForTrim(str, chars, guard);
    if (typeof strSymbols === 'string') {
        return strSymbols;
    }
    const chrSymbols = Array.from(chars);
    const start = type === 'End' ? 0 : charsStartIndex(strSymbols, chrSymbols);
    const end = type === 'Start' ? void 0 : charsEndIndex(strSymbols, chrSymbols) + 1;
    return slice_1.default(strSymbols, start, end).join('');
}
exports.baseTrim = baseTrim;
function trim(str, chars, guard, type) {
    return baseTrim(str, chars, guard);
}
exports.trim = trim;
function trimEnd(str, chars, guard) {
    return baseTrim(str, chars, guard, 'End');
}
exports.trimEnd = trimEnd;
function trimStart(str, chars, guard) {
    return baseTrim(str, chars, guard, 'Start');
}
exports.trimStart = trimStart;
//# sourceMappingURL=trim.js.map
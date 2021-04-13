"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.oneLetter = /(^|\s|\.)[a-z][.]\s*?$/i;
exports.ellipsis = /[.]\.+( +)?$/;
exports.acronym = /[ |.][A-Z].?( *)?$/i;
exports.noVowel = /(^|\s|\.)[^aeiouy]+[.]\s*?$/i;
function isAbbreviation(s) {
    return !![exports.oneLetter, exports.ellipsis, exports.acronym].filter((r) => r.test(s)).length;
}
exports.default = isAbbreviation;
//# sourceMappingURL=abbreviation.js.map
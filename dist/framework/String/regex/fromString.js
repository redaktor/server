"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const SPECIAL_CHARS_REGEX = /[\-\[\]\/\{\}\(\)\*\+\?\.\\\^\$\|]/g;
function regexString(str) {
    return str.replace(SPECIAL_CHARS_REGEX, '\\$&');
}
exports.regexString = regexString;
function regexFromString(str) {
    return new RegExp(regexString(str));
}
exports.default = regexFromString;
//# sourceMappingURL=fromString.js.map
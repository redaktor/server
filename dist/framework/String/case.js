"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const regexApostroph_1 = require("./regex/regexApostroph");
const slug_1 = require("./slug");
const checks_1 = require("./checks");
const slice_1 = require("./slice");
const words_1 = require("./words");
function caseFirstFn(methodName) {
    return function (str) {
        str = `${str}`;
        const Symbols = checks_1.hasUnicode(str) ? Array.from(str) : null;
        var chr = Symbols ? Symbols[0] : str.charAt(0);
        var trailing = Symbols ? slice_1.default(Symbols, 1).join('') : str.slice(1);
        return chr[methodName]() + trailing;
    };
}
function caseFn(cb) {
    return (str) => words_1.default(slug_1.deburr(str).replace(regexApostroph_1.default, '')).reduce(cb, '');
}
function capitalize(str) {
    str = `${str}`.toLowerCase();
    return exports.upperFirst(str);
}
exports.capitalize = capitalize;
exports.upperFirst = caseFirstFn('toUpperCase');
exports.lowerFirst = caseFirstFn('toLowerCase');
exports.upperCase = caseFn((result, word, index) => result + (index ? ' ' : '') + word.toUpperCase());
exports.lowerCase = caseFn((result, word, index) => result + (index ? ' ' : '') + word.toLowerCase());
function toLower(str) {
    return `${str}`.toLowerCase();
}
exports.toLower = toLower;
function toUpper(str) {
    return `${str}`.toUpperCase();
}
exports.toUpper = toUpper;
exports.readable = (s) => {
    return (!s) ? '' : s.replace(/([A-Z])/g, ($1) => [' ', $1.toLowerCase()].join(''));
};
exports.camelCase = caseFn((result, word, index) => result + (index ? capitalize(word) : word.toLowerCase()));
exports.pascalCase = caseFn((result, word, index) => result + capitalize(word));
exports.kebapCase = caseFn((result, word, index) => result + (index ? '-' : '') + word.toLowerCase());
exports.snakeCase = caseFn((result, word, index) => result + (index ? '_' : '') + word.toLowerCase());
exports.startCase = caseFn((result, word, index) => result + (index ? ' ' : '') + exports.upperFirst(word));
//# sourceMappingURL=case.js.map
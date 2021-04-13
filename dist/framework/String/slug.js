"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const regexComboMark_1 = require("./regex/regexComboMark");
const regexNotUrlSafe_1 = require("./regex/regexNotUrlSafe");
const unicode_1 = require("./lexicon/unicode");
const trim = require("./trim");
function deburr(str, options = {
    unicode: true,
    customReplace: {}
}) {
    str = `${str}`.replace(regexComboMark_1.default, '');
    const r = Object.assign(Object.assign({}, unicode_1.default), options.customReplace);
    for (let k in r) {
        str = str.replace(new RegExp(`[${k}]`, 'gu'), r[k]);
    }
    return str;
}
exports.deburr = deburr;
function slug(str, optionsOrSeparatorStr = {
    separator: '-',
    lowercase: true,
    leading: false,
    trailing: false,
    decamelize: true,
    customReplace: {}
}) {
    const options = typeof optionsOrSeparatorStr === 'string' ?
        { separator: optionsOrSeparatorStr } : optionsOrSeparatorStr;
    options.separator = `${options.separator}`;
    const separator = regexNotUrlSafe_1.default.test(options.separator) ? '-' : options.separator;
    const { decamelize, leading, trailing } = options;
    if (options.decamelize) {
        str = str.replace(/([a-z\d])([A-Z])/g, '$1 $2');
    }
    str = deburr(str.trim(), options).normalize('NFKD')
        .replace(regexNotUrlSafe_1.default, separator).replace(/\\/g, '');
    if (options.lowercase) {
        str = str.toLowerCase();
    }
    if (leading && trailing) {
        return str;
    }
    const trimKey = !leading && !trailing ? 'trim' : (!leading ? 'trimStart' : 'trimEnd');
    return trim[trimKey](str, separator);
}
exports.default = slug;
//# sourceMappingURL=slug.js.map
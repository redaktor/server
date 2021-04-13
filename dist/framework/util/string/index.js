"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const helper_1 = require("../array/helper");
const to_1 = require("../to");
const lang_1 = require("../lang");
const r = require("./regexes");
const MAX_SAFE_INTEGER = 9007199254740991;
function unicodeSize(str) {
    var result = r.Unicode.lastIndex = 0;
    while (r.Unicode.test(str)) {
        result++;
    }
    return result;
}
function baseRepeat(str, n) {
    var result = '';
    if (!str || n < 1 || n > MAX_SAFE_INTEGER) {
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
function isIterateeCall(value, i, o) {
    if (typeof o !== 'object') {
        return false;
    }
    var type = typeof i;
    if (type === 'number'
        ? (Array.isArray(o) && helper_1.isIndex(i, o.length))
        : (type == 'string' && o.hasOwnProperty(i))) {
        return lang_1.eq(o[i], value);
    }
    return false;
}
function paddingStr(length, chars = ' ') {
    chars = to_1.to(chars, 'string');
    var charsLength = chars.length;
    if (charsLength < 2) {
        return charsLength ? baseRepeat(chars, length) : chars;
    }
    var result = baseRepeat(chars, Math.ceil(length / stringSize(chars)));
    return hasUnicode(chars)
        ? helper_1.castSlice(stringToArray(result), 0, length).join('')
        : result.slice(0, length);
}
function stripTags(s) {
    return (s.replace(/(<([^>]+)>)/ig, '')) || '';
}
exports.stripTags = stripTags;
function addSlashes(s) {
    return (s.replace(/\\/g, '\\\\').replace(/\'/g, "\\'").replace(/\"/g, '\\"')) || '';
}
exports.addSlashes = addSlashes;
function hasUnicode(str) {
    return r.HasUnicode.test(str);
}
exports.hasUnicode = hasUnicode;
function hasUnicodeWord(str) {
    return r.HasUnicodeWord.test(str);
}
exports.hasUnicodeWord = hasUnicodeWord;
function unicodeWords(str) {
    return str.match(r.UnicodeWord) || [];
}
exports.unicodeWords = unicodeWords;
function asciiWords(str) {
    return str.match(r.AsciiWord) || [];
}
exports.asciiWords = asciiWords;
function stringToArray(str, splitter = '') {
    return hasUnicode(str) ? (str.match(r.Unicode) || []) : str.split(splitter);
}
exports.stringToArray = stringToArray;
function stringSize(str) {
    return hasUnicode(str) ? unicodeSize(str) : str.length;
}
exports.stringSize = stringSize;
function deburr(str) {
    str = to_1.to(str, 'string');
    const deburrLetter = (o) => ((k) => (o === null ? undefined : o[k]));
    return str && str.replace(r.Latin, deburrLetter).replace(r.ComboMark, '');
}
exports.deburr = deburr;
function words(str, pattern, guard) {
    str = to_1.to(str, 'string');
    pattern = guard ? void 0 : pattern;
    if (pattern === void 0) {
        return hasUnicodeWord(str) ? unicodeWords(str) : asciiWords(str);
    }
    return str.match(pattern) || [];
}
exports.words = words;
function pad(str, length, chars = ' ') {
    const o = KW(str, [length, 'length', 'integer'], [chars, 'chars', 'string']);
    var strLength = o.length ? stringSize(o.str) : 0;
    if (!o.length || strLength >= o.length) {
        return o.str;
    }
    var mid = (o.length - strLength) / 2;
    return (paddingStr(Math.floor(mid), o.chars) +
        o.str +
        paddingStr(Math.ceil(mid), o.chars));
}
exports.pad = pad;
function padEnd(str, length, chars = ' ') {
    const o = KW(str, [length, 'length', 'integer'], [chars, 'chars', 'string']);
    var strLength = o.length ? stringSize(o.str) : 0;
    return (o.length && strLength < o.length)
        ? (o.str + paddingStr(o.length - strLength, o.chars))
        : o.str;
}
exports.padEnd = padEnd;
function padStart(str, length, chars = ' ') {
    const o = KW(str, [length, 'length', 'integer'], [chars, 'chars', 'string']);
    var strLength = o.length ? stringSize(o.str) : 0;
    return (o.length && strLength < o.length)
        ? (paddingStr(o.length - strLength, o.chars) + o.str)
        : o.str;
}
exports.padStart = padStart;
function truncate(str, length = 30, omission = ' […]', separator) {
    const o = KW(str, [length, 'length', 'integer'], [omission, 'omission', 'string'], [separator, 'separator']);
    var Sep = o.separator;
    var strLength = o.str.length;
    if (hasUnicode(o.str)) {
        var Symbols = stringToArray(o.str);
        strLength = Symbols.length;
    }
    if (o.length >= strLength) {
        return o.str;
    }
    var end = o.length - stringSize(o.omission);
    if (end < 1) {
        return o.omission;
    }
    var result = Symbols ? helper_1.castSlice(Symbols, 0, end).join('') : o.str.slice(0, end);
    if (Sep === undefined) {
        return result + o.omission;
    }
    if (Symbols) {
        end += (result.length - end);
    }
    if (Sep instanceof RegExp) {
        if (o.str.slice(end).search(Sep)) {
            var match, substring = result;
            if (!Sep.global) {
                Sep = RegExp(Sep.source, to_1.to(r.Flags.exec(Sep), 'string') + 'g');
            }
            Sep.lastIndex = 0;
            while ((match = Sep.exec(substring))) {
                var newEnd = match.index;
            }
            result = result.slice(0, newEnd === undefined ? end : newEnd);
        }
    }
    else if (o.str.indexOf(to_1.to(Sep, 'string'), end) != end) {
        var index = result.lastIndexOf(Sep);
        if (index > -1) {
            result = result.slice(0, index);
        }
    }
    return result + o.omission;
}
exports.truncate = truncate;
function repeat(str, n = 1, guard) {
    const o = KW(str, [n, 'n', 'integer'], [guard, 'guard']);
    if (guard && isIterateeCall(str, n, guard)) {
        n = 1;
    }
    return baseRepeat(str, n);
}
exports.repeat = repeat;
function str(s) {
    return (typeof s === 'string' && s.trim() != '');
}
//# sourceMappingURL=index.js.map
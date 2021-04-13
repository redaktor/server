"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const regexApostroph_1 = require("./regexApostroph");
exports.reUnescapedString = /['\n\r\u2028\u2029\\]/g;
exports.rsAstralRange = '\\ud800-\\udfff';
exports.rsComboMarksRange = '\\u0300-\\u036f\\ufe20-\\ufe23';
exports.rsComboSymbolsRange = '\\u20d0-\\u20f0';
exports.rsDingbatRange = '\\u2700-\\u27bf';
exports.rsLowerRange = 'a-z\\xdf-\\xf6\\xf8-\\xff';
exports.rsMathOpRange = '\\xac\\xb1\\xd7\\xf7';
exports.rsNonCharRange = '\\x00-\\x2f\\x3a-\\x40\\x5b-\\x60\\x7b-\\xbf';
exports.rsPunctuationRange = '\\u2000-\\u206f';
exports.rsSpaceRange = ' \\t\\x0b\\f\\xa0\\ufeff\\n\\r\\u2028\\u2029\\u1680\\u180e\\u2000\\u2001\\u2002\\u2003\\u2004\\u2005\\u2006\\u2007\\u2008\\u2009\\u200a\\u202f\\u205f\\u3000';
exports.rsUpperRange = 'A-Z\\xc0-\\xd6\\xd8-\\xde';
exports.rsVarRange = '\\ufe0e\\ufe0f';
exports.rsBreakRange = exports.rsMathOpRange + exports.rsNonCharRange + exports.rsPunctuationRange + exports.rsSpaceRange;
exports.rsAstral = '[' + exports.rsAstralRange + ']';
exports.rsBreak = '[' + exports.rsBreakRange + ']';
exports.rsCombo = '[' + exports.rsComboMarksRange + exports.rsComboSymbolsRange + ']';
exports.rsDigits = '\\d+';
exports.rsDingbat = '[' + exports.rsDingbatRange + ']';
exports.rsLower = '[' + exports.rsLowerRange + ']';
exports.rsMisc = '[^' + exports.rsAstralRange + exports.rsBreakRange + exports.rsDigits + exports.rsDingbatRange + exports.rsLowerRange + exports.rsUpperRange + ']';
exports.rsFitz = '\\ud83c[\\udffb-\\udfff]';
exports.rsModifier = '(?:' + exports.rsCombo + '|' + exports.rsFitz + ')';
exports.rsNonAstral = '[^' + exports.rsAstralRange + ']';
exports.rsRegional = '(?:\\ud83c[\\udde6-\\uddff]){2}';
exports.rsSurrPair = '[\\ud800-\\udbff][\\udc00-\\udfff]';
exports.rsUpper = '[' + exports.rsUpperRange + ']';
exports.rsZWJ = '\\u200d';
exports.rsLowerMisc = '(?:' + exports.rsLower + '|' + exports.rsMisc + ')';
exports.rsUpperMisc = '(?:' + exports.rsUpper + '|' + exports.rsMisc + ')';
exports.rsOptLowerContr = '(?:' + regexApostroph_1.rsApos + '(?:d|ll|m|re|s|t|ve))?';
exports.rsOptUpperContr = '(?:' + regexApostroph_1.rsApos + '(?:D|LL|M|RE|S|T|VE))?';
exports.reOptMod = exports.rsModifier + '?';
exports.rsOptVar = '[' + exports.rsVarRange + ']?';
exports.rsOptJoin = '(?:' + exports.rsZWJ + '(?:' + [exports.rsNonAstral, exports.rsRegional, exports.rsSurrPair].join('|') + ')' + exports.rsOptVar + exports.reOptMod + ')*';
exports.rsSeq = exports.rsOptVar + exports.reOptMod + exports.rsOptJoin;
exports.rsEmoji = '(?:' + [exports.rsDingbat, exports.rsRegional, exports.rsSurrPair].join('|') + ')' + exports.rsSeq;
exports.rsSymbol = '(?:' + [exports.rsNonAstral + exports.rsCombo + '?', exports.rsCombo, exports.rsRegional, exports.rsSurrPair, exports.rsAstral].join('|') + ')';
exports.Flags = /\w*$/;
exports.HasUnicode = RegExp('[' + exports.rsZWJ + exports.rsAstralRange + exports.rsComboMarksRange + exports.rsComboSymbolsRange + exports.rsVarRange + ']');
exports.HasUnicodeWord = /[a-z][A-Z]|[A-Z]{2,}[a-z]|[0-9][a-zA-Z]|[a-zA-Z][0-9]|[^a-zA-Z0-9 ]/;
exports.Unicode = RegExp(exports.rsFitz + '(?=' + exports.rsFitz + ')|' + exports.rsSymbol + exports.rsSeq, 'g');
exports.UnicodeWord = RegExp([
    exports.rsUpper + '?' + exports.rsLower + '+' + exports.rsOptLowerContr + '(?=' + [exports.rsBreak, exports.rsUpper, '$'].join('|') + ')',
    exports.rsUpperMisc + '+' + exports.rsOptUpperContr + '(?=' + [exports.rsBreak, exports.rsUpper + exports.rsLowerMisc, '$'].join('|') + ')',
    exports.rsUpper + '?' + exports.rsLowerMisc + '+' + exports.rsOptLowerContr,
    exports.rsUpper + '+' + exports.rsOptUpperContr,
    exports.rsDigits,
    exports.rsEmoji
].join('|'), 'g');
exports.AsciiWord = /[^\x00-\x2f\x3a-\x40\x5b-\x60\x7b-\x7f]+/g;
exports.Latin = /[\xc0-\xd6\xd8-\xf6\xf8-\xff\u0100-\u017f]/g;
//# sourceMappingURL=common.js.map
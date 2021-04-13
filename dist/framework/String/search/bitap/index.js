"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const fromString_1 = require("../../regex/fromString");
const bitapSearch_1 = require("./bitapSearch");
exports.SPECIAL_CHARS_REGEX = /[\-\[\]\/\{\}\(\)\*\+\?\.\\\^\$\|]/g;
function regexSearch(text, pattern, tokenSeparator = / +/g) {
    let regex = new RegExp(fromString_1.regexString(pattern).replace(tokenSeparator, '|'));
    let matches = text.match(regex) || [];
    let isMatch = !!matches;
    let matchedIndices = [];
    if (isMatch) {
        for (let i = 0, matchesLen = matches.length; i < matchesLen; i += 1) {
            let match = matches[i];
            matchedIndices.push([text.indexOf(match), match.length - 1]);
        }
    }
    return { score: isMatch ? 0.5 : 1, isMatch, matchedIndices };
}
exports.regexSearch = regexSearch;
function patternAlphabet(pattern) {
    let mask = {};
    let len = pattern.length;
    for (let i = 0; i < len; i += 1) {
        mask[pattern.charAt(i)] = 0;
    }
    for (let i = 0; i < len; i += 1) {
        mask[pattern.charAt(i)] |= 1 << (len - i - 1);
    }
    return mask;
}
exports.patternAlphabet = patternAlphabet;
class Bitap {
    constructor(pattern, options = {}) {
        this.patternAlphabet = '';
        const { maxPatternLength = 36 } = this.properties = Object.assign({ location: 0, distance: 100, threshold: 0.75, maxPatternLength: 36, caseSensitive: false, tokenSeparator: / +/g, findAllMatches: false, minMatchCharLength: 1 }, options);
        this.pattern = this.properties.caseSensitive ? pattern : pattern.toLowerCase();
        if (this.pattern.length <= maxPatternLength) {
            this.patternAlphabet = patternAlphabet(this.pattern);
        }
    }
    search(text) {
        if (!this.properties.caseSensitive) {
            text = text.toLowerCase();
        }
        if (this.pattern === text) {
            return {
                isMatch: true,
                score: 0,
                matchedIndices: [[0, text.length - 1]]
            };
        }
        const { maxPatternLength = 36, tokenSeparator } = this.properties;
        if (this.pattern.length > maxPatternLength) {
            return regexSearch(text, this.pattern, tokenSeparator);
        }
        const { location = 0, distance = 100, threshold = 0.75, findAllMatches = false, minMatchCharLength = 1 } = this.properties;
        return bitapSearch_1.default(text, this.pattern, this.patternAlphabet, {
            location,
            distance,
            threshold,
            findAllMatches,
            minMatchCharLength
        });
    }
}
exports.default = Bitap;
//# sourceMappingURL=index.js.map
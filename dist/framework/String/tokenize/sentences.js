"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const regexLine_1 = require("../regex/regexLine");
const regexPunctuations_1 = require("../regex/regexPunctuations");
const regexPeriodDigit_1 = require("../regex/regexPeriodDigit");
const regexPeriodPrefix_1 = require("../regex/regexPeriodPrefix");
const abbreviation_1 = require("../regex/abbreviation");
function splitSentences(s) {
    const text = `${s}`;
    let sentences = [];
    if (!text) {
        return sentences;
    }
    const chunks = [];
    const splits = [];
    const lines = text.split(regexLine_1.default);
    const l = lines.length;
    for (let i = 0; i < l; i++) {
        const arr = lines[i].split(regexPunctuations_1.default);
        for (let o = 0; o < arr.length; o++) {
            splits.push(arr[o]);
        }
    }
    for (let i = 0; i < splits.length; i++) {
        let s = splits[i];
        if (!s || !s.length) {
            continue;
        }
        if (!s) {
            if (chunks[chunks.length - 1]) {
                chunks[chunks.length - 1] += s;
                continue;
            }
            else if (splits[i + 1]) {
                splits[i + 1] = s + splits[i + 1];
                continue;
            }
        }
        chunks.push(s);
    }
    for (let i = 0; i < chunks.length; i++) {
        const c = chunks[i];
        const isOK = regexPeriodDigit_1.default.test(c);
        const isAbbr = abbreviation_1.default(c);
        console.log(c, isOK, isAbbr);
        let isAbbrChunk = i < chunks.length - 1 && !isOK && !!isAbbr;
        if (!isAbbrChunk && i < chunks.length - 1) {
            const lastW = c.match(/\b(\w+)\W*$/);
            const abbrMulti = `${lastW && lastW[1] ? lastW[1] : ''}${chunks[i + 1] || ''}`
                .replace(/\s|[.]/g, '');
        }
        if (isAbbrChunk) {
            chunks[i + 1] = c + (chunks[i + 1] || '');
        }
        else if (c && c.length > 0) {
            sentences.push(c);
            chunks[i] = '';
        }
        if (i > 0 && regexPeriodPrefix_1.default.test(c)) {
            chunks[i - 1] = chunks[i - 1] + c;
            chunks[i] = '';
        }
    }
    return (sentences.length === 0) ? [text] : sentences;
}
exports.default = splitSentences;
//# sourceMappingURL=sentences.js.map
"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const each_1 = require("../Collection/each");
const REGEXPS = {
    default: /\S/,
    punctuations: /(\S.+?[.!?])(?=\s+|$)/g,
    line: /(\n+)/,
    periodDigit: /\d[.]\s*?$/,
    oneLetter: /(^|\s|\.)[a-z][.]\s*?$/i,
    noVowel: /(^|\s|\.)[^aeiouy]+[.]\s*?$/i,
    acronym: /[ |.][A-Z].?( *)?$/i,
    ellipsis: /[.]\.+( +)?$/,
};
function splitBy(s, rName = 'default') {
    if (!REGEXPS[rName]) {
        return [s];
    }
    return array(s.split(REGEXPS[rName]));
}
async function $splitSentences(text, sentences = []) {
    const s = String(text);
    if (!s) {
        return sentences;
    }
    const chunks = array();
    const splits = splitBy(s, 'line').map((l) => splitBy(l, 'punctuations'));
    console.log(splits);
    each_1.each(splits, (sp, i, _a, next, stop) => {
        if (!sp) {
            return next;
        }
        if (!/\S/.test(sp)) {
            if (chunks[-1]) {
                chunks[-1] += sp;
                return next;
            }
            else {
                const nI = i + 1;
                if (splits[nI]) {
                    splits[nI] = `${sp}${splits[nI]}`;
                    return next;
                }
            }
        }
        chunks.push(sp);
    });
    console.log('c2', chunks);
    throw ('');
    return (!sentences.length) ? [text] : sentences;
}
exports.$splitSentences = $splitSentences;
//# sourceMappingURL=sentences.js.map
"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const main_1 = require("../main");
const convert_1 = require("../lang/en/convert");
function build(lex, options = {}) {
    options = options || {};
    lexiLoop: for (let s in lex) {
        if (!!options.conjugate && lex[s] === 'Infinitive') {
            const V = main_1.VerbTerms.fromString(s);
            const o = V.fastConjugate(s);
            for (let t in o) {
                if (lex[o[t]] === void 0) {
                    lex[o[t]] = t;
                    continue lexiLoop;
                }
            }
        }
        if (!!options.inflect && lex[s] === 'Singular') {
            const N = main_1.NounTerms.fromString(s);
            let plural = N.toPlural(s).out();
            lex[plural] = 'Plural';
            continue lexiLoop;
        }
        if (lex[s] === 'Comparable') {
            ['Comparative', 'Superlative', 'Noun', 'Adverb'].forEach((type) => {
                let w = convert_1.default(s, 'Adjective', type);
                if (lex[w] === void 0) {
                    lex[w] = type;
                }
            });
            continue lexiLoop;
        }
    }
    delete lex[''];
    return lex;
}
exports.build = build;
;
function firstWords(lex) {
    let firstWords = {};
    let keys = Object.keys(lex);
    const hasSpace = / /;
    for (let i = 0; i < keys.length; i++) {
        if (hasSpace.test(keys[i]) === true) {
            let words = keys[i].split(/ /g);
            firstWords[words[0]] = firstWords[words[0]] || [];
            let str = words.slice(1).join(' ');
            firstWords[words[0]][str] = true;
        }
    }
    return firstWords;
}
exports.firstWords = firstWords;
;
//# sourceMappingURL=_build.js.map
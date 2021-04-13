"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const unpack_1 = require("../../../efrt/unpack");
const _compressed_1 = require("./_compressed");
const _build_1 = require("../../lexicon/_build");
const abbreviation_1 = require("./abbreviation");
const contraction_1 = require("./contraction");
const number_1 = require("./number");
const date_1 = require("./date");
const irregular_1 = require("./irregular");
const misc_1 = require("./misc");
const corrections_1 = require("./corrections");
const possessive_1 = require("./possessive");
const condition_1 = require("./condition");
const convert_1 = require("./convert");
const zip = {
    noun: 'ave|blvd|uss|ss|arc|al|cl|ct|cres|exprd|st|dist|mt|fy|hwy|pd|pl|plz|tce|llb|' +
        'mdbl|ma|ba|lit|ala|ariz|ark|cal|calif|colo|conn|del|fed|fl|fla|ga|ida|ind|ia|' +
        'kan|kans|ken|ky|la|md|mich|minn|mont|neb|nebr|nev|okla|penna|penn|pa|dak|tenn|' +
        'tex|ut|vt|va|wash|wis|wisc|wy|wyo|usafa|alta|ont|que|sask|yuk|dept|univ|' +
        'assn|bros|inc|ltd|co|google|yahoo|joomla|jeopardy|no doubt',
    Singular: 'game|team|band|state|ocean|rate|show|medium|color|rum|flavor|flavour|' +
        'address|equivalent|religion|dummy|blush|work|way|approach|kind|animal',
    Plural: 'films|schools|chemicals|articles|countries|children|approaches',
    Comparative: 'better|earlier',
    Superlative: 'best|earliest|largest',
    PresentTense: 'sounds',
    Value: 'a few',
    Organization: '20th century fox|3m|7-eleven|g8|g12|g20|motel 6|' +
        'vh1|formula1|formule1|bad religion|nine inch nails',
    Copula: 'is|are|was|were|am',
    Date: 'eom|standard time|daylight time|today|tomorrow|yesterday',
    Condition: 'if|unless|notwithstanding',
    PastTense: 'said|had|been|began|came|did|meant|went|taken',
    Gerund: 'going|being|according|resulting|developing|staining',
    Negative: 'not|non|never|no',
    QuestionWord: 'where|why|when|who|whom|whose|what|which' + "how's",
    abbreviations: abbreviation_1.default
};
const lexiconStd = {};
for (let k in zip) {
    const a = zip[k].split('|');
    for (let i = 0; i < a.length; i++) {
        lexiconStd[a[i]] = k;
    }
}
let lexicon = Object.assign(Object.assign({}, lexiconStd), unpack_1.default(_compressed_1.default));
const addToLex = function (o) {
    for (let k in o) {
        if (lexicon[k] === void 0) {
            lexicon[k] = o[k];
        }
    }
};
const ls = [irregular_1.noun.lexicon, irregular_1.verb.lexicon, irregular_1.adjective.lexicon, misc_1.orgWords, number_1.default.lexicon];
ls.forEach((o) => addToLex(o));
lexicon = _build_1.build(lexicon);
lexicon.is = ['Copula', 'PresentTense'];
lexicon.are = ['Copula', 'PresentTense'];
lexicon.was = ['Copula', 'PastTense'];
lexicon['will be'] = ['Copula', 'FutureTense'];
lexicon['close'] = 'Adjective';
lexicon['can'] = 'Modal';
exports.default = {
    lexicon, firstWords: _build_1.firstWords(lexicon),
    periodSuffix: new RegExp(String.raw `\b(${abbreviation_1.default})[.] ?$`, 'i'),
    exclamation: new RegExp(String.raw `\b(${abbreviation_1.exclamations})[!] ?$`, 'i'),
    periodPrefix: new RegExp(String.raw `[.](${abbreviation_1.periodPrefixes})\b$`, 'i'),
    convert: convert_1.default, contraction: contraction_1.default, findContraction: contraction_1.findContraction, dates: date_1.dates, abbreviations: abbreviation_1.default,
    noun: irregular_1.noun, verb: irregular_1.verb, adjective: irregular_1.adjective, number: number_1.default, date: date_1.default, notWords: misc_1.notWords, ofWords: misc_1.ofWords, orgWords: misc_1.orgWords, nGrams: misc_1.nGrams,
    silentTerms: contraction_1.silentTerms, split: contraction_1.split, contractionTags: contraction_1.contractionTags, contractionNeg: contraction_1.contractionNeg, contractionPos: contraction_1.contractionPos,
    corrections: corrections_1.default, possessive: possessive_1.default, condition: condition_1.default
};
//# sourceMappingURL=main.js.map
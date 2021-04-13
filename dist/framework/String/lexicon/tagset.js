"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const C = {
    ADJ: 'Adjective',
    ADV: 'Adverb',
    EXP: 'Expression',
    INF: 'Infinitive',
    PR: 'PresentTense',
    SI: 'Singular',
    PA: 'PastTense',
    PL: 'Plural',
    AC: 'Actor',
    VB: 'Verb',
    NN: 'Noun',
    LN: 'LastName',
    MD: 'Modal',
    CP: 'Copula'
};
exports.ADJ = C.ADJ, exports.ADV = C.ADV, exports.EXP = C.EXP, exports.INF = C.INF, exports.PR = C.PR, exports.SI = C.SI, exports.PA = C.PA, exports.PL = C.PL, exports.AC = C.AC, exports.VB = C.VB, exports.NN = C.NN, exports.LN = C.LN, exports.MD = C.MD, exports.CP = C.CP;
const colors = {
    Noun: 'blue',
    Date: 'red', Value: 'red',
    Verb: 'green', Auxiliary: 'green', Negative: 'green', VerbPhrase: 'green',
    Preposition: 'cyan', Condition: 'cyan', Conjunction: 'cyan', Determiner: 'cyan',
    Adjective: 'magenta',
    Adverb: 'black'
};
const tags = {
    Noun: {},
    Singular: { is: "Noun" },
    Person: { is: "Singular" },
    FirstName: { is: "Person" },
    MaleName: { is: "FirstName" },
    FemaleName: { is: "FirstName" },
    LastName: { is: "Person" },
    Honorific: { is: "Person" },
    Place: { is: "Singular" },
    Country: { is: "Place" },
    City: { is: "Place" },
    Region: { is: "Place" },
    Address: { is: "Place" },
    Organization: { is: "Singular" },
    SportsTeam: { is: "Organization" },
    Company: { is: "Organization" },
    School: { is: "Organization" },
    Plural: { is: "Noun" },
    Uncountable: { is: "Noun" },
    Pronoun: { is: "Noun" },
    Actor: { is: "Noun" },
    Unit: { is: "Noun" },
    Demonym: { is: "Noun" },
    Possessive: { is: "Noun" },
    Verb: { is: 'VerbPhrase' },
    PresentTense: { is: 'Verb' },
    Infinitive: { is: 'PresentTense' },
    Gerund: { is: 'PresentTense' },
    PastTense: { is: 'Verb' },
    PerfectTense: { is: 'Verb' },
    FuturePerfect: { is: 'Verb' },
    Pluperfect: { is: 'Verb' },
    Copula: { is: 'Verb' },
    Modal: { is: 'Verb' },
    Participle: { is: 'Verb' },
    Particle: { is: 'Verb' },
    PhrasalVerb: { is: 'Verb' },
    Value: {},
    Money: {},
    Ordinal: { is: 'Value' },
    Cardinal: { is: 'Value' },
    RomanNumeral: { is: 'Cardinal' },
    Fraction: { is: 'Value' },
    TextValue: { is: 'Value' },
    NumericValue: { is: 'Value' },
    NiceNumber: { is: 'Value' },
    Percent: { is: 'Value' },
    Date: {},
    Month: { is: 'Date', also: 'Singular' },
    WeekDay: { is: 'Date', also: 'Noun' },
    RelativeDay: { is: 'Date' },
    Year: { is: 'Date' },
    Duration: { is: 'Date', also: 'Noun' },
    Time: { is: 'Date', also: 'Noun' },
    Holiday: { is: 'Date', also: 'Noun' },
    Adjective: {},
    Comparable: { is: 'Adjective' },
    Comparative: { is: 'Adjective' },
    Superlative: { is: 'Adjective' },
    NumberRange: { is: 'Contraction' },
    Adverb: {},
    Currency: {},
    Abbreviation: {},
    CommonAbbreviation: { is: 'Abbreviation' },
    Chat: { is: 'Abbreviation' },
    IT: { is: 'Abbreviation' },
    Business: { is: 'Abbreviation' },
    Legal: { is: 'Abbreviation' },
    Photography: { is: 'Abbreviation' },
    Energy: { is: 'Abbreviation' },
    AtMention: { is: 'Noun' },
    HashTag: {}, Determiner: {}, Conjunction: {}, Preposition: {}, QuestionWord: {},
    Expression: {}, Url: {}, PhoneNumber: {}, Emoji: {}, Email: {},
    Condition: {}, VerbPhrase: {}, Auxiliary: {}, Negative: {}, Contraction: {},
    TitleCase: {}, CamelCase: {}, UpperCase: {}, Hyphenated: {}, Acronym: {},
    ClauseEnd: {}, Quotation: {}
};
const conflicts = [
    ['Noun', 'Verb', 'Adjective', 'Adverb', 'Determiner', 'Conjunction', 'Preposition',
        'QuestionWord', 'Expression', 'Url', 'PhoneNumber', 'Email', 'Emoji'],
    ['Person', 'Organization', 'Value', 'Place', 'Actor', 'Demonym', 'Pronoun'],
    ['Plural', 'Singular'],
    ['MaleName', 'FemaleName'],
    ['FirstName', 'LastName', 'Honorific'],
    ['Comparative', 'Superlative'],
    ['Value', 'Verb', 'Adjective'],
    ['Ordinal', 'Cardinal'],
    ['TextValue', 'NumericValue'],
    ['NiceNumber', 'TextValue'],
    ['Ordinal', 'Currency'],
    ['PastTense', 'PresentTense', 'FutureTense'],
    ['Pluperfect', 'Copula', 'Modal', 'Participle', 'Infinitive', 'Gerund', 'FuturePerfect', 'PerfectTense'],
    ['Auxiliary', 'Noun', 'Value'],
    ['Month', 'WeekDay', 'Year', 'Duration', 'Holiday'],
    ['Particle', 'Conjunction', 'Adverb', 'Preposition'],
    ['Date', 'Verb', 'Adjective', 'Person'],
    ['Date', 'Money', 'RomanNumeral', 'Fraction'],
    ['Value', 'Determiner'],
    ['Url', 'Value', 'HashTag', 'PhoneNumber', 'Emoji'],
    ['RomanNumeral', 'Fraction', 'NiceNumber'],
    ['RomanNumeral', 'Money'],
    ['UpperCase', 'TitleCase', 'CamelCase'],
    ['VerbPhrase', 'Noun', 'Adjective']
];
const addChildren = function (tags) {
    const keys = Object.keys(tags);
    keys.forEach((k) => {
        tags[k].downward = [];
        for (let i = 0; i < keys.length; i++) {
            if (tags[keys[i]].is && tags[keys[i]].is === k) {
                tags[k].downward.push(keys[i]);
            }
        }
    });
};
function addConflicts(tags) {
    Object.keys(tags).forEach((k) => {
        tags[k].enemy = {};
        for (let i = 0; i < conflicts.length; i++) {
            let arr = conflicts[i];
            if (arr.indexOf(k) !== -1) {
                arr = arr.filter((a) => a !== k).forEach((e) => { tags[k].enemy[e] = true; });
            }
        }
        tags[k].enemy = Object.keys(tags[k].enemy);
    });
}
;
function addColors(tags) {
    Object.keys(tags).forEach((k) => {
        if (colors[k]) {
            tags[k].color = colors[k];
            return;
        }
        if (tags[k].is && colors[tags[k].is]) {
            tags[k].color = colors[tags[k].is];
            return;
        }
        if (tags[k].is && tags[tags[k].is].color) {
            tags[k].color = tags[tags[k].is].color;
        }
    });
}
;
addChildren(tags);
addConflicts(tags);
addColors(tags);
exports.default = tags;
//# sourceMappingURL=tagset.js.map
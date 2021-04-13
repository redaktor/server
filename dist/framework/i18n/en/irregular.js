"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const irregularNoun_1 = require("./irregularNoun");
const irregularVerb_1 = require("./irregularVerb");
exports.Adverb = {
    toAdjective: {
        idly: 'idle', sporadically: 'sporadic', basically: 'basic', grammatically: 'grammatical',
        alphabetically: 'alphabetical', economically: 'economical', conically: 'conical',
        politically: 'political', vertically: 'vertical', practically: 'practical',
        theoretically: 'theoretical', critically: 'critical', fantastically: 'fantastic',
        mystically: 'mystical', pornographically: 'pornographic', fully: 'full',
        jolly: 'jolly', wholly: 'whole'
    }
};
const Adjective = {
    toAdverb: {
        bad: 'badly', best: 'best', early: 'early', fast: 'fast', good: 'well', hard: 'hard',
        icy: 'icily', idle: 'idly', late: 'late', latter: 'latter', little: 'little',
        long: 'long', low: 'low', male: 'manly', public: 'publicly', simple: 'simply',
        single: 'singly', special: 'especially', straight: 'straight', vague: 'vaguely',
        well: 'well', whole: 'wholly', wrong: 'wrong'
    },
    toComparative: {
        grey: 'greyer', gray: 'grayer', green: 'greener', yellow: 'yellower',
        red: 'redder', good: 'better', well: 'better', bad: 'worse', sad: 'sadder', big: 'bigger'
    },
    toSuperlative: {
        nice: 'nicest', late: 'latest', hard: 'hardest', inner: 'innermost', outer: 'outermost',
        far: 'furthest', worse: 'worst', bad: 'worst', good: 'best', big: 'biggest'
    },
    toNoun: { clean: 'cleanliness', naivety: 'naivety', hurt: 'hurt' },
    toVerb: { red: 'redden', sad: 'sadden', fat: 'fatten' },
    lexicon: {}
};
const combine = (lexicon, tag = 'Adverb') => {
    const o = Adjective[`to${tag}`];
    for (let k in o) {
        lexicon[k] = 'Comparable';
        if (!lexicon[o[k]]) {
            lexicon[o[k]] = tag;
        }
    }
    return lexicon;
};
['Superlative', 'Comparative', 'Adverb', 'Noun', 'Verb'].forEach((tag, i) => {
    const o = Adjective[`to${tag}`];
    if (typeof o === 'object') {
        for (let k in o) {
            Adjective.lexicon[k] = 'Comparable';
            if (!Adjective.lexicon[o[k]]) {
                Adjective.lexicon[o[k]] = tag;
            }
        }
    }
});
exports.noun = irregularNoun_1.default;
exports.verb = irregularVerb_1.default;
exports.adverb = exports.Adverb;
exports.adjective = Adjective;
//# sourceMappingURL=irregular.js.map
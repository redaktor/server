"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const tagset_1 = require("../../lexicon/tagset");
exports.notWords = { 'not': 1 };
exports.ofWords = { 'of': 1 };
exports.orgWords = [
    'administration', 'agence', 'agences', 'agencies', 'agency', 'aircraft', 'airlines',
    'airways', 'army', 'assoc', 'associates', 'association', 'assurance', 'authority',
    'autorite', 'aviation', 'bank', 'banque', 'board', 'boys', 'brands', 'brewery',
    'brotherhood', 'brothers', 'building society', 'bureau', 'cafe', 'caisse', 'capital',
    'care', 'cathedral', 'center', 'central bank', 'centre', 'chemicals', 'choir',
    'chronicle', 'church', 'circus', 'clinic', 'clinique', 'club', 'co', 'coalition',
    'coffee', 'collective', 'college', 'commission', 'committee', 'communications',
    'community', 'company', 'comprehensive', 'computers', 'confederation', 'conference',
    'conseil', 'consulting', 'containers', 'corporation', 'corps', 'council', 'crew',
    'daily news', 'data', 'departement', 'department', 'department store', 'departments',
    'design', 'development', 'directorate', 'division', 'drilling', 'education', 'eglise',
    'electric', 'electricity', 'energy', 'ensemble', 'enterprise', 'enterprises',
    'entertainment', 'estate', 'etat', 'evening news', 'faculty', 'federation', 'financial',
    'fm', 'foundation', 'fund', 'gas', 'gazette', 'girls', 'government', 'group', 'guild',
    'health authority', 'herald', 'holdings', 'hospital', 'hotel', 'hotels', 'inc',
    'industries', 'institut', 'institute', 'institute of technology', 'institutes',
    'insurance', 'international', 'interstate', 'investment', 'investments', 'investors',
    'journal', 'laboratory', 'labs', 'liberation army', 'limited',
    'local authority', 'local health authority', 'machines', 'magazine', 'management',
    'marine', 'marketing', 'markets', 'media', 'memorial', 'mercantile exchange', 'ministere',
    'ministry', 'military', 'mobile', 'motor', 'motors', 'musee', 'museum',
    'news', 'news service', 'observatory', 'office', 'oil', 'optical', 'orchestra',
    'organization', 'partners', 'partnership', "people's party", 'petrol',
    'petroleum', 'pharmacare', 'pharmaceutical', 'pharmaceuticals', 'pizza', 'plc',
    'police', 'polytechnic', 'post', 'power', 'press', 'productions', 'quartet', 'radio',
    'regional authority', 'regional health authority', 'reserve', 'resources', 'restaurant',
    'restaurants', 'savings', 'school', 'securities', 'service', 'services', 'social club',
    'societe', 'society', 'sons', 'standard', 'state police', 'state university',
    'stock exchange', 'subcommittee', 'syndicat', 'systems', 'telecommunications',
    'telegraph', 'television', 'times', 'tribunal', 'tv', 'union', 'university',
    'utilities', 'workers'
].reduce(function (h, k) { h[k] = 'Noun'; return h; }, {});
exports.nGrams = {
    afterWord: {
        i: tagset_1.VB, first: tagset_1.NN, it: tagset_1.VB, there: tagset_1.VB, not: tagset_1.VB, because: tagset_1.NN, if: tagset_1.NN, but: tagset_1.NN, who: tagset_1.VB,
        this: tagset_1.NN, his: tagset_1.NN, when: tagset_1.NN, you: tagset_1.VB, very: tagset_1.ADJ, old: tagset_1.NN, never: tagset_1.VB, before: tagset_1.NN
    },
    beforeWord: {
        there: tagset_1.VB, me: tagset_1.VB, man: tagset_1.ADJ, only: tagset_1.VB, him: tagset_1.VB, were: tagset_1.NN, what: tagset_1.VB, took: tagset_1.NN,
        himself: tagset_1.VB, went: tagset_1.NN, who: tagset_1.NN, jr: 'Person'
    },
    afterPOS: {
        Adjective: tagset_1.NN, Possessive: tagset_1.NN, Determiner: tagset_1.NN, Adverb: tagset_1.VB, Pronoun: tagset_1.VB, Value: tagset_1.NN,
        Ordinal: tagset_1.NN, Modal: tagset_1.VB, Superlative: tagset_1.NN, Demonym: tagset_1.NN, Organization: tagset_1.VB,
        Honorific: 'Person'
    },
    beforePOS: {
        Copula: tagset_1.NN, PastTense: tagset_1.NN, Conjunction: tagset_1.NN, Modal: tagset_1.NN, PluperfectTense: tagset_1.NN,
        PerfectTense: tagset_1.VB
    }
};
const blabla = '(#Conjunction|#Preposition|#Adverb)?';
const allQW = (qw) => {
    return (typeof qw === 'string') ? `${qw}${qw}'s|${qw}'re|${qw}'d|${qw}'ll` :
        (`#QuestionWord #Contraction${(qw === true) ? '' : '?'}`);
};
exports.informalQuestions = [
    (`${allQW('who')} (#Person+|#Organization+|#AtMention+)`),
    (`${allQW('where')} (#Person+|#Place+|#Organization+)$`),
    (`${allQW('when')} (#Date|#Pronoun+|#Noun+|#Singular+|#Plural+)$`),
    (`^${blabla} (what|which) #Noun`),
    (`^${blabla} ${allQW('how')} (#Adjective|#Copula|#Modal|#PastTense)`),
    (`${allQW()} #Modal`),
    (`${allQW()} (#Pronoun|#Noun|#Singular|#Plural|#Gerund)$`),
    (`${allQW()} (#Copula|#Gerund) * !#Infinitive`),
    (`^${blabla} ${allQW(true)} #Modal? #Pronoun #Verb+`),
    (`^${blabla} (#Modal|#PresentTense|#PastTense) #Determiner? #Adjective?
    (#Copula|#Pronoun|#Noun|#Singular|#Plural|#Gerund) * !#Infinitive$`),
    (`^${blabla} ${allQW()} #VerbPhrase #Determiner? #Adjective?
    #Noun+? #VerbPhrase * !#Infinitive$`),
    (`^${blabla} (#Adverb|#Pronoun) (#Modal|#PresentTense|#PastTense) * !#Infinitive$`)
];
//# sourceMappingURL=misc.js.map
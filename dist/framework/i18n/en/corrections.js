"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
function corrections() {
    if (this.has('so')) {
        this.match('so #Adjective').match('so').tag('Adverb', 'so-adv');
        this.match('so #Noun').match('so').tag('Conjunction', 'so-conj');
        this.match('do so').match('so').tag('Noun', 'so-noun');
    }
    if (this.has('(that|which)')) {
        this.match('#Verb #Adverb? #Noun (that|which)').lastTerm.tag('Preposition', 'that-prep');
        this.match('(that|which) #Noun #Verb').firstTerm.tag('Determiner', 'that-determiner');
    }
    if (this.has('#Determiner')) {
        this.match('(the|this) #Verb #Preposition .').term(1).tag('Noun', 'correction-determiner1');
        this.match('(the|those|these) (#Infinitive|#PresentTense|#PastTense)').term(1).tag('Noun', 'correction-determiner2');
        this.match('(a|an) #Gerund').term(1).tag('Adjective', 'correction-a|an');
        this.match('(a|an) #Adjective (#Infinitive|#PresentTense)').term(2).tag('Noun', 'correction-a|an2');
        this.match('(some #Verb #Plural').term(1).tag('Noun', 'correction-determiner6');
        this.match('#Determiner #Adjective$').term(1).tag('Noun', 'the-adj-1');
        this.match('#Determiner #Adjective (#Copula|#PastTense|#Auxiliary)').term(1).tag('Noun', 'the-adj-2');
        this.match('(the|this|those|these) #Adjective #Verb').term(2).tag('Noun', 'the-adj-verb');
        this.match('(the|this|those|these) #Adverb #Adjective #Verb').term(3).tag('Noun', 'correction-determiner4');
        this.match('(the|this|a|an) #Infinitive #Adverb? #Verb').term(1).tag('Noun', 'correction-determiner5');
        this.match('#Determiner #Verb of').term(1).tag('Noun', 'the-verb-of');
        this.match('#Determiner #Noun of #Verb').term(3).tag('Noun', 'noun-of-noun');
    }
    if (this.has('like')) {
        this.match('just like').term(1).tag('Preposition', 'like-preposition');
        this.match('#Noun like #Noun').term(1).tag('Preposition', 'noun-like');
        this.match('#Verb like').term(1).tag('Adverb', 'verb-like');
        this.match('#Adverb like').term(1).tag('Adverb', 'adverb-like');
    }
    if (this.has('#Value')) {
        this.match('half a? #Value').tag('Value', 'half-a-value');
        this.match('#Value and a (half|quarter)').tag('Value', 'value-and-a-half');
        this.match('#Value+ #Currency').tag('Money', 'value-currency').lastTerm.tag('Unit', 'money-unit');
        this.match('#Money and #Money #Currency?').tag('Money', 'money-and-money');
        this.match('1 #Value #PhoneNumber').tag('PhoneNumber', '1-800-Value');
        this.match('#NumericValue #PhoneNumber').tag('PhoneNumber', '(800) PhoneNumber');
    }
    if (this.has('#Noun')) {
        this.match('more #Noun').tag('Noun', 'more-noun');
        this.match('second #Noun').term(0).untag('Unit').tag('Ordinal', 'second-noun');
        this.match('#Noun #Adverb #Noun').term(2).tag('Verb', 'correction');
        this.match('#Noun #Particle').term(1).tag('Preposition', 'repair-noPhrasal');
        this.match('#Noun (&|n) #Noun').tag('Organization', 'Noun-&-Noun');
        this.match('#Noun #Actor').tag('Actor', 'thing-doer');
        this.match('#Possessive #FirstName').term(1).untag('Person', 'possessive-name');
        this.match('(this|that) #Plural').term(1).tag('PresentTense', 'this-verbs');
        if (this.has('#Organization')) {
            this.match('#Organization of the? #TitleCase').tag('Organization', 'org-of-place');
            this.match('#Organization #Country').tag('Organization', 'org-country');
            this.match('(world|global|international|national|#Demonym) #Organization').tag('Organization', 'global-org');
        }
    }
    if (this.has('#Verb')) {
        this.match('still #Verb').term(0).tag('Adverb', 'still-verb');
        this.match('u #Verb').term(0).tag('Pronoun', 'u-pronoun-1');
        this.match('is no #Verb').term(2).tag('Noun', 'is-no-verb');
        this.match('#Verb than').term(0).tag('Noun', 'correction');
        this.match('#Possessive #Verb').term(1).tag('Noun', 'correction-possessive');
        this.match('#Copula #Adjective to #Verb').match('#Adjective to').tag('Verb', 'correction');
        this.match('how (#Copula|#Modal|#PastTense)').term(0).tag('QuestionWord', 'how-question');
        this.match('#Copula #Infinitive #Noun').term(1).tag('Noun', 'is-pres-noun');
        this.match('#Infinitive #Copula').term(0).tag('Noun', 'infinitive-copula');
        this.match('#Verb to #Verb').lastTerm.tag('Noun', 'verb-to-verb');
        let advb = '(#Adverb|not)+?';
        if (this.has(advb)) {
            this.match(`(has|had) ${advb} #PastTense`).not('#Verb$').tag('Auxiliary', 'had-walked');
            this.match(`#Copula ${advb} #Gerund`).not('#Verb$').tag('Auxiliary', 'copula-walking');
            this.match(`(be|been) ${advb} #Gerund`).not('#Verb$').tag('Auxiliary', 'be-walking');
            this.match(`(#Modal|did) ${advb} #Verb`).not('#Verb$').tag('Auxiliary', 'modal-verb');
            this.match(`#Modal ${advb} have ${advb} had ${advb} #Verb`).not('#Verb$').tag('Auxiliary', 'would-have');
            this.match(`(#Modal) ${advb} be ${advb} #Verb`).not('#Verb$').tag('Auxiliary', 'would-be');
            this.match(`(#Modal|had|has) ${advb} been ${advb} #Verb`).not('#Verb$').tag('Auxiliary', 'would-be');
        }
    }
    if (this.has('#Adjective')) {
        this.match('still #Adjective').match('still').tag('Adverb', 'still-advb');
        this.match('#Adjective #PresentTense').term(1).tag('Noun', 'adj-presentTense');
        this.match('will #Adjective').term(1).tag('Verb', 'will-adj');
    }
    if (this.has('#TitleCase')) {
        this.match('#TitleCase (ltd|co|inc|dept|assn|bros)').tag('Organization', 'org-abbrv');
        this
            .match('#TitleCase+ (district|region|province|county|prefecture|municipality|territory|burough|reservation)')
            .tag('Region', 'foo-district');
        this.match('(district|region|province|municipality|territory|burough|state) of #TitleCase').tag('Region', 'district-of-Foo');
    }
    this.match('(west|north|south|east|western|northern|southern|eastern)+ #Place').tag('Region', 'west-norfolk');
    this.match('(foot|feet)').tag('Noun', 'foot-noun');
    this.match('#Value (foot|feet)').term(1).tag('Unit', 'foot-unit');
    this.match('#Conjunction u').term(1).tag('Pronoun', 'u-pronoun-2');
    this.match('(a|an) (#Duration|#Value)').ifNo('#Plural').term(0).tag('Value', 'a-is-one');
    this.match('holy (shit|fuck|hell)').tag('Expression', 'swears-expression');
    this.match('#Determiner (shit|damn|hell)').term(1).tag('Noun', 'swears-noun');
    this.match('(shit|damn|fuck) (#Determiner|#Possessive|them)').term(0).tag('Verb', 'swears-verb');
    this.match('#Copula fucked up?').not('#Copula').tag('Adjective', 'swears-adjective');
    this.match('#Holiday (day|eve)').tag('Holiday', 'holiday-day');
    this.match('(standard|daylight|summer|eastern|pacific|central|mountain) standard? time').tag('Time', 'timezone');
    this.match('#Demonym #Currency').tag('Currency', 'demonym-currency');
    return this;
}
exports.default = corrections;
//# sourceMappingURL=corrections.js.map
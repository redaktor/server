"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const regex_1 = require("../../lexicon/regex");
const tagset_1 = require("../../lexicon/tagset");
const possessiveRegex = /[a-z]s'$/i;
exports.silentTerms = ['am', 'will', 'did'];
exports.contractionNeg = {
    everyone: 'no one', everybody: 'nobody', someone: 'no one',
    somebody: 'nobody', always: 'never'
};
exports.contractionPos = { never: 'always', nothing: 'everything' };
exports.contractionTags = {
    'not': 'Negative', will: tagset_1.VB, would: tagset_1.MD, have: tagset_1.VB, are: tagset_1.CP, is: tagset_1.CP, am: tagset_1.VB
};
exports.contractionIrregular = {
    wanna: ['want', 'to'], gonna: ['going', 'to'], im: ['i', 'am'], alot: ['a', 'lot'],
    dont: ['do', 'not'], dun: ['do', 'not'],
    ive: ['i', 'have'],
    "won't": ['will', 'not'], wont: ['will', 'not'],
    "can't": ['can', 'not'], cant: ['can', 'not'], cannot: ['can', 'not'],
    aint: ['is', 'not'], "ain't": ['is', 'not'], "shan't": ['should', 'not'],
    imma: ['I', 'will'],
    "where'd": ['where', 'did'], whered: ['where', 'did'], "when'd": ['when', 'did'],
    whend: ['when', 'did'], "how'd": ['how', 'did'], howd: ['how', 'did'],
    "what'd": ['what', 'did'], whatd: ['what', 'did'], "let's": ['let', 'us'],
    dunno: ['do', 'not', 'know'], brb: ['be', 'right', 'back'], gtg: ['got', 'to', 'go'],
    irl: ['in', 'real', 'life'], tbh: ['to', 'be', 'honest'], imo: ['in', 'my', 'opinion'],
    til: ['today', 'i', 'learned'], rn: ['right', 'now'], '@': ['at']
};
function findContraction(r) {
    let remain = r.not('#Contraction');
    let m = remain.match('(#Noun|#QuestionWord) (#Copula|did|do|have|had|could|would|will)');
    m.concat(remain.match('(they|we|you|i) have'));
    m.concat(remain.match('i am'));
    m.concat(remain.match('(#Copula|#Modal|do) not'));
    m.list.forEach((ts) => { ts.expanded = true; });
    return m;
}
exports.findContraction = findContraction;
;
function split(t) {
    const allowed = { re: 1, ve: 1, ll: 1, t: 1, s: 1, d: 1, m: 1 };
    let parts = t.text.match(regex_1.regexps.contraction);
    if (parts && parts[1] && allowed[parts[2]] === 1) {
        if (parts[2] === 't' && parts[1].match(/[a-z]n$/)) {
            parts[1] = parts[1].replace(/n$/, '');
            parts[2] = 'n\'t';
        }
        if (t.tags.TitleCase === true) {
            parts[1] = parts[1].replace(/^[a-z]/, (s) => s.toUpperCase());
        }
        return { start: parts[1], end: parts[2] };
    }
    if (possessiveRegex.test(t.text)) {
        return { start: t.normal.replace(/s'?$/, ''), end: '' };
    }
}
exports.split = split;
function contraction() {
    for (let k in exports.contractionIrregular) {
        for (let t = 0; t < this.terms.length; t++) {
            if (this.terms[t].normal === k) {
                this.fixContraction(exports.contractionIrregular[k], t);
                break;
            }
        }
    }
    const isPossessive = (i) => {
        const blacklist = { "that's": 1 };
        const a = [this.terms[i], this.terms[i + 1], this.terms[i + 2]];
        if (a[0].tags.Pronoun || a[0].tags.QuestionWord || blacklist[a[0].normal]) {
            return false;
        }
        if (!a[1]) {
            return true;
        }
        if (a[1].tags.VerbPhrase) {
            return false;
        }
        if (a[1].tags.Noun || (a[1].tags.Adjective && !!a[2] && a[2].tags.Noun)) {
            return true;
        }
        return false;
    };
    for (let i = 0; i < this.terms.length; i++) {
        if (this.terms[i].silentTerm) {
            continue;
        }
        let parts = split(this.terms[i]);
        if (parts && parts.end === 's') {
            if (isPossessive(i)) {
                this.terms[i].tag('#Possessive', 'hard-contraction');
                continue;
            }
            let arr = [parts.start, 'is'];
            this.fixContraction(arr, i);
            i += 1;
        }
    }
    const easy_ends = { ll: 'will', ve: 'have', re: 'are', m: 'am', "n't": 'not' };
    for (let i = 0; i < this.terms.length; i++) {
        if (this.terms[i].silentTerm) {
            continue;
        }
        let parts = split(this.terms[i]);
        if (parts) {
            parts.start = parts.start.toLowerCase();
            if (easy_ends[parts.end]) {
                let arr = [parts.start, easy_ends[parts.end]];
                this.fixContraction(arr, i);
                i += 1;
            }
            if (parts.end === 'd') {
                let a = [this.terms[i + 1], this.terms[i + 2]];
                let arr = [parts.start, 'would'];
                if ((!!a[0] && a[0].tags.PastTense) ||
                    (!!a[1] && a[1].tags.PastTense && a[0].tags.Adverb)) {
                    arr[1] = 'had';
                }
                this.fixContraction(arr, i);
                i += 1;
            }
        }
    }
    return this;
}
exports.default = contraction;
//# sourceMappingURL=contraction.js.map
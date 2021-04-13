"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const miscSearch = ['#Value of #Month'];
const preps = 'in|by|before|for|during|at|on|until|after|of|within|all';
const miscDays = { today: 0, tomorrow: 1, yesterday: -1 };
const weekDays = {
    long: { sunday: 0, monday: 1, tuesday: 2, wednesday: 3, thursday: 4, friday: 5, saturday: 6 },
    short: { sun: 0, mon: 1, tue: 2, tues: 2, wed: 3, weds: 3, thu: 4, thurs: 4, fri: 5, sat: 6 }
};
const months = {
    long: {
        january: 0, february: 1, march: 2, april: 3, may: 4, june: 5, july: 6,
        august: 7, september: 8, october: 9, november: 10, december: 11
    },
    short: {
        jan: 0, feb: 1, febr: 1, mar: 2, apr: 3, may: 4, jun: 5, jul: 6,
        aug: 7, sep: 8, sept: 8, oct: 9, nov: 10, dec: 11
    }
};
exports.dates = { miscSearch, preps, miscDays, weekDays, months };
function date() {
    const tagYear = (v, reason) => {
        v.list.forEach(() => {
            let num = parseInt(this.terms[0].normal, 10);
            if (num && num > 1000 && num < 3000) {
                this.terms[0].tag('Year', reason);
            }
        });
    };
    const tagYearSafer = (v, reason) => {
        v.list.forEach(() => {
            let num = parseInt(this.terms[0].normal, 10);
            if (num && num > 1990 && num < 2030) {
                this.terms[0].tag('Year', reason);
            }
        });
    };
    const thisNext = '(last|next|this|previous|current|upcoming|coming)';
    const sections = '(start|end|middle|starting|ending|midpoint|beginning)';
    const seasons = '(spring|summer|winter|fall|autumn)';
    let people = '(january|april|may|june|summer|autumn|jan|sep)';
    if (this.has(people)) {
        this.match(`#Infinitive #Determiner? #Adjective? #Noun? (to|for) ${people}`).lastTerm.tag('Person', 'ambig-person');
        this.match(`#Infinitive ${people}`).lastTerm.tag('Person', 'infinitive-person');
        this.match(`${people} #PresentTense (to|for)`).firstTerm.tag('Person', 'ambig-active');
        this.match(`${people} #Modal`).firstTerm.tag('Person', 'ambig-modal');
        this.match(`#Modal ${people}`).lastTerm.tag('Person', 'modal-ambig');
        this.match(`(that|with|for) ${people}`).term(1).tag('Person', 'that-month');
        this.match(`#Copula ${people}`).term(1).tag('Person', 'is-may');
        this.match(`${people} #Copula`).term(0).tag('Person', 'may-is');
        this.match(`${people} the? #Value`).term(0).tag('Month', 'person-value');
        this.match(`#Date ${people}`).term(1).tag('Month', 'correction-may');
        this.match(`${people} the? #Value`).firstTerm.tag('Month', 'may-5th');
        this.match(`#Value of ${people}`).lastTerm.tag('Month', '5th-of-may');
        this.match(`${preps} ${people}`).ifNo('#Holiday').term(1).tag('Month', 'preps-month');
        this.match(`(next|this|last) ${people}`).term(1).tag('Month', 'correction-may');
    }
    let verbs = '(may|march)';
    if (this.has(verbs)) {
        this.match(`#Adverb ${verbs}`).lastTerm.tag('Infinitive', 'ambig-verb');
        this.match(`${verbs} #Adverb`).lastTerm.tag('Infinitive', 'ambig-verb');
        this.match(`${preps} ${verbs}`).lastTerm.tag('Month', 'in-month');
        this.match(`(next|this|last) ${verbs}`).lastTerm.tag('Month', 'this-month');
        this.match(`${verbs} the? #Value`).firstTerm.tag('Month', 'march-5th');
        this.match(`#Value of? ${verbs}`).lastTerm.tag('Month', '5th-of-march');
        if (this.has('march')) {
            this.match('march (up|down|back|to|toward)').term(0).tag('Infinitive', 'march-to');
            this.match('#Modal march').term(1).tag('Infinitive', 'must-march');
        }
    }
    if (this.has('sun')) {
        this.match('sun #Date').firstTerm.tag('WeekDay', 'sun-feb');
        this.match('sun the #Ordinal').tag('Date').firstTerm.tag('WeekDay', 'sun-the-5th');
        this.match('#Determiner sun').lastTerm.tag('Singular', 'the-sun');
    }
    if (this.has('sat')) {
        this.match('sat #Date').firstTerm.tag('WeekDay', 'sat-feb');
        this.match(`${preps} sat`).lastTerm.tag('WeekDay', 'sat');
    }
    if (this.has('#Month')) {
        this.match(`#Month #DateRange+`).tag('Date', 'correction-numberRange');
        this.match('#Value of #Month').tag('Date', 'value-of-month');
        this.match('#Cardinal #Month').tag('Date', 'cardinal-month');
        this.match('#Month #Value to #Value').tag('Date', 'value-to-value');
        this.match('#Month the #Value').tag('Date', 'month-the-value');
    }
    this.match('in the (night|evening|morning|afternoon|day|daytime)').tag('Time', 'in-the-night');
    this.match('(#Value|#Time) (am|pm)').tag('Time', 'value-ampm');
    if (this.has('#Value')) {
        this.match('for #Value #Duration').tag('Date', 'for-x-duration');
        this.match('#Value #Abbreviation').tag('Value', 'value-abbr');
        this.match('a #Value').tag('Value', 'a-value');
        this.match('(minus|negative) #Value').tag('Value', 'minus-value');
        this.match('#Value grand').tag('Value', 'value-grand');
        this.match('(half|quarter) #Ordinal').tag('Value', 'half-ordinal');
        this.match('(hundred|thousand|million|billion|trillion) and #Value').tag('Value', 'magnitude-and-value');
        this.match('#Value point #Value').tag('Value', 'value-point-value');
        this.match(`${preps}? #Value #Duration`).tag('Date', 'value-duration');
        this.match('(#WeekDay|#Month) #Value').ifNo('#Money').tag('Date', 'date-value');
        this.match('#Value (#WeekDay|#Month)').ifNo('#Money').tag('Date', 'value-date');
        let vs = this.match('#TextValue #TextValue');
        if (vs.found && vs.has('#Date')) {
            vs.tag('#Date', 'textvalue-date');
        }
        this.match('#Value #Duration #Conjunction').tag('Date', 'val-duration-conjunction');
        this.match('#Value #Duration old').untag('Date', 'val-years-old');
    }
    if (this.has('#Time')) {
        this.match('#Cardinal #Time').tag('Time', 'value-time');
        this.match('(by|before|after|at|@|about) #Time').tag('Time', 'preposition-time');
        this.match('#Time (eastern|pacific|central|mountain)').term(1).tag('Time', 'timezone');
        this.match('#Time (est|pst|gmt)').term(1).tag('Time', 'timezone abbr');
    }
    if (this.has(seasons)) {
        this.match(`${preps}? ${thisNext} ${seasons}`).tag('Date', 'thisNext-season');
        this.match(`the? ${sections} of ${seasons}`).tag('Date', 'section-season');
    }
    if (this.has('#Date')) {
        this.match('#Date the? #Ordinal').tag('Date', 'correction-date');
        this.match(`${thisNext} #Date`).tag('Date', 'thisNext-date');
        this.match('due? (by|before|after|until) #Date').tag('Date', 'by-date');
        this.match('#Date (by|before|after|at|@|about) #Cardinal').not('^#Date').tag('Time', 'date-before-Cardinal');
        this.match('#Date (am|pm)').term(1).untag('Verb').untag('Copula').tag('Time', 'date-am');
        this.match('(last|next|this|previous|current|upcoming|coming|the) #Date').tag('Date', 'next-feb');
        this.match('#Date #Preposition #Date').tag('Date', 'date-prep-date');
        this.match(`the? ${sections} of #Date`).tag('Date', 'section-of-date');
        this.match('#Ordinal #Duration in #Date').tag('Date', 'duration-in-date');
        this.match('(early|late) (at|in)? the? #Date').tag('Time', 'early-evening');
    }
    if (this.has('#Cardinal')) {
        let v = this.match(`#Date #Value #Cardinal`).lastTerm;
        if (v.found) {
            tagYear(v, 'date-value-year');
        }
        v = this.match(`#Date+ #Cardinal`).lastTerm;
        if (v.found) {
            tagYear(v, 'date-year');
        }
        v = this.match(`#Month #Value #Cardinal`).lastTerm;
        if (v.found) {
            tagYear(v, 'month-value-year');
        }
        v = this.match(`#Month #Value to #Value #Cardinal`).lastTerm;
        if (v.found) {
            tagYear(v, 'month-range-year');
        }
        v = this.match(`(in|of|by|during|before|starting|ending|for|year) #Cardinal`).lastTerm;
        if (v.found) {
            tagYear(v, 'in-year');
        }
        v = this.match(`#Cardinal !#Plural`).firstTerm;
        if (v.found) {
            tagYearSafer(v, 'year-unsafe');
        }
    }
    if (this.has('#Date')) {
        let date = this.match('#Date+').splitOn('Clause');
        if (date.has('(#Year|#Time)') === false) {
            date.match('#Value (#Month|#Weekday) #Value').lastTerm.untag('Date');
        }
    }
    return this;
}
exports.default = date;
//# sourceMappingURL=date.js.map
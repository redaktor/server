"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
function possessive() {
    const isPossessive = (x) => {
        const afterWord = /[a-z]s'$/;
        const apostrophe = /[a-z]'s$/;
        const blacklist = { "it's": 1, "that's": 1 };
        let a = [this.get(x), this.get(x + 1)];
        if (!!blacklist[a[0].normal]) {
            return false;
        }
        if (!!afterWord.test(a[0].normal)) {
            return true;
        }
        if (!apostrophe.test(a[0].normal) || !!a[0].tags.Pronoun) {
            return false;
        }
        if (!a[1] || !!a[1].tags.Noun) {
            return true;
        }
        return (a[1].tags.Adjective && this.get(x + 2) && this.get(x + 2).tags.Noun);
    };
    for (let i = 0; i < this.length; i++) {
        if (isPossessive(i)) {
            let t = this.get(i);
            if (!t.tags['Noun']) {
                t.tag('Noun', 'possessive_pass');
            }
            t.tag('Possessive', 'possessive_pass');
        }
    }
    return this;
}
exports.default = possessive;
//# sourceMappingURL=possessive.js.map
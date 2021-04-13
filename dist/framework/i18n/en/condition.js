"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
function condition() {
    const C = 'Condition';
    let m = this.match('#' + C + ' .{1,7} #ClauseEnd');
    if (m.found && m.match('#Comma$')) {
        m.tag(C);
    }
    m = this.match('#' + C + ' .{1,13} #ClauseEnd #Pronoun');
    if (m.found && m.match('#Comma$')) {
        m.not('#Pronoun$').tag(C, 'end-pronoun');
    }
    m = this.match('#' + C + ' .{1,7} then');
    if (m.found) {
        m.not('then$').tag(C, 'cond-then');
    }
    m = this.match('as long as .{1,7} (then|#ClauseEnd)');
    if (m.found) {
        m.not('then$').tag(C, 'as-long-then');
    }
    m = this.match('#Comma #' + C + ' .{1,7} .$');
    if (m.found) {
        m.not('^#Comma').tag(C, 'comma-7-end');
    }
    m = this.match('#' + C + ' .{1,4}$');
    if (m.found) {
        m.tag(C, 'cond-4-end');
    }
    return this;
}
exports.default = condition;
//# sourceMappingURL=condition.js.map
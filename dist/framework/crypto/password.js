"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const main_1 = require("@dojo/framework/i18n/main");
const zxcvbnFn = require("zxcvbn");
const repeat_1 = require("../../framework/String/repeat");
const uuid_1 = require("../../framework/uuid");
const nls_1 = require("./nls/");
function zxcvbnI18n(s) {
    const messages = main_1.getCachedMessages(nls_1.default, main_1.default.locale) || {};
    if (!s.length) {
        return '';
    }
    const id = `zxcvbn_${uuid_1.default(s).split('-')[0]}`;
    return messages[id] || s;
}
function strengthBar(score = 0, max = 5) {
    max = Math.round(max);
    score = Math.round(Math.max(0, Math.min(score, max)));
    return [repeat_1.repeat('█', score), repeat_1.repeat('█', max - score)];
}
exports.strengthBar = strengthBar;
async function strength(password, user_inputs = []) {
    user_inputs = Array.isArray(user_inputs) ? user_inputs : [];
    const messages = await main_1.default(nls_1.default, main_1.default.locale);
    const inputs = user_inputs.concat(['redaktor', 'lorem ipsum', 'dolor']);
    const zxcvbn = zxcvbnFn(password, inputs);
    const score = zxcvbn.score < 4 ? zxcvbn.score : (zxcvbn.guesses_log10 < 16 ? 4 : 5);
    let message = `${messages.yourPW} ${messages.scores} ${score}/5`;
    const bar = strengthBar(score);
    let { suggestions = [], warning = '' } = zxcvbn.feedback;
    warning = zxcvbnI18n(warning);
    suggestions = suggestions.map(zxcvbnI18n);
    warning = (warning.length ? warning : '');
    return { score, message, suggestions, warning, bar, zxcvbn };
}
exports.strength = strength;
//# sourceMappingURL=password.js.map
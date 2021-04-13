"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.oneLetterAcronym = /^[A-Z]\.$/;
exports.noPeriodAcronym = /[A-Z]{3}$/;
exports.periodAcronym = /([A-Z]\.)+[A-Z]?$/;
function isAcronym(s) {
    return !![exports.oneLetterAcronym, exports.noPeriodAcronym, exports.periodAcronym].filter((r) => r.test(s)).length;
}
exports.default = isAcronym;
//# sourceMappingURL=acronym.js.map
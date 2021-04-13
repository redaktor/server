"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const TLD_1 = require("../lexicon/abbreviations/TLD");
const fileExtension_1 = require("../lexicon/abbreviations/fileExtension");
const periodPrefix = new RegExp(`${TLD_1.default}|${fileExtension_1.default}`);
exports.default = periodPrefix;
//# sourceMappingURL=regexPeriodPrefix.js.map
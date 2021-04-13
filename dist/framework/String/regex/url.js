"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const TLD_1 = require("../lexicon/abbreviations/TLD");
exports.urlCheap = /^(https?:\/\/|www\.)\w+\.[a-z]{2,3}/;
exports.urlTLD = new RegExp(`^[\w\.\/]+\.(${TLD_1.default})`);
exports.TLD = new RegExp(`^(${TLD_1.default})`);
function isUrl(s) {
    return !![exports.urlCheap, exports.urlTLD].filter((r) => r.test(s)).length;
}
exports.default = isUrl;
//# sourceMappingURL=url.js.map
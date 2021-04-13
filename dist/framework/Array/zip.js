"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const each_1 = require("../Collection/each");
function zip(a, ...b) {
    const r = [];
    each_1.each(a, (v, i) => r.push([v]) && each_1.each(b, (_v) => { r[i].push(_v[i]); }));
    return r;
}
exports.zip = zip;
function zipWith(a, ...b) {
    const FN = b.pop();
    return each_1.map(a, (v, i) => FN(v, ...each_1.map(b, (_v) => _v[i])));
}
exports.zipWith = zipWith;
function unzip(a) {
    const L = Math.max(...a.map(_a => _a.length));
    return each_1.map(new Array(L), (v, i) => each_1.map(a, (o) => o == null ? void 0 : o[i]), L);
}
exports.unzip = unzip;
function unzipWith(...a) {
    return zipWith(a[0][0], ...[...a[0].slice(1), ...a.slice(1)]);
}
exports.unzipWith = unzipWith;
//# sourceMappingURL=zip.js.map
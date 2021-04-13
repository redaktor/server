"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
function sortObj(o) {
    if (Array.isArray(o)) {
        return o;
    }
    return Object.keys(o).sort().reduce((_o, k) => {
        _o[k] = o[k];
        return _o;
    }, {});
}
function inArr(a, s, i) {
    if (Array.isArray(s)) {
        return !!s.filter((w) => !!inArr(a, w)).length;
    }
    if (s !== s) {
        s = 0;
        a = a.map((_s) => ((_s !== _s) ? 0 : _s));
    }
    if (typeof s === 'object') {
        s = sortObj(s);
        s = JSON.stringify([s]).slice(1, -1);
        a = a.map((_s) => (typeof _s === 'object') ? JSON.stringify([s]).slice(1, -1) : s);
    }
    if (typeof i === 'number') {
        return a.indexOf(s) === i;
    }
    return (i === true) ? a.indexOf(s) : a.indexOf(s) > -1;
}
function inObj(o, s, i) {
    const keys = Object.keys(o);
    const a = keys.map((k) => o[k]);
    const index = inArr(a, s, true);
    return (index > -1) ? keys[index] : void 0;
}
function hasValue(x, s, i) {
    if (typeof x !== 'object') {
        return void 0;
    }
    return (Array.isArray(x) ? inArr(x, s, i) : inObj(x, s, i));
}
exports.default = hasValue;
//# sourceMappingURL=hasValue.js.map
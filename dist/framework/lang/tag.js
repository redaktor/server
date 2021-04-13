"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const symToStringTag = Symbol ? Symbol.toStringTag : void 0;
function getRawTag(v) {
    const isOwn = Reflect.has(v, symToStringTag);
    const tag = v[symToStringTag];
    let unmasked = false;
    try {
        v[symToStringTag] = undefined;
        unmasked = true;
    }
    catch (e) { }
    const r = Object.prototype.toString.call(v);
    if (unmasked) {
        if (isOwn) {
            v[symToStringTag] = tag;
        }
        else {
            delete v[symToStringTag];
        }
    }
    return r;
}
function getTag(v) {
    if (v == null) {
        return v === undefined ? '[object Undefined]' : '[object Null]';
    }
    return (symToStringTag && symToStringTag in Object(v))
        ? getRawTag(v) : Object.prototype.toString.call(v);
}
exports.default = getTag;
//# sourceMappingURL=tag.js.map
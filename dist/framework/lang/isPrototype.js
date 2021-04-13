"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
function isPrototype(v) {
    const CT = !!v && v.constructor;
    return v === ((typeof CT === 'function' && CT.prototype) || Object.prototype);
}
exports.default = isPrototype;
//# sourceMappingURL=isPrototype.js.map
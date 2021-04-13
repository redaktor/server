"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
function isObjectLike(v) { return !!v && typeof v === 'object'; }
exports.isObjectLike = isObjectLike;
function isObject(v) { return isObjectLike(v) || typeof v === 'function'; }
exports.isObject = isObject;
//# sourceMappingURL=isObjectTypes.js.map
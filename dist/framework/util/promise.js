"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const Promise_1 = require("@dojo/framework/shim/Promise");
const main_1 = require("./array/main");
function objectPromiseAll(obj, mapFn) {
    const _keys = Object.keys(obj);
    return Promise_1.default.all(_keys.map(k => mapFn ? mapFn(obj[k], k) : obj[k]))
        .then(result => result.reduce(main_1.toObject(_keys), {}));
}
exports.objectPromiseAll = objectPromiseAll;
;
//# sourceMappingURL=promise.js.map
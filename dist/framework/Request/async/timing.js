"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const ExtensiblePromise_1 = require("./ExtensiblePromise");
function delay(milliseconds) {
    return function (value) {
        return new ExtensiblePromise_1.default(function (resolve) {
            setTimeout(function () {
                resolve(typeof value === 'function' ? value() : value);
            }, milliseconds);
        });
    };
}
exports.delay = delay;
function timeout(milliseconds, reason) {
    const start = Date.now();
    return function (value) {
        if (Date.now() - milliseconds > start) {
            return ExtensiblePromise_1.default.reject(reason);
        }
        if (typeof value === 'function') {
            return ExtensiblePromise_1.default.resolve(value());
        }
        return ExtensiblePromise_1.default.resolve(value);
    };
}
exports.timeout = timeout;
class DelayedRejection extends ExtensiblePromise_1.default {
    constructor(milliseconds, reason) {
        super(() => { });
        return new ExtensiblePromise_1.default(function (resolve, reject) {
            setTimeout(() => {
                reject(reason);
            }, milliseconds);
        });
    }
}
exports.DelayedRejection = DelayedRejection;
//# sourceMappingURL=timing.js.map
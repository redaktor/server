"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const Promise_1 = require("@dojo/framework/shim/Promise");
function getApproximateByteSize(object) {
    let objects = [object];
    let size = 0;
    for (let index = 0; index < objects.length; index++) {
        switch (typeof objects[index]) {
            case 'boolean':
                size += 4;
                break;
            case 'number':
                size += 8;
                break;
            case 'string':
                size += 2 * objects[index].length;
                break;
            case 'object':
                if (Object.prototype.toString.call(objects[index]) !== '[object Array]') {
                    for (let key in objects[index]) {
                        size += 2 * key.length;
                    }
                }
                for (let key in objects[index]) {
                    let processed = false;
                    for (let j = 0; j < objects.length; j++) {
                        if (objects[j] === objects[index][key]) {
                            processed = true;
                            break;
                        }
                    }
                    if (!processed) {
                        objects.push(objects[index][key]);
                    }
                }
        }
    }
    return size;
}
exports.getApproximateByteSize = getApproximateByteSize;
function invokeOrNoop(O, P, args = []) {
    const method = O[P];
    return method ? method.apply(O, args) : undefined;
}
exports.invokeOrNoop = invokeOrNoop;
function normalizeStrategy({ size, highWaterMark = 1 }) {
    return {
        size: size,
        highWaterMark: highWaterMark > 0 ? highWaterMark : 1
    };
}
exports.normalizeStrategy = normalizeStrategy;
function promiseInvokeOrFallbackOrNoop(object, method1, args1, method2, args2 = []) {
    let method;
    try {
        method = object[method1];
    }
    catch (error) {
        return Promise_1.default.reject(error);
    }
    if (!method) {
        return promiseInvokeOrNoop(object, method2, args2);
    }
    if (!args1) {
        args1 = [];
    }
    try {
        return Promise_1.default.resolve(method.apply(object, args1));
    }
    catch (error) {
        return Promise_1.default.reject(error);
    }
}
exports.promiseInvokeOrFallbackOrNoop = promiseInvokeOrFallbackOrNoop;
function promiseInvokeOrNoop(O, P, args = []) {
    let method;
    try {
        method = O[P];
    }
    catch (error) {
        return Promise_1.default.reject(error);
    }
    if (!method) {
        return Promise_1.default.resolve();
    }
    try {
        return Promise_1.default.resolve(method.apply(O, args));
    }
    catch (error) {
        return Promise_1.default.reject(error);
    }
}
exports.promiseInvokeOrNoop = promiseInvokeOrNoop;
//# sourceMappingURL=util.js.map
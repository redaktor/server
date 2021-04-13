"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const iterator_1 = require("@dojo/framework/shim/iterator");
const Promise_1 = require("@dojo/framework/shim/Promise");
require("@dojo/framework/shim/Symbol");
function unwrapPromises(iterable) {
    const unwrapped = [];
    if (iterator_1.isArrayLike(iterable)) {
        for (let i = 0; i < iterable.length; i++) {
            const item = iterable[i];
            unwrapped.push(item instanceof ExtensiblePromise ? item._promise : item);
        }
    }
    else {
        for (const item of iterable) {
            unwrapped.push(item instanceof ExtensiblePromise ? item._promise : item);
        }
    }
    return unwrapped;
}
exports.unwrapPromises = unwrapPromises;
class ExtensiblePromise {
    constructor(executor) {
        this._promise = new Promise_1.default(executor);
    }
    static reject(reason) {
        return new this((resolve, reject) => reject(reason));
    }
    static resolve(value) {
        return new this((resolve, reject) => resolve(value));
    }
    static all(iterable) {
        if (!iterator_1.isArrayLike(iterable) && !iterator_1.isIterable(iterable)) {
            const promiseKeys = Object.keys(iterable);
            return new this((resolve, reject) => {
                Promise_1.default.all(promiseKeys.map((key) => iterable[key])).then((promiseResults) => {
                    const returnValue = {};
                    promiseResults.forEach((value, index) => {
                        returnValue[promiseKeys[index]] = value;
                    });
                    resolve(returnValue);
                }, reject);
            });
        }
        return new this((resolve, reject) => {
            Promise_1.default.all(unwrapPromises(iterable)).then(resolve, reject);
        });
    }
    static race(iterable) {
        return new this((resolve, reject) => {
            Promise_1.default.race(unwrapPromises(iterable)).then(resolve, reject);
        });
    }
    catch(onRejected) {
        return this.then(undefined, onRejected);
    }
    then(onFulfilled, onRejected) {
        const executor = (resolve, reject) => {
            function handler(rejected, valueOrError) {
                const callback = rejected ? onRejected : onFulfilled;
                if (typeof callback === 'function') {
                    try {
                        resolve(callback(valueOrError));
                    }
                    catch (error) {
                        reject(error);
                    }
                }
                else if (rejected) {
                    reject(valueOrError);
                }
                else {
                    resolve(valueOrError);
                }
            }
            this._promise.then(handler.bind(null, false), handler.bind(null, true));
        };
        return new this.constructor(executor);
    }
}
exports.ExtensiblePromise = ExtensiblePromise;
exports.default = ExtensiblePromise;
//# sourceMappingURL=ExtensiblePromise.js.map
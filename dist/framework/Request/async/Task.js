"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const iterator_1 = require("@dojo/framework/shim/iterator");
const ExtensiblePromise_1 = require("./ExtensiblePromise");
function isTask(value) {
    return Boolean(value && typeof value.cancel === 'function' && Array.isArray(value.children) && isThenable(value));
}
exports.isTask = isTask;
function isThenable(value) {
    return value && typeof value.then === 'function';
}
exports.isThenable = isThenable;
class Task extends ExtensiblePromise_1.default {
    constructor(executor, canceler) {
        let superResolve = () => { };
        let superReject = () => { };
        super((resolve, reject) => {
            superResolve = resolve;
            superReject = reject;
        });
        this._state = 1;
        this.children = [];
        this.canceler = () => {
            if (canceler) {
                canceler();
            }
            this._cancel();
        };
        try {
            executor((value) => {
                if (this._state === 3) {
                    return;
                }
                this._state = 0;
                superResolve(value);
            }, (reason) => {
                if (this._state === 3) {
                    return;
                }
                this._state = 2;
                superReject(reason);
            });
        }
        catch (reason) {
            this._state = 2;
            superReject(reason);
        }
    }
    static race(iterable) {
        return new this((resolve, reject) => {
            Promise.race(ExtensiblePromise_1.unwrapPromises(iterable)).then(resolve, reject);
        });
    }
    static reject(reason) {
        return new this((resolve, reject) => reject(reason));
    }
    static resolve(value) {
        return new this((resolve, reject) => resolve(value));
    }
    static all(iterable) {
        return new Task((resolve, reject) => {
            super.all(iterable).then(resolve, reject);
        }, () => {
            if (iterator_1.isArrayLike(iterable)) {
                for (let i = 0; i < iterable.length; i++) {
                    const promiseLike = iterable[i];
                    if (isTask(promiseLike)) {
                        promiseLike.cancel();
                    }
                }
            }
            else if (iterator_1.isIterable(iterable)) {
                for (const promiseLike of iterable) {
                    if (isTask(promiseLike)) {
                        promiseLike.cancel();
                    }
                }
            }
            else {
                Object.keys(iterable).forEach((key) => {
                    const promiseLike = iterable[key];
                    if (isTask(promiseLike)) {
                        promiseLike.cancel();
                    }
                });
            }
        });
    }
    get state() {
        return this._state;
    }
    _cancel(finallyTask) {
        this._state = 3;
        const runFinally = () => {
            try {
                return this._finally && this._finally();
            }
            catch (error) {
            }
        };
        if (this._finally) {
            if (isThenable(finallyTask)) {
                finallyTask = finallyTask.then(runFinally, runFinally);
            }
            else {
                finallyTask = runFinally();
            }
        }
        this.children.forEach(function (child) {
            child._cancel(finallyTask);
        });
    }
    cancel() {
        if (this._state === 1) {
            this.canceler();
        }
    }
    catch(onRejected) {
        return this.then(undefined, onRejected);
    }
    finally(callback) {
        if (this._state === 3) {
            callback();
            return this;
        }
        const task = this.then((value) => Task.resolve(callback()).then(() => value), (reason) => Task.resolve(callback()).then(() => {
            throw reason;
        }));
        task._finally = callback;
        return task;
    }
    then(onFulfilled, onRejected) {
        var task = super.then(function (value) {
            if (task._state === 3) {
                return;
            }
            if (onFulfilled) {
                return onFulfilled(value);
            }
            return value;
        }, function (error) {
            if (task._state === 3) {
                return;
            }
            if (onRejected) {
                return onRejected(error);
            }
            throw error;
        });
        task.canceler = () => {
            if (this._state === 1) {
                this.cancel();
            }
            else {
                task._cancel();
            }
        };
        this.children.push(task);
        return task;
    }
}
exports.Task = Task;
exports.default = Task;
//# sourceMappingURL=Task.js.map
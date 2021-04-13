"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const array = require("@dojo/framework/shim/array");
const iterator_1 = require("@dojo/framework/shim/iterator");
const Promise_1 = require("@dojo/framework/shim/Promise");
function isThenable(value) {
    return value && typeof value.then === 'function';
}
function processValuesAndCallback(items, callback) {
    return Promise_1.default.all(items).then(function (results) {
        const pass = Array.prototype.map.call(results, callback);
        return Promise_1.default.all(pass).then(function (pass) {
            return { values: results, results: pass };
        });
    });
}
function findNextValueIndex(list, offset = -1) {
    offset++;
    for (let length = list.length; offset < length; offset++) {
        if (offset in list) {
            return offset;
        }
    }
    return -1;
}
function findLastValueIndex(list, offset) {
    offset = (offset === undefined ? list.length : offset) - 1;
    for (; offset >= 0; offset--) {
        if (offset in list) {
            return offset;
        }
    }
    return -1;
}
function generalReduce(findNextIndex, items, callback, initialValue) {
    const hasInitialValue = arguments.length > 3;
    return Promise_1.default.all(items).then(function (results) {
        return new Promise_1.default(function (resolve, reject) {
            const list = iterator_1.isArrayLike(items) ? items : results;
            let i;
            function next(currentValue) {
                i = findNextIndex(list, i);
                if (i >= 0) {
                    if (results) {
                        if (currentValue) {
                            const result = callback(currentValue, results[i], i, results);
                            if (isThenable(result)) {
                                result.then(next, reject);
                            }
                            else {
                                next(result);
                            }
                        }
                    }
                }
                else {
                    resolve(currentValue);
                }
            }
            let value;
            if (hasInitialValue) {
                value = initialValue;
            }
            else {
                i = findNextIndex(list);
                if (i < 0) {
                    throw new Error('reduce array with no initial value');
                }
                if (results) {
                    value = results[i];
                }
            }
            next(value);
        });
    });
}
function testAndHaltOnCondition(condition, items, callback) {
    return Promise_1.default.all(items).then(function (results) {
        return new Promise_1.default(function (resolve) {
            let result;
            let pendingCount = 0;
            if (results) {
                for (let i = 0; i < results.length; i++) {
                    result = callback(results[i], i, results);
                    if (result === condition) {
                        return resolve(result);
                    }
                    else if (isThenable(result)) {
                        pendingCount++;
                        result.then(function (result) {
                            if (result === condition) {
                                resolve(result);
                            }
                            pendingCount--;
                            if (pendingCount === 0) {
                                resolve(!condition);
                            }
                        });
                    }
                }
            }
            if (pendingCount === 0) {
                resolve(!condition);
            }
        });
    });
}
function every(items, callback) {
    return testAndHaltOnCondition(false, items, callback);
}
exports.every = every;
function filter(items, callback) {
    return processValuesAndCallback(items, callback).then(function (result) {
        let arr = [];
        if (result && result.results && result.values) {
            for (let i = 0; i < result.results.length; i++) {
                result.results[i] && arr.push(result.values[i]);
            }
        }
        return arr;
    });
}
exports.filter = filter;
function find(items, callback) {
    const list = iterator_1.isArrayLike(items) ? items : array.from(items);
    return findIndex(list, callback).then(function (i) {
        return i !== undefined && i >= 0 ? list[i] : undefined;
    });
}
exports.find = find;
function findIndex(items, callback) {
    return processValuesAndCallback(items, callback).then(function (result) {
        if (result && result.results) {
            for (let i = 0; i < result.results.length; i++) {
                if (result.results[i]) {
                    return i;
                }
            }
        }
        return -1;
    });
}
exports.findIndex = findIndex;
function map(items, callback) {
    return processValuesAndCallback(items, callback).then(function (result) {
        return result ? result.results : null;
    });
}
exports.map = map;
function reduce(items, callback, initialValue) {
    const args = array.from(arguments);
    args.unshift(findNextValueIndex);
    return generalReduce.apply(this, args);
}
exports.reduce = reduce;
function reduceRight(items, callback, initialValue) {
    const args = array.from(arguments);
    args.unshift(findLastValueIndex);
    return generalReduce.apply(this, args);
}
exports.reduceRight = reduceRight;
function series(items, operation) {
    return generalReduce(findNextValueIndex, items, function (previousValue, currentValue, index, array) {
        const result = operation(currentValue, index, array);
        if (isThenable(result)) {
            return result.then(function (value) {
                previousValue.push(value);
                return previousValue;
            });
        }
        previousValue.push(result);
        return previousValue;
    }, []);
}
exports.series = series;
function some(items, callback) {
    return testAndHaltOnCondition(true, items, callback);
}
exports.some = some;
//# sourceMappingURL=iteration.js.map
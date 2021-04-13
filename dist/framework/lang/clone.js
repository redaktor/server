"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const isObjectTypes_1 = require("./isObjectTypes");
const assignValue_1 = require("./assignValue");
const array_1 = require("./copy/array");
const buffer_1 = require("./copy/buffer");
const isPrototype_1 = require("./isPrototype");
const isBuffer_1 = require("./isBuffer");
const each_1 = require("../Collection/each");
const merge_1 = require("../Object/merge");
const keys_1 = require("../Object/keys");
const keysAll_1 = require("../Object/keysAll");
const tag_1 = require("./tag");
const cloneByTag_1 = require("./cloneByTag");
var CLONE_FLAG;
(function (CLONE_FLAG) {
    CLONE_FLAG[CLONE_FLAG["DEEP"] = 1] = "DEEP";
    CLONE_FLAG[CLONE_FLAG["FLAT"] = 2] = "FLAT";
    CLONE_FLAG[CLONE_FLAG["SYMBOL"] = 4] = "SYMBOL";
})(CLONE_FLAG = exports.CLONE_FLAG || (exports.CLONE_FLAG = {}));
function initCloneArray(a) {
    var length = a.length, result = a.constructor(length);
    if (length && typeof a[0] == 'string' && Reflect.has(a, 'index')) {
        result.index = a.index;
        result.input = a.input;
    }
    return result;
}
function initCloneObject(o) {
    return (typeof o.constructor === 'function' && !isPrototype_1.default(o))
        ? Object.create(Reflect.getPrototypeOf(o)) : {};
}
function baseClone(value, bitmask, customizer, key, object, stack) {
    let result;
    const isDeep = (bitmask & CLONE_FLAG.DEEP) == CLONE_FLAG.DEEP;
    const isFlat = (bitmask & CLONE_FLAG.FLAT) == CLONE_FLAG.FLAT;
    const isFull = (bitmask & CLONE_FLAG.SYMBOL) == CLONE_FLAG.SYMBOL;
    if (customizer) {
        result = object ? customizer(value, key, object, stack) : customizer(value);
    }
    if (result !== undefined) {
        return result;
    }
    if (!isObjectTypes_1.isObject(value)) {
        return value;
    }
    var isArr = Array.isArray(value);
    if (isArr) {
        result = initCloneArray(value);
        if (!isDeep) {
            return array_1.default(value, result);
        }
    }
    else {
        var tag = tag_1.default(value), isFunc = tag == '[object Function]' || tag == '[object GeneratorFunction]';
        if (isBuffer_1.default(value)) {
            return buffer_1.default(value, isDeep);
        }
        if (tag == '[object Object]' || tag == '[object Arguments]' || (isFunc && !object)) {
            result = (isFlat || isFunc) ? {} : initCloneObject(value);
            if (!isDeep) {
                return isFlat
                    ? keysAll_1.copySymbolsIn(value, merge_1.assignIn(result, value))
                    : keysAll_1.copySymbols(value, Object.assign(result, value));
            }
        }
        else {
            const cloneableTags = {
                "[object Uint32Array]": 1, "[object Uint16Array]": 1, "[object Uint8ClampedArray]": 1,
                "[object Uint8Array]": 1, "[object Symbol]": 1, "[object String]": 1, "[object Set]": 1,
                "[object RegExp]": 1, "[object Object]": 1, "[object Number]": 1, "[object Map]": 1,
                "[object Int32Array]": 1, "[object Int16Array]": 1, "[object Int8Array]": 1,
                "[object Float64Array]": 1, "[object Float32Array]": 1, "[object Date]": 1,
                "[object Boolean]": 1, "[object DataView]": 1, "[object ArrayBuffer]": 1,
                "[object Array]": 1, "[object Arguments]": 1,
                "[object WeakMap]": false, "[object Function]": false, "[object Error]": false
            };
            if (!cloneableTags[tag]) {
                return object ? value : {};
            }
            result = cloneByTag_1.default(value, tag, isDeep);
        }
    }
    stack || (stack = new Stack());
    var stacked = stack.get(value);
    if (stacked) {
        return stacked;
    }
    stack.set(value, result);
    var keysFunc = isFull ? (isFlat ? keysAll_1.getAllKeysIn : keysAll_1.getAllKeys) : (isFlat ? keys_1.keysIn : keys_1.keys);
    var props = isArr ? undefined : keysFunc(value);
    each_1.each(props || value, (subValue, key) => {
        if (props) {
            key = subValue;
            subValue = value[key];
        }
        assignValue_1.default(result, key, baseClone(subValue, bitmask, customizer, key, value, stack));
    });
    return result;
}
function clone(v) {
    return baseClone(v, CLONE_FLAG.SYMBOL);
}
function cloneWith(v, customizer) {
    customizer = typeof customizer == 'function' ? customizer : undefined;
    return baseClone(v, CLONE_FLAG.SYMBOL, customizer);
}
function cloneDeep(v) {
    return baseClone(v, CLONE_FLAG.DEEP | CLONE_FLAG.SYMBOL);
}
function cloneDeepWith(v, customizer) {
    customizer = typeof customizer == 'function' ? customizer : undefined;
    return baseClone(v, CLONE_FLAG.DEEP | CLONE_FLAG.SYMBOL, customizer);
}
//# sourceMappingURL=clone.js.map
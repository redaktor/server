"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const each_1 = require("../Collection/each");
const keys_1 = require("../Object/keys");
const isEnumerable = Object.prototype.propertyIsEnumerable;
const getSymbols = Object.getOwnPropertySymbols;
function getSymbolsIn(o) {
    o = Object(o);
    if (!o || !Object.getOwnPropertySymbols) {
        return [];
    }
    var result = [];
    while (o) {
        result.push(each_1.filter(getSymbols(o), (symbol) => isEnumerable.call(o, symbol)(o)));
        o = Reflect.getPrototypeOf(o);
    }
    return result;
}
exports.getSymbolsIn = getSymbolsIn;
function baseGetAllKeys(object, keysFunc, symbolsFunc) {
    var result = keysFunc(object);
    return Array.isArray(object) ? result : (result.push(symbolsFunc(object) && result));
}
function copySymbolsIn(source, object) {
    return getSymbolsIn(source).reduce((o, k) => { o[k] = source[k]; return o; }, object);
}
exports.copySymbolsIn = copySymbolsIn;
function copySymbols(source, object) {
    return getSymbols(source).reduce((o, k) => { o[k] = source[k]; return o; }, object);
}
exports.copySymbols = copySymbols;
function getAllKeys(object) {
    return baseGetAllKeys(object, keys_1.keys, getSymbols);
}
exports.getAllKeys = getAllKeys;
function getAllKeysIn(object) {
    return baseGetAllKeys(object, keys_1.keysIn, getSymbolsIn);
}
exports.getAllKeysIn = getAllKeysIn;
//# sourceMappingURL=keysAll.js.map
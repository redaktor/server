"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const has_1 = require("@dojo/framework/has/has");
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
function applyMixins(derivedCtor, baseCtors) {
    baseCtors.forEach(baseCtor => {
        Object.getOwnPropertyNames(baseCtor.prototype).forEach(name => {
            if (name !== 'constructor') {
                derivedCtor.prototype[name] = baseCtor.prototype[name];
            }
        });
    });
}
exports.applyMixins = applyMixins;
function functor(v) {
    return typeof v === "function" ? v : function () { return v; };
}
exports.functor = functor;
function getDottedProperty(object, parts, create = false) {
    var key;
    var i = 0;
    while (object && (key = parts[i++])) {
        if (typeof object !== 'object') {
            return undefined;
        }
        object = key in object ? object[key] : (create ? object[key] = {} : undefined);
    }
    return object;
}
exports.getDottedProperty = getDottedProperty;
function getProperty(object, propertyName, create = false) {
    if (create === void 0) {
        create = false;
    }
    return getDottedProperty(object, propertyName.split('.'), create);
}
exports.getProperty = getProperty;
function exists(name, obj) {
    if (!obj || typeof obj !== 'object') {
        return false;
    }
    return (getProperty(obj, name, false) !== undefined);
}
exports.exists = exists;
function copy(o) {
    try {
        return JSON.parse(JSON.stringify(o));
    }
    catch (e) {
        return o;
    }
}
exports.copy = copy;
function arrToObjByKey(key) {
    return (o, aO) => { o[aO[key]] = aO; return o; };
}
exports.arrToObjByKey = arrToObjByKey;
function eq(value, other) {
    return value === other || (value !== value && other !== other);
}
exports.eq = eq;
function byteLength(v) {
    if (!!(Buffer) && Buffer.isBuffer(v)) {
        return v.length;
    }
    else if (!!(ArrayBuffer) && ArrayBuffer.isView(v)) {
        return v.length;
    }
    else if (typeof v === 'string') {
        if (has_1.default('host-node')) {
            return Buffer.byteLength(v);
        }
        else {
            var s = v.length;
            for (var i = v.length - 1; i >= 0; i--) {
                var code = v.charCodeAt(i);
                if (code > 0x7f && code <= 0x7ff)
                    s++;
                else if (code > 0x7ff && code <= 0xffff)
                    s += 2;
                if (code >= 0xDC00 && code <= 0xDFFF)
                    i--;
            }
            return s;
        }
    }
    else {
        return getApproximateByteSize(v);
    }
}
exports.byteLength = byteLength;
function escapeRegExp(s) {
    return s.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
}
exports.escapeRegExp = escapeRegExp;
function hash(s) {
    if (typeof s != 'string') {
        s = JSON.stringify(s);
    }
    var hash = 0, i, chr, len;
    if (s.length == 0)
        return hash;
    for (i = 0, len = s.length; i < len; i++) {
        chr = s.charCodeAt(i);
        hash = ((hash << 5) - hash) + chr;
        hash |= 0;
    }
    return hash;
}
exports.hash = hash;
//# sourceMappingURL=lang.js.map
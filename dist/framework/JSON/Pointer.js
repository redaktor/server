"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const PatchError_1 = require("./PatchError");
const isInteger_1 = require("../lang/isInteger");
const to_1 = require("../lang/to");
const POINTER_OPTIONS = {
    validate: false,
    protectRoot: true,
    mutateDocument: false
};
class JSONpointer {
    constructor(root = {}, options = POINTER_OPTIONS) {
        this.root = root;
        this.options = options;
        this.options = Object.assign(Object.assign({}, POINTER_OPTIONS), options);
    }
    tokens(pointer = '') {
        return typeof pointer === 'string' ? this.parse(pointer) :
            (Array.isArray(pointer) ? pointer : [to_1.toStr(`/${pointer}`)]);
    }
    has(pointer) {
        return typeof this.get(pointer) !== 'undefined';
    }
    get(pointer) {
        const refTokens = this.tokens(pointer);
        if (!refTokens) {
            return void 0;
        }
        const L = refTokens.length;
        if (!L) {
            return this.root;
        }
        let o = this.root;
        for (var i = 0; i < L; ++i) {
            var tok = refTokens[i];
            if (tok === '#') {
                continue;
            }
            if (typeof o !== 'object' || !(tok in o)) {
                return o;
            }
            o = o[tok];
        }
        return o;
    }
    set(pointer, value, replacing = true) {
        const refTokens = this.tokens(pointer);
        if (!refTokens) {
            return void 0;
        }
        if (this.options.protectRoot && !refTokens.length) {
            throw Error('Cannot set the root object');
        }
        let key = refTokens[0];
        let o = this.root;
        for (var i = 0; i < refTokens.length - 1; ++i) {
            var tok = refTokens[i];
            if (tok === '-' && Array.isArray(o)) {
                tok = `${o.length}`;
            }
            key = refTokens[i + 1];
            if (!(tok in o)) {
                o[tok] = (key.match(/^(\d+|-)$/)) ? [] : {};
            }
            o = o[tok];
        }
        if (Array.isArray(o)) {
            const L = o.length;
            if (key === '-') {
                key = L;
            }
            else {
                if (this.options.validate && !isInteger_1.isIntegerString(key)) {
                    throw new PatchError_1.default('OPERATION_PATH_ILLEGAL_ARRAY_INDEX');
                }
                else if (isInteger_1.isIntegerString(key)) {
                    if (this.options.validate && parseInt(key) > L) {
                        throw new PatchError_1.default('OPERATION_VALUE_OUT_OF_BOUNDS');
                    }
                    key = ~~key;
                }
            }
            if (!replacing) {
                o.splice(~~key, 0, value);
                return this;
            }
        }
        o[key] = value;
        return this;
    }
    remove(pointer) {
        const refTokens = this.tokens(pointer);
        var finalToken = refTokens[refTokens.length - 1];
        if (finalToken === undefined) {
            return void 0;
        }
        const parent = this.get(refTokens.slice(0, -1));
        if (Array.isArray(parent)) {
            var index = +finalToken;
            if (index < parent.length) {
                Array.prototype.splice.call(parent, index, 1);
            }
        }
        else {
            delete parent[finalToken];
        }
        return this;
    }
    dict(descend) {
        var results = {};
        this.walk((value, pointer) => { results[pointer] = value; }, descend);
        return results;
    }
    walk(iterator, descend = function (value) {
        var type = Object.prototype.toString.call(value);
        return type === '[object Object]' || type === '[object Array]';
    }) {
        var refTokens = [];
        const next = (cur) => {
            for (var key in cur) {
                refTokens.push(String(key));
                if (descend(cur[key])) {
                    next(cur[key]);
                }
                else {
                    iterator(cur[key], this.compile(refTokens));
                }
                refTokens.pop();
            }
        };
        (next(this.root));
        return true;
    }
    compile(refTokens) {
        if (refTokens.length === 0) {
            return '';
        }
        return '/' + refTokens.map(this.escape).join('/');
    }
    escape(str) { return escape(str); }
    unescape(str) { return unescape(str); }
    parse(pointer) { return parse(pointer); }
}
exports.JSONpointer = JSONpointer;
function escape(str) {
    return str.toString().replace(/~/g, '~0').replace(/\//g, '~1');
}
exports.escape = escape;
function unescape(str) {
    return str.replace(/~1/g, '/').replace(/~0/g, '~');
}
exports.unescape = unescape;
function parse(pointer) {
    if (typeof pointer !== 'string' || pointer === '') {
        return [];
    }
    if (pointer.charAt(0) !== '/') {
        pointer = `/${pointer}`;
    }
    return pointer.substring(1).split(/\//).map(unescape);
}
exports.parse = parse;
function jsonpointer(obj, pointer, value) {
    const P = new JSONpointer(obj);
    if (typeof pointer === 'string') {
        if (typeof value !== 'undefined') {
            return P.set(pointer, value);
        }
        else {
            return P.get(pointer);
        }
    }
    return P;
}
exports.default = jsonpointer;
//# sourceMappingURL=Pointer.js.map
"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
function parseQueryString(input) {
    const query = {};
    const splits = input.split('&');
    for (let i = 0; i < splits.length; i++) {
        const entry = splits[i];
        const indexOfFirstEquals = entry.indexOf('=');
        let key;
        let value = '';
        if (indexOfFirstEquals >= 0) {
            key = entry.slice(0, indexOfFirstEquals);
            value = entry.slice(indexOfFirstEquals + 1);
        }
        else {
            key = entry;
        }
        key = key ? decodeURIComponent(key) : '';
        value = value ? decodeURIComponent(value) : '';
        if (key in query) {
            query[key].push(value);
        }
        else {
            query[key] = [value];
        }
    }
    return query;
}
class UrlSearchParams {
    constructor(input) {
        let list = {};
        if (input instanceof UrlSearchParams) {
            list = JSON.parse(JSON.stringify(input._list));
        }
        else if (typeof input === 'object') {
            list = {};
            for (const key in input) {
                const value = input[key];
                if (Array.isArray(value)) {
                    list[key] = value.length ? value.slice() : [''];
                }
                else if (value == null) {
                    list[key] = [''];
                }
                else {
                    list[key] = [value];
                }
            }
        }
        else if (typeof input === 'string') {
            list = parseQueryString(input);
        }
        this._list = list;
    }
    append(key, value) {
        if (!this.has(key)) {
            this.set(key, value);
        }
        else {
            const values = this._list[key];
            if (values) {
                values.push(value);
            }
        }
    }
    delete(key) {
        this._list[key] = undefined;
    }
    get(key) {
        if (!this.has(key)) {
            return undefined;
        }
        const value = this._list[key];
        return value ? value[0] : undefined;
    }
    getAll(key) {
        if (!this.has(key)) {
            return undefined;
        }
        return this._list[key];
    }
    has(key) {
        return Array.isArray(this._list[key]);
    }
    keys() {
        const keys = [];
        for (const key in this._list) {
            if (this.has(key)) {
                keys.push(key);
            }
        }
        return keys;
    }
    set(key, value) {
        this._list[key] = [value];
    }
    toString() {
        const query = [];
        for (const key in this._list) {
            if (!this.has(key)) {
                continue;
            }
            const values = this._list[key];
            if (values) {
                const encodedKey = encodeURIComponent(key);
                for (let i = 0; i < values.length; i++) {
                    query.push(encodedKey + (values[i] ? '=' + encodeURIComponent(values[i]) : ''));
                }
            }
        }
        return query.join('&');
    }
}
exports.UrlSearchParams = UrlSearchParams;
exports.default = UrlSearchParams;
//# sourceMappingURL=UrlSearchParams.js.map
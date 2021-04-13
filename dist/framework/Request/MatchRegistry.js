"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
class MatchRegistry {
    constructor(defaultValue) {
        this._defaultValue = defaultValue;
        this._entries = [];
    }
    match(...args) {
        const entries = this._entries ? this._entries.slice(0) : [];
        let entry;
        for (let i = 0; (entry = entries[i]); ++i) {
            if (entry.value && entry.test && entry.test.apply(null, args)) {
                return entry.value;
            }
        }
        if (this._defaultValue !== undefined) {
            return this._defaultValue;
        }
        throw new Error('No match found');
    }
    register(test, value, first) {
        let entries = this._entries;
        let entry = {
            test: test,
            value: value
        };
        entries[first ? 'unshift' : 'push'](entry);
        return {
            destroy: function () {
                this.destroy = function () { };
                let i = 0;
                if (entries && entry) {
                    while ((i = entries.indexOf(entry, i)) > -1) {
                        entries.splice(i, 1);
                    }
                }
                test = value = entries = entry = null;
            }
        };
    }
}
exports.MatchRegistry = MatchRegistry;
exports.default = MatchRegistry;
//# sourceMappingURL=MatchRegistry.js.map
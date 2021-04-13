"use strict";
var _a;
Object.defineProperty(exports, "__esModule", { value: true });
const base_1 = require("./base");
const constants_1 = require("../constants");
const regexStringFormats_1 = require("../../String/regex/regexStringFormats");
class _Object extends base_1.default {
    constructor() {
        super(...arguments);
        this[_a] = { type: 'object' };
    }
    propertyNames(stringSchema) {
        if (constants_1.TYPE_KEY in stringSchema && constants_1.VALUE_KEY in stringSchema) {
            return this.T({ propertyNames: stringSchema[constants_1.VALUE_KEY][0] });
        }
        return this.T({ propertyNames: stringSchema });
    }
    minProperties(min) { return this.T({ minProperties: min }); }
    maxProperties(max) { return this.T({ maxProperties: max }); }
    isRDFstring() {
        return this.T({
            propertyNames: {
                type: 'string',
                pattern: regexStringFormats_1.bcp47.toString().replace(/^[\\/]/, '').replace(/[\\/]$/, '')
            },
            patternProperties: {
                "^.*$": { type: 'string' }
            }
        });
    }
}
_a = constants_1.TYPE_KEY;
exports.default = new _Object();
//# sourceMappingURL=Object.js.map
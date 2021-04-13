"use strict";
var _a;
Object.defineProperty(exports, "__esModule", { value: true });
const base_1 = require("./base");
const constants_1 = require("../constants");
class _Array extends base_1.default {
    constructor() {
        super(...arguments);
        this[_a] = { type: 'array' };
    }
    items(schemaOrSchemas) {
        if (constants_1.TYPE_KEY in schemaOrSchemas && constants_1.VALUE_KEY in schemaOrSchemas) {
            return this.T({ items: schemaOrSchemas[constants_1.VALUE_KEY][0] });
        }
        return this.T({ items: schemaOrSchemas });
    }
    additionalItems(schema) {
        if (constants_1.TYPE_KEY in schema && constants_1.VALUE_KEY in schema) {
            return this.T({ additionalItems: schema[constants_1.VALUE_KEY][0] });
        }
        return this.T({ additionalItems: schema });
    }
    contains(...values) {
        return this.T({
            allOf: values.map((v) => ({ contains: { const: typeof v === 'undefined' ? null : v } }))
        });
    }
    notContains(...values) {
        return this.T({
            not: { enum: values.map((v) => typeof v === 'undefined' ? null : v) }
        });
    }
    containsSome(...values) {
        return this.T({
            contains: { enum: values.map((v) => (typeof v === 'undefined' ? null : v)) }
        });
    }
    unique() { return this.T({ uniqueItems: true }); }
    notEmpty() { return this.T({ minItems: 0 }); }
    minSize(min) { return this.T({ minItems: min }); }
    maxSize(max) { return this.T({ maxItems: max }); }
}
_a = constants_1.TYPE_KEY;
exports.default = new _Array();
//# sourceMappingURL=Array.js.map
"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const decorator_1 = require("../core/decorator");
exports.schemaMin = { "type": "object", "properties": { "_constructor": { "$ref": "#/definitions/constructor1" }, "fetch": { "$ref": "#/definitions/fetch" } }, "additionalProperties": false, "definitions": { "constructor1": { "type": "object", "properties": { "0": { "title": "options" } }, "additionalProperties": false, "required": ["0"] }, "fetch": { "type": "object", "properties": { "0": { "title": "options" } }, "additionalProperties": false, "required": ["0"] } }, "$schema": "http://json-schema.org/draft-07/schema#" };
exports.initializers = {
    fetch: function (...args) { return [void 0]; },
};
exports.default = decorator_1.default(exports.schemaMin, exports.initializers);
//# sourceMappingURL=server.r.js.map
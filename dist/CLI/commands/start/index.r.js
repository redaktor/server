"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const decorator_1 = require("../../../../framework/core/decorator");
exports.schemaMin = { "type": "object", "properties": { "_constructor": { "$ref": "#/definitions/constructor1" }, "run": { "$ref": "#/definitions/run" } }, "additionalProperties": false, "definitions": { "constructor1": { "type": "object", "additionalProperties": false }, "run": { "type": "object", "properties": { "0": { "title": "system" } }, "additionalProperties": false, "required": ["0"] } }, "$schema": "http://json-schema.org/draft-07/schema#" };
exports.initializers = {
    run: function (...args) { return [void 0]; },
};
exports.default = decorator_1.default(exports.schemaMin, exports.initializers);
//# sourceMappingURL=index.r.js.map
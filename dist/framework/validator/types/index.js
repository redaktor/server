"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const Array_1 = require("./Array");
const Boolean_1 = require("./Boolean");
const Number_1 = require("./Number");
const Object_1 = require("./Object");
const String_1 = require("./String");
const Empty_1 = require("./Empty");
exports.PRIMITIVES = {
    array: Array_1.default, boolean: Boolean_1.default, number: Number_1.default, object: Object_1.default, string: String_1.default,
    Array: Array_1.default, Boolean: Boolean_1.default, Number: Number_1.default, Object: Object_1.default, String: String_1.default
};
exports.UNSPECIFIEDS = {
    empty: new Empty_1.default(),
    optional: new Empty_1.Optional()
};
//# sourceMappingURL=index.js.map
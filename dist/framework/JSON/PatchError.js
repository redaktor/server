"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.PATCH_ERROR = {
    SEQUENCE_NOT_AN_ARRAY: `Patch sequence must be an array`,
    OPERATION_NOT_AN_OBJECT: `Operation is not an object`,
    OPERATION_OP_INVALID: `Operation 'op' property is not defined in RFC 6902`,
    OPERATION_PATH_INVALID: `Operation 'path' property is not a string starting with "/"`,
    OPERATION_FROM_REQUIRED: `Operation 'from' property is not present
		(applicable in 'move' and 'copy' operations)`,
    OPERATION_VALUE_REQUIRED: `Operation 'value' property is not present
		(applicable in 'add', 'replace' and 'test' operations)`,
    OPERATION_VALUE_CANNOT_CONTAIN_UNDEFINED: `Operation 'value' cannot contain undefined values`,
    OPERATION_PATH_CANNOT_ADD: `Cannot perform an 'add' operation at the desired path`,
    OPERATION_PATH_UNRESOLVABLE: `Cannot perform the operation at a path that does not exist`,
    OPERATION_FROM_UNRESOLVABLE: `Cannot perform the operation from a path that does not exist`,
    OPERATION_PATH_ILLEGAL_ARRAY_INDEX: `Expected an unsigned base-10 integer value,
		making the new referenced value the array element with the zero-based index`,
    OPERATION_VALUE_OUT_OF_BOUNDS: `The specified index MUST NOT be greater than
		the number of elements in the array`,
    TEST_OPERATION_FAILED: `Test operation failed`
};
class PatchError extends Error {
    constructor(name, message = '', index = 0, operation = {}, tree) {
        super(message || `${exports.PATCH_ERROR[name]} - ${index}: ${JSON.stringify(operation)}`);
        this.name = name;
        this.message = message;
        this.index = index;
        this.operation = operation;
        this.tree = tree;
    }
}
exports.default = PatchError;
//# sourceMappingURL=PatchError.js.map
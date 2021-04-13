"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const hasUndefined_1 = require("../lang/hasUndefined");
const isEqual_1 = require("../lang/isEqual");
const PatchError_1 = require("./PatchError");
const Pointer_1 = require("./Pointer");
const clone_1 = require("./clone");
const PATCH_OPTIONS = {
    validate: true,
    protectRoot: false,
    mutateDocument: false
};
var OP;
(function (OP) {
    OP["add"] = "add";
    OP["remove"] = "remove";
    OP["replace"] = "replace";
    OP["move"] = "move";
    OP["copy"] = "copy";
    OP["test"] = "test";
})(OP || (OP = {}));
exports.JSONpatchOP = OP;
class JSONpatch extends Pointer_1.JSONpointer {
    constructor(root = {}, options = PATCH_OPTIONS) {
        super(root, Object.assign(Object.assign({}, PATCH_OPTIONS), options));
        this.root = root;
        this.options = options;
    }
    as(value, pointer) { return this.set(pointer, value); }
    add(op) { return this.set(op.path, op.value, false); }
    replace(op) { return this.set(op.path, op.value); }
    remove(op) { return super.remove(op.path); }
    copy(op) { return this.set(op.path, this.get(op.from)); }
    move(op) {
        super.remove(op.from);
        return this.set(op.path, this.get(op.from));
    }
    test(op) {
        if (!isEqual_1.default(this.get(op.path), op.value)) {
            throw new PatchError_1.default('TEST_OPERATION_FAILED');
        }
        return this;
    }
    apply(patch, validateOperation = true, mutateDocument = true) {
        if (typeof patch === 'object' && patch.op) {
            patch = [patch];
        }
        if (!Array.isArray(patch)) {
            throw new PatchError_1.default('SEQUENCE_NOT_AN_ARRAY');
        }
        const L = patch.length;
        const isCustomValidate = (typeof validateOperation === 'function');
        let validate;
        if (validateOperation) {
            validate = isCustomValidate ? validateOperation : this.validator.bind(this);
        }
        if (!mutateDocument) {
            this.root = clone_1.default(this.root);
        }
        for (let i = 0; i < L; i++) {
            console.log('do:', patch[i]);
            const valid = !validate || validate(patch[i], i, this.root);
            console.log('valid:', valid);
            valid && this.applyOperation(patch[i], !!validate);
            console.log('->:', this.root);
        }
        return this.root;
    }
    validator(o, index, root = this.root) {
        const patchErr = (type) => new PatchError_1.default(type, '', index, o, this.root);
        if (typeof o !== 'object' || o === null || Array.isArray(o)) {
            throw patchErr('OPERATION_NOT_AN_OBJECT');
        }
        else if (!OP[o.op]) {
            throw patchErr('OPERATION_OP_INVALID');
        }
        else if (typeof o.path !== 'string' || (o.path.indexOf('/') !== 0 && !!o.path.length)) {
            throw patchErr('OPERATION_PATH_INVALID');
        }
        else if (o.op === OP.add || o.op === OP.replace || o.op === OP.test) {
            if (o.value === undefined) {
                throw patchErr('OPERATION_VALUE_REQUIRED');
            }
            if (hasUndefined_1.default(o.value)) {
                throw patchErr('OPERATION_VALUE_CANNOT_CONTAIN_UNDEFINED');
            }
        }
        else if (o.op === OP.move || o.op === OP.copy) {
            if (typeof o.from !== 'string') {
                throw patchErr('OPERATION_FROM_REQUIRED');
            }
            if (!this.has(o.from)) {
                throw patchErr('OPERATION_FROM_UNRESOLVABLE');
            }
        }
        if (o.op === OP.add) {
            const hasParentObj = (typeof this.get(Pointer_1.parse(o.path).slice(0, -1)) === 'object');
            if (!hasParentObj) {
                throw patchErr('OPERATION_PATH_CANNOT_ADD');
            }
        }
        else if (o.op === OP.replace || o.op === OP.remove) {
            if (!this.has(o.path)) {
                throw patchErr('OPERATION_PATH_UNRESOLVABLE');
            }
        }
        return true;
    }
    applyOperation(o, validateOperation) {
        return this[o.op](o, validateOperation);
    }
}
exports.default = JSONpatch;
//# sourceMappingURL=Patch.js.map
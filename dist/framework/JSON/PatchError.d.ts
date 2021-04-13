export declare const PATCH_ERROR: {
    SEQUENCE_NOT_AN_ARRAY: string;
    OPERATION_NOT_AN_OBJECT: string;
    OPERATION_OP_INVALID: string;
    OPERATION_PATH_INVALID: string;
    OPERATION_FROM_REQUIRED: string;
    OPERATION_VALUE_REQUIRED: string;
    OPERATION_VALUE_CANNOT_CONTAIN_UNDEFINED: string;
    OPERATION_PATH_CANNOT_ADD: string;
    OPERATION_PATH_UNRESOLVABLE: string;
    OPERATION_FROM_UNRESOLVABLE: string;
    OPERATION_PATH_ILLEGAL_ARRAY_INDEX: string;
    OPERATION_VALUE_OUT_OF_BOUNDS: string;
    TEST_OPERATION_FAILED: string;
};
export declare type PatchErrorName = keyof typeof PATCH_ERROR;
export default class PatchError extends Error {
    name: PatchErrorName;
    message: string;
    index: number;
    operation: any;
    tree?: any;
    constructor(name: PatchErrorName, message?: string, index?: number, operation?: any, tree?: any);
}

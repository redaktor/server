import { Operation, AddOP, RemoveOP, ReplaceOP, MoveOP, CopyOP, TestOP, Validator, PatchOptions } from './interfaces';
import { JSONpointer, _S } from './Pointer';
declare enum OP {
    add = "add",
    remove = "remove",
    replace = "replace",
    move = "move",
    copy = "copy",
    test = "test"
}
export declare const JSONpatchOP: typeof OP;
export default class JSONpatch extends JSONpointer {
    protected root: any;
    protected options: PatchOptions;
    constructor(root?: any, options?: PatchOptions);
    as(value: any, pointer: _S): this;
    add(op: AddOP<any>): this;
    replace(op: ReplaceOP<any>): this;
    remove(op: RemoveOP | any): any;
    copy(op: CopyOP): this;
    move(op: MoveOP): this;
    test(op: TestOP<any>): this;
    apply<T>(patch: Operation[], validateOperation?: boolean | Validator<T>, mutateDocument?: boolean): any;
    validator(o: Operation, index: number, root?: any): boolean;
    private applyOperation;
}
export {};

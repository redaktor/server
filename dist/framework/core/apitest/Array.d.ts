export default class ARRAY {
    protected _input: any[];
    protected _options: any;
    static test: string;
    isA: string;
    value: any;
    constructor(_input: any[], _options?: any, ...args: any[]);
    filter(fn: any): any[];
    pushIt: any;
    get count(): {
        'TEST': number;
        '2': number;
    };
}

export default class Thing {
    protected _input: any[];
    protected _options: any;
    isA: string;
    constructor(_input: any[], _options?: any, ...args: any[]);
    get testThing(): {
        'TEST': number;
        'THING': number;
    };
}

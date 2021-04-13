export declare class bitArray {
    static concat(a1: number[], a2: number[]): number[];
    static bitLength(a: number[]): number;
    static clamp(a: number[], len: number): number[];
    static partial(len: number, x: number, _end?: 0 | 1): number;
    static getPartial(x: number): number;
    static equal(a: number[], b: number[]): boolean;
    private static _shiftRight;
}
export declare class codecHex {
    static fromBits(arr: number[]): string;
    static toBits(str: string): number[];
}
export declare class codecUtf8String {
    static fromBits(arr: number[]): string;
    static toBits(str: string): any[];
}
export declare class SHA512 {
    constructor(hash?: any);
    static hash(data: number[] | string): any;
    private _h;
    private _buffer;
    private _length;
    blockSize: number;
    reset(): this;
    update(data: number[] | string): this;
    finalize(): any;
    private _init;
    private _initr;
    private _key;
    private _keyr;
    _precompute(): void;
    private _block;
}

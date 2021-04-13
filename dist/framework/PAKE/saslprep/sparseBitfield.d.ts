import { Pager } from "./memoryPager";
export interface BitfieldOptions {
    pageOffset?: number;
    pageSize?: number;
    pages?: Pager;
    trackUpdates?: boolean;
    buffer?: Uint8Array;
}
export declare class Bitfield {
    readonly pageOffset: number;
    readonly pageSize: number;
    readonly pages: Pager;
    byteLength: number;
    length: number;
    private _trackUpdates;
    private _pageMask;
    constructor(opts?: Uint8Array | BitfieldOptions);
    getByte(i: number): number;
    setByte(i: number, b: number): boolean;
    get(i: number): boolean;
    set(i: number, v: boolean): boolean;
    toBuffer(): Uint8Array;
}

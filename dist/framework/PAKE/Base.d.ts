import { BigInteger } from 'jsbn';
export declare class PakeBase {
    static ZERO: BigInteger;
    static ONE: BigInteger;
    protected I: string;
    protected P: string;
    protected s: string | BigInteger;
    protected _state: number;
    constructor();
    get state(): number;
    set state(s: number);
    get UserID(): string;
    protected check(v: any, name: string, isString?: boolean): void;
    protected checks(o: any, areStrings?: boolean): boolean;
    protected put(o: any): any;
    static trimLeadingZeros(s: string): string;
    static randomBytes(byteLength?: number): any;
    static randomByteHex(hexLength?: number): any;
    static toHex(n: BigInteger | number): string;
    static fromHex(s: string): BigInteger;
    static BigInteger(s: string, radix: number): BigInteger;
}

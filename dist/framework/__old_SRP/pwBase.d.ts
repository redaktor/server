import { BigInteger } from 'jsbn';
export declare const rfc5054_2048: {
    N_base10: string;
    g_base10: string;
    k_base16: string;
};
declare enum PWSTATE {
    STEP1 = 0,
    STEP2 = 1,
    STEP3 = 2
}
export declare class pwBase {
    readonly N_base10: string;
    readonly g_base10: string;
    readonly k_base16: string;
    protected I: string;
    protected P: string;
    protected salt: string;
    protected readonly BigIntZero: BigInteger;
    private _state;
    constructor(N_base10?: string, g_base10?: string, k_base16?: string);
    get state(): PWSTATE;
    set state(s: PWSTATE);
    get UserID(): string;
    static PWSTATE: typeof PWSTATE;
    static rfc5054_2048: {
        N_base10: string;
        g_base10: string;
        k_base16: string;
    };
    protected N(): BigInteger;
    protected g(): BigInteger;
    protected k: BigInteger;
    protected H(x: any): any;
    protected trimLeadingZeros(s: string): string;
    static randomByteHex(hexLength?: number): string;
    static toHex(n: any): any;
    static fromHex(s: any): BigInteger;
    static BigInteger(string: any, radix: any): BigInteger;
}
export {};

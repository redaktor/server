import { SRPFORM, SupportedRFC5054Bits, SupportedHashAlgo } from './interfaces';
import { BigInteger } from 'jsbn';
import { PakeBase } from '../Base';
import { ACTIONS } from './constants';
export declare const Errors: {
    Param1: string;
    Param2: string;
    uIsZero: string;
    FormAttributes: string;
    NotForm: string;
    NoAction: string;
    IllegalStateException: string;
    IllegalActionException: string;
    SRP6ExceptionB: string;
    SRP6ExceptionCredentials: string;
};
export declare class Base extends PakeBase {
    readonly group: SupportedRFC5054Bits;
    readonly hash: SupportedHashAlgo;
    protected randomFn: typeof PakeBase.randomByteHex;
    protected randomBytes: typeof PakeBase.randomBytes;
    protected readonly N: BigInteger;
    protected readonly g: BigInteger;
    protected readonly k: BigInteger;
    protected x: BigInteger | null;
    protected v: any;
    protected A: any;
    protected B: any;
    protected S: any;
    protected K: any;
    protected M2: string;
    static hash(...strings: (string | number)[]): string;
    static ACTIONS: typeof ACTIONS;
    constructor(group?: SupportedRFC5054Bits, hash?: SupportedHashAlgo);
    getSessionSecret(deriveKeySalt?: string): any;
    protected encrypt(message: string, key?: string): string;
    protected decrypt(data: string, key?: string): any;
    protected H(...strings: (string | number)[]): string;
    protected checkAB(key: 'A' | 'B'): void;
    protected computeU(Astr: string, Bstr: string): BigInteger;
    static checkForm(form: HTMLFormElement): HTMLFormElement;
    static formResult(form: HTMLFormElement, delPW?: boolean): SRPFORM;
}

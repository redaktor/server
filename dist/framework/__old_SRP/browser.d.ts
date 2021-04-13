import { pwBase } from './pwBase';
export declare class Browser extends pwBase {
    readonly N_base10: string;
    readonly g_base10: string;
    readonly k_base16: string;
    protected x: any;
    protected v: any;
    protected B: any;
    protected A: any;
    private a;
    private u;
    private S;
    private K;
    private M1str;
    constructor(N_base10?: string, g_base10?: string, k_base16?: string);
    step1(identity: string, password: string): void;
    step2(s: string, BB: string): {
        A: any;
        M1: any;
    };
    protected step3(M2: string): boolean;
    getSessionKey(hash: any): any;
    generateRandomSalt(optionalServerSalt?: string): any;
    generateVerifier(salt: string, identity: string, password: string): any;
    private check;
    private checks;
    private generateX;
    private computeSessionKey;
    private randomA;
    private computeU;
}

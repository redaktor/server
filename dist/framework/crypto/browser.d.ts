/// <reference types="node" />
export declare const isNodeJS: string | false;
declare type ENC = 'latin1' | 'hex' | 'base64';
declare type SOB = string | Buffer;
export declare function hmacAlgorithm(algoStr: string, isJWT?: boolean): {
    method: string;
    alg: any;
};
declare class Crypto {
    static randomBytes(size?: number): any;
    static hash(text: SOB, algo: string, out: 'buffer'): Buffer;
    static hash(text: SOB, algo: string, out: ENC): string;
    static hmac(text: SOB, key: string, out: 'buffer', algo?: string): Buffer;
    static hmac(text: SOB, key: string, out: ENC, algo?: string): string;
    static sign(text: SOB, key: string, algo?: string, out?: ENC): any;
    static verify(text: SOB, key: string, algo?: string, signature?: string, out?: ENC): any;
}
export default Crypto;

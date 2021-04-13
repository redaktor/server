interface Cipher {
    start: (ivo: any) => void;
    update: (buffer: any) => void;
    finish: () => void;
    output: {
        toHex: () => string;
    };
}
export interface AES {
    cipher: {
        createCipher: (alg: string, key: any) => Cipher;
        createDecipher: (alg: string, key: any) => Cipher;
    };
    util: any;
}
export declare const aes: AES;
export {};

interface Cipher {
    start: (ivo: any) => void;
    update: (buffer: any) => void;
    finish: () => void;
    output: {
        toHex: () => string;
        getBytes: () => any;
    };
    mode: any;
}
export interface AES {
    cipher: {
        createCipher: (alg: string, key: any) => Cipher;
        createDecipher: (alg: string, key: any) => Cipher;
    };
    util: any;
    pbkdf2: any;
    pkcs5: {
        pbkdf2: any;
    };
}
export declare const aes: AES;
export {};

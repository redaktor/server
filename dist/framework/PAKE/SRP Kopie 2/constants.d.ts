export declare enum ACTION {
    R_REGISTER = 0,
    R_SRP_AUTH = 1,
    R_SRP_EVIDENCE = 2,
    R_SRP_VERIFY = 3,
    R_ID_TOKEN = 4
}
export declare const SRP: {
    '1024': {
        g: number;
        N: string;
    };
    '1536': {
        g: number;
        N: string;
    };
    '2048': {
        g: number;
        N: string;
    };
    '3072': {
        g: number;
        N: string;
    };
    '4096': {
        g: number;
        N: string;
    };
};
export declare const HASH: {
    SHA256: string;
    SHA384: string;
    SHA512: string;
};

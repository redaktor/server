interface JWTFULL {
    header: string;
    payload: string;
    signature: string;
}
declare class jwt {
    static version: string;
    static debug: boolean;
    static encode(payload: any, key: string, method?: string, options?: any): string;
    static decode(token: string, key: string, method?: string, doVerify?: boolean): any;
    static sign(text: string, key: string, method?: string): string;
    static verify(token: JWTFULL, key: string, method?: string): boolean;
    static header(token: string): any;
    static payload(token: string): string;
    static alg(token: string): any;
    static algLength(token: string): number;
    static validTime(timeNr: number): boolean;
}
export default jwt;

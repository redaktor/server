interface HttpsStatusResult {
    authorized: boolean;
    headers: any;
    code: string;
    reason?: string;
}
export declare function checkHTTPS(url: string): Promise<HttpsStatusResult>;
export {};

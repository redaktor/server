export interface SASLprepOptions {
    allowUnassigned?: boolean;
}
export declare function saslprep(input: string, opts?: SASLprepOptions): string;

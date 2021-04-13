/// <reference types="zxcvbn" />
interface StrengthResult {
    score: number;
    suggestions: string[];
    warning: string;
    message: string;
    bar: string[];
    zxcvbn: zxcvbn.ZXCVBNResult;
}
export declare function strengthBar(score?: number, max?: number): string[];
export declare function strength(password: string, user_inputs?: string[]): Promise<StrengthResult>;
export {};

interface CustomReplace {
    [replaceMeByValue: string]: string;
}
interface DeburrOptions {
    unicode?: boolean;
    customReplace?: CustomReplace;
}
interface SlugOptions {
    separator?: string;
    lowercase?: boolean;
    leading?: boolean;
    trailing?: boolean;
    decamelize?: boolean;
    customReplace?: CustomReplace;
}
export declare function deburr(str: string, options?: DeburrOptions): string;
export default function slug(str: string, optionsOrSeparatorStr?: SlugOptions | string): string;
export {};

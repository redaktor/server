import * as _inquirer from 'inquirer';
declare type InquirerNLS = typeof _inquirer & {
    bundle?: any;
};
export declare function inquirerNLS(bundle: any): _inquirer.Inquirer;
export declare const inquirer: InquirerNLS;
export {};

import * as inquirer from 'inquirer';
import { Bundle, Messages } from '@dojo/framework/i18n/main';
import { Server } from '../../PAKE/SRP';
export * from '../../String/tag/log';
export declare type Question = inquirer.Question;
export declare type LogFn = (strings: string | TemplateStringsArray, ...values: any[]) => string;
export interface Config {
    id: string;
    userName: string;
    pjson?: any;
}
export declare class Command {
    static BULLET: string;
    protected configName: string;
    protected prompt: {
        <T>(questions: inquirer.Questions<T>, cb: (answers: T) => any): inquirer.ui.Prompt;
        <T_1>(questions: inquirer.Questions<T_1>): Promise<T_1>;
    };
    protected messages: Messages;
    protected quitting: boolean;
    protected passwordField: {
        type: string;
        mask: string;
    };
    protected settings: Config;
    protected server: Server;
    constructor();
    run(): Promise<void | boolean>;
    protected i18n(bundle: Bundle<any>): Promise<Messages>;
    msg(_id?: string, el?: any, fallback?: string): string;
    choices(...ids: string[]): {
        name: string;
        value: string;
    }[];
    protected reset(): void;
    protected logFn(fn: Function, strings: string | TemplateStringsArray, ...values: any[]): any;
    protected rLog: LogFn;
    protected message: LogFn;
    protected success: LogFn;
    protected warning: LogFn;
    protected warningError: LogFn;
    protected list: LogFn;
    protected input: LogFn;
    protected output: LogFn;
    protected neutral: LogFn;
    protected muted: LogFn;
    protected info: Function;
    protected read(pw?: string, filePath?: string, parseJSON?: boolean): Promise<any>;
    protected write(o: any, pw?: string, filePath?: string, updatedAt?: Date): Promise<any>;
    protected hasConfig(): boolean;
    protected readConfig(pw: string): Promise<any>;
    protected mixinConfig(o: any, pw: string): Promise<any>;
}

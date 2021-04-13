import * as inquirer from 'inquirer';
import { Bundle, Messages } from '@dojo/framework/i18n/main';
export * from '../framework/String/tag/log';
export declare type Question = inquirer.Question;
export declare type LogFn = (strings: string | TemplateStringsArray, ...values: any[]) => string;
export default class Command {
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
    constructor();
    protected exit(): boolean;
    protected i18n(bundle: Bundle<any>): Promise<Messages>;
    msg(_id?: string, el?: any, fallback?: string): string;
    choices(...ids: string[]): {
        name: string;
        value: string;
    }[];
    protected reset(): void;
    protected logFn(fn: Function, strings: string | TemplateStringsArray, ...values: any[]): any;
    protected log: LogFn;
    protected message: LogFn;
    protected success: LogFn;
    protected warning: LogFn;
    protected error: LogFn;
    protected list: LogFn;
    protected input: LogFn;
    protected output: LogFn;
    protected neutral: LogFn;
    protected muted: LogFn;
    protected info: Function;
}

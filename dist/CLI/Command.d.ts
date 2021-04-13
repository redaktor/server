import { Command as BaseCommand, flags as BaseFlags } from '@oclif/command';
import * as Config from '@oclif/config';
import * as inquirer from 'inquirer';
import { Bundle, Messages } from '@dojo/framework/i18n/main';
export * from '../framework/String/tag/log';
export declare type Question = inquirer.Question;
export declare type LogFn = (strings: string | TemplateStringsArray, ...values: any[]) => string;
export declare const flags: typeof BaseFlags;
export interface RedaktorConfig {
    id: string;
    version: string;
    userName: string;
    brand: string;
    debug: boolean;
    configDir: string;
    home: string;
    root: string;
    arch: string;
    platform: string;
    windows: boolean;
    pjson: any;
}
export declare class Command extends BaseCommand {
    argv: string[];
    config: Config.IConfig;
    private configName;
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
    protected redaktor: RedaktorConfig;
    constructor(argv: string[], config: Config.IConfig);
    run(): Promise<void>;
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
    protected read(pw?: string, fileName?: string): Promise<any>;
    protected write(o: any, pw?: string, fileName?: string, updatedAt?: Date): Promise<any>;
    protected hasConfig(): boolean;
    protected readConfig(pw: string): Promise<any>;
    protected mixinConfig(o: any, pw: string): Promise<any>;
}

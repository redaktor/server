import * as inquirer from 'inquirer';
import Command from './Command';
import System from './shared/System';
export * from '../framework/String/tag/log';
export declare type Question = inquirer.Question;
export declare type LogFn = (strings: string | TemplateStringsArray, ...values: any[]) => string;
export default class CLI extends Command {
    protected system: System;
    constructor();
    private startCLI;
    private startServer;
    private setup;
    private setPassword;
    private setDB;
    private setExtendedDB;
    private checkDB;
    private checkSpecialServer;
    protected askPW(): Promise<string>;
    protected checkPW(pw: string): Promise<boolean>;
    protected listCommands(): Promise<void>;
    protected runCommands(): Promise<void>;
}

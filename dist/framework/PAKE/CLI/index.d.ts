import { Command } from './Command';
interface Config {
    [k: string]: string;
}
export declare class Setup extends Command {
    static description: string;
    static examples: string[];
    static args: {
        name: string;
    }[];
    protected inquirer: any;
    private env;
    private pwConfirmedCount;
    private setConfig;
    run(appEnv?: string): Promise<boolean>;
    private getKeys;
    private setup;
    private setPassword;
    protected validatePW(pw?: string): Promise<boolean>;
    protected askPW(pw?: string): Promise<Config>;
    protected checkPW(pw: string): Promise<Config>;
}
export {};

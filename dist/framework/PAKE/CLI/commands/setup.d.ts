import { Command } from '../Command';
export default class Setup extends Command {
    static description: string;
    static examples: string[];
    static flags: {
        help: import("@oclif/parser/lib/flags").IBooleanFlag<void>;
        name: import("@oclif/command/lib/flags").IOptionFlag<string>;
        force: import("@oclif/parser/lib/flags").IBooleanFlag<boolean>;
    };
    static args: {
        name: string;
    }[];
    private pwConfirmedCount;
    run(): Promise<void>;
    private setup;
    private setPassword;
    protected askPW(): Promise<string>;
    protected checkPW(pw: string): Promise<boolean>;
}

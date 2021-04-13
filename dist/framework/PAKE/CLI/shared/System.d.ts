export interface Platform {
    linux: boolean;
    macos: boolean;
    darwin: boolean;
    windows: boolean;
    win32: boolean;
}
export interface Status {
    name: string;
    desc: string;
    root: string;
    user: string;
    install?: number;
    setup?: number;
    firstLogin?: number;
}
export interface Command {
}
interface GlobalConfig {
    [uuid: string]: Status;
}
export declare function onlyNODE(): void;
export declare const BULLET: string;
export default class System {
    private static instance;
    static commands: {};
    static kickstart(): System;
    static getRequiredCommands(): any;
    private readonly _rootDir;
    private readonly _credDir;
    private readonly _config;
    private readonly _id;
    private _modules;
    private _platform;
    private constructor();
    get platform(): Platform;
    get userName(): string;
    get rootDir(): string;
    get id(): any;
    get brand(): any;
    get version(): any;
    get configs(): {
        CLI: any;
        global: GlobalConfig;
    };
    get status(): Status;
    get modules(): {
        npm: string | false;
        yarn: string | false;
    };
    read(pw?: string, fileName?: string): Promise<any>;
    write(o: any, pw?: string, fileName?: string): Promise<any>;
    readConfig(pw: string): Promise<any>;
    mixinConfig(o: any, pw: string): Promise<any>;
    mixinStatus(_status: Status): Promise<any>;
    private get _globalConfig();
    private get _packageJSON();
}
export {};

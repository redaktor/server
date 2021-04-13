import { Messages } from '@dojo/framework/i18n/main';
export declare class CLI {
    private kwArgs?;
    private directory;
    protected providers: any;
    protected providersOK: string[];
    protected providersLeft: string[];
    protected providerKeys: string[];
    protected readonlyKeys: string[];
    protected user: string;
    protected helpPW: boolean;
    protected messages: any;
    quitting: boolean;
    msg(_id?: string, el?: any, fallback?: string): any;
    scanPort(port: number | string, host: string): Promise<unknown>;
    iksu(key: string): any[];
    q: (pw?: string, providerID?: string) => {
        actions: {
            type: string;
            name: string;
            message: any;
            choices: {
                name: any;
                value: string;
                short: any;
            }[];
        }[];
        password: {
            type: string;
            name: string;
            message: any;
            filter: any;
            validate: (pw: any) => any;
        }[];
        passwordSet: ({
            type: string;
            name: string;
            message: any;
            filter: any;
            validate: (strength: any) => string | boolean;
        } | {
            type: string;
            name: string;
            message: any;
            filter: any;
            validate?: undefined;
        })[];
        create: ({
            type: string;
            name: string;
            message: (o: any) => string;
            validate: (value: string, o: any) => any;
        } | {
            type: string;
            name: string;
            message: any;
            choices: () => {
                name: string;
                value: string;
                short: string;
            }[];
            validate?: undefined;
            when?: undefined;
            filter?: undefined;
            default?: undefined;
        } | {
            type: string;
            name: string;
            message: string;
            validate: (value: string) => any;
            when: (o: any) => boolean;
            choices?: undefined;
            filter?: undefined;
            default?: undefined;
        } | {
            type: string;
            name: string;
            message: (o: any) => string;
            choices: any[];
            when: (o: any) => boolean;
            filter: (value: string) => boolean;
            validate?: undefined;
            default?: undefined;
        } | {
            type: string;
            name: string;
            message: (o: any) => string;
            choices: {
                name: any;
                value: string;
                short: any;
            }[];
            when: (o: any) => boolean;
            validate?: undefined;
            filter?: undefined;
            default?: undefined;
        } | {
            type: string;
            name: string;
            message: any;
            default: any;
            filter: (value: string) => string;
            choices?: undefined;
            validate?: undefined;
            when?: undefined;
        })[];
        edit: any[];
        editAdd: ({
            type: string;
            name: string;
            message: (o: any) => string;
            validate: (value: string) => any;
            choices?: undefined;
        } | {
            type: string;
            name: string;
            message: (o: any) => string;
            validate?: undefined;
            choices?: undefined;
        } | {
            type: string;
            name: string;
            message: any;
            choices: any[];
            validate?: undefined;
        })[];
    };
    constructor(kwArgs?: any, directory?: string, providers?: any, providersOK?: string[], providersLeft?: string[], providerKeys?: string[], readonlyKeys?: string[], user?: string, helpPW?: boolean, messages?: any);
    protected _init(messages: Messages): void;
    protected updateProviders(pw?: string): {
        actions: {
            type: string;
            name: string;
            message: any;
            choices: {
                name: any;
                value: string;
                short: any;
            }[];
        }[];
        password: {
            type: string;
            name: string;
            message: any;
            filter: any;
            validate: (pw: any) => any;
        }[];
        passwordSet: ({
            type: string;
            name: string;
            message: any;
            filter: any;
            validate: (strength: any) => string | boolean;
        } | {
            type: string;
            name: string;
            message: any;
            filter: any;
            validate?: undefined;
        })[];
        create: ({
            type: string;
            name: string;
            message: (o: any) => string;
            validate: (value: string, o: any) => any;
        } | {
            type: string;
            name: string;
            message: any;
            choices: () => {
                name: string;
                value: string;
                short: string;
            }[];
            validate?: undefined;
            when?: undefined;
            filter?: undefined;
            default?: undefined;
        } | {
            type: string;
            name: string;
            message: string;
            validate: (value: string) => any;
            when: (o: any) => boolean;
            choices?: undefined;
            filter?: undefined;
            default?: undefined;
        } | {
            type: string;
            name: string;
            message: (o: any) => string;
            choices: any[];
            when: (o: any) => boolean;
            filter: (value: string) => boolean;
            validate?: undefined;
            default?: undefined;
        } | {
            type: string;
            name: string;
            message: (o: any) => string;
            choices: {
                name: any;
                value: string;
                short: any;
            }[];
            when: (o: any) => boolean;
            validate?: undefined;
            filter?: undefined;
            default?: undefined;
        } | {
            type: string;
            name: string;
            message: any;
            default: any;
            filter: (value: string) => string;
            choices?: undefined;
            validate?: undefined;
            when?: undefined;
        })[];
        edit: any[];
        editAdd: ({
            type: string;
            name: string;
            message: (o: any) => string;
            validate: (value: string) => any;
            choices?: undefined;
        } | {
            type: string;
            name: string;
            message: (o: any) => string;
            validate?: undefined;
            choices?: undefined;
        } | {
            type: string;
            name: string;
            message: any;
            choices: any[];
            validate?: undefined;
        })[];
    };
    protected prerequisites(): Promise<unknown>;
    private setPassword;
    protected helpWithPW(): any;
    protected editFull(o: any, id: string, pw: string): Promise<void>;
    protected editAdd(o: any, id: string, pw: string, _o?: any): Promise<void>;
    protected start(o: any, isNew?: boolean, isRepeat?: boolean): any;
}

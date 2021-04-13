declare const _default: {
    locales: {
        de: () => Promise<typeof import("./de")>;
    };
    provider: {
        id: string;
        title: string;
        me: {
            templates: string[];
            target: string;
        };
        verify: {
            meta: {
                userId: string;
            };
        };
        description: string;
        setup: {
            instructions: string;
            key: string;
            secret: string;
            url: string;
            additionalProperties: ({
                type: string;
                name: string;
                message: (this: any) => string[];
                validate: (this: any, value: string) => any;
                when: (o: any) => boolean;
                default?: undefined;
                choices?: undefined;
            } | {
                type: string;
                name: string;
                message: (this: any) => string[];
                default: string;
                validate: (this: any, value: string) => any;
                when: (o: any) => boolean;
                choices?: undefined;
            } | {
                type: string;
                name: string;
                message: (this: any) => string[];
                default: (o: any) => any;
                when: (o: any) => boolean;
                validate?: undefined;
                choices?: undefined;
            } | {
                type: string;
                name: string;
                message: (this: any, o: any) => string;
                choices: (this: any, o: any) => Promise<unknown>;
                default: string;
                when: (o: any) => boolean;
                validate?: undefined;
            })[];
        };
        svg: string;
        subject: string;
        text: string;
        html: string;
    };
};
export default _default;

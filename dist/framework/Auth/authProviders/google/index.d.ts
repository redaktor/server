declare const _default: {
    locales: {
        de: () => Promise<typeof import("./de")>;
        es: () => Promise<typeof import("./es")>;
        fr: () => Promise<typeof import("./fr")>;
        zh: () => Promise<typeof import("./zh")>;
    };
    provider: {
        id: string;
        title: string;
        scope: string;
        authUrl: string;
        accessUrl: string;
        me: {
            templates: string[];
            target: string;
            agent: string;
        };
        verify: {};
        description: string;
        setup: {
            instructions: string;
            key: string;
            secret: string;
            url: string;
        };
        svg: string;
    };
};
export default _default;

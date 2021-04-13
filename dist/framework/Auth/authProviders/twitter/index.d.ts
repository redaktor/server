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
        requestUrl: string;
        authUrl: string;
        accessUrl: string;
        me: {
            templates: string[];
            target: string;
        };
        verify: {
            url: string;
            meta: {
                userId: string;
                userMe: string;
            };
        };
        setUrl: boolean;
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

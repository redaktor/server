declare const _default: {
    locales: {
        de: () => Promise<typeof import("./de")>;
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

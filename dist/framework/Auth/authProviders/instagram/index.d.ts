declare const _default: {
    provider: {
        id: string;
        title: string;
        scope: string;
        authUrl: string;
        accessUrl: string;
        me: {
            templates: string[];
            target: string;
            set: {
                html: (raw: string) => string;
            };
        };
        verify: {
            meta: {
                userId: string;
                userMe: string;
            };
        };
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

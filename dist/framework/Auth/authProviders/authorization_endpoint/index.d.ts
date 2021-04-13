declare const _default: {
    locales: {
        de: () => Promise<typeof import("./de")>;
    };
    provider: {
        id: string;
        title: string;
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

declare const _default: {
    provider: {
        id: string;
        title: string;
        me: {
            templates: string[];
            target: string;
            query: {
                tab: string;
            };
        };
        verify: {
            set: {
                options: (provider: any, oauth: any) => {
                    url: string;
                    responseType: string;
                    oauth: any;
                    query: {
                        order: string;
                        filter: string;
                        site: any;
                        access_token: any;
                        key: any;
                    };
                };
                result: (provider: any, oauth: any) => any;
            };
            meta: {
                userId: string;
                userMe: string;
            };
        };
        setup: {
            instructions: string;
            key: string;
            secret: string;
            additionalProperties: {
                type: string;
                name: string;
                message: (this: any) => any;
                when: (o: any) => boolean;
            }[];
            url: string;
        };
        description: string;
        scope: string;
        authUrl: string;
        accessUrl: string;
        _verifyOptions: (provider: any, oauth: any) => {
            url: string;
            responseType: string;
            oauth: any;
            query: {
                order: string;
                filter: string;
                site: any;
                access_token: any;
                key: any;
            };
        };
        svg: string;
    };
};
export default _default;

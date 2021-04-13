declare const provider: {
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
export default provider;

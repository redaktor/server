import Request from '../../Request';
declare class IndieAuthClient extends Request {
    protected _url: any;
    protected _params: any;
    protected verifyTimeout: number;
    protected el: any;
    protected colors: string[];
    protected sentProgress: any;
    protected messages: {};
    debug: boolean;
    protected _protocol: string;
    protected _version: string;
    protected _type: string;
    _options: any;
    protected s: any;
    _each: (start?: number, end?: number) => any[];
    constructor(_url: any, _params: any, verifyTimeout: number, el: any, colors: string[], sentProgress?: any, messages?: {});
    init(): void;
    hasProgress(): boolean;
    initProgress(): void;
    reorderProgress(): void;
    setProgress(percent: number, sel?: any, barColor?: string): any;
    setStatusText(): void;
    setDividerError(): void;
    iconMessage(msg: string, iconCl?: string, colorCl?: string, isMeta?: boolean): string;
    verifyUI(el: any, error?: any, readyCount?: number): any;
    query(mix: any): any;
    progressSel(ref: string): string;
    verify(cacheBust?: boolean): void;
    verifyFresh(): void;
    gpgForm(res: any): string;
    authUI(el: any): void;
    signIn(el: any): () => void;
}
export default IndieAuthClient;
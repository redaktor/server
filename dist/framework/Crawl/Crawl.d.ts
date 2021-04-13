import * as Puppeteer from 'puppeteer';
export declare class Content {
    protected page: Puppeteer.Page;
    constructor(page: Puppeteer.Page, options: any, depth: number, previousUrl: string);
}
export default Content;

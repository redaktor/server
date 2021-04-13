import LinkService from './link.service';
export default class LinkController {
    private readonly linkService;
    constructor(linkService: LinkService);
    findAll(query: any): Promise<any>;
    create(linkData: any): Promise<import("./link.entity").LinkRO>;
    test(): Promise<[] | import("./link.entity").default[]>;
}

import { Repository } from 'typeorm';
import UrlEntity, { UrlRO, CreatePathBlockDto } from './url.entity';
import BlockEntity from './block.entity';
import HostEntity from './host.entity';
import PathEntity from './path.entity';
import QueryEntity from './query.entity';
import HashEntity from "./hash.entity";
interface UrlQuery {
    tag?: string;
    author?: string;
    favorited?: string;
    order?: any;
    where?: any;
    take?: number;
    skip?: number;
}
export default class UrlService {
    private readonly urlRepository;
    private readonly blockRepository;
    private readonly hostRepository;
    private readonly pathRepository;
    private readonly queryRepository;
    private readonly hashRepository;
    constructor(urlRepository: Repository<UrlEntity>, blockRepository: Repository<BlockEntity>, hostRepository: Repository<HostEntity>, pathRepository: Repository<PathEntity>, queryRepository: Repository<QueryEntity>, hashRepository: Repository<HashEntity>);
    blockedParents(urlData: any): Promise<any[]>;
    create(urlString: string): Promise<UrlRO>;
    pathStatus(blockDto: CreatePathBlockDto): Promise<BlockEntity>;
    findAll(query?: UrlQuery): Promise<any>;
    deleteEmptyRelations(from: any, keys: string | string[], condition?: any): Promise<any>;
    delete(id: number): Promise<any>;
    input(urlString: string): any;
    output(url: UrlEntity): {
        url: string;
    };
    test(): Promise<any>;
}
export {};

import BaseEntity from "../shared/base.entity";
import ObjectEntity from "../object/object.entity";
import HostEntity from "./host.entity";
import AuthEntity from './auth.entity';
import PathEntity from "./path.entity";
import QueryEntity from "./query.entity";
import HashEntity from "./hash.entity";
import BlockEntity from "./block.entity";
export declare class CreateLinkDto {
    href: string;
    preview?: ObjectEntity;
    height?: number;
    width?: number;
    rel?: string;
    hreflang?: string;
    mediaType?: string;
}
export declare class LinkOutput extends BaseEntity {
    href: string;
    protocol: string;
    host: string;
    auth: string | null;
    port: number | null;
    path: string | null;
    hash: string | null;
    query: string | null;
    preview: ObjectEntity | null;
    height: number | null;
    width: number | null;
    rel: string | null;
    hreflang: string | null;
    mediaType: string;
}
export interface LinkRO {
    link: LinkOutput;
}
export declare class QueryFullLinkDto {
    protocol?: string;
    auth?: string;
    host?: string;
    port?: number;
    path?: string;
    query?: string;
    hash?: string;
    preview?: ObjectEntity;
    height?: number;
    width?: number;
    rel?: string;
    hreflang?: string;
    mediaType?: string;
    block?: QueryBlockDto;
}
export declare type QueryLinkDto = CreateLinkDto | QueryFullLinkDto | string;
export declare class QueryBlockDto {
    content?: boolean;
    silence?: boolean;
    media?: boolean;
    reports?: boolean;
    recursive?: boolean;
    blockHost?: boolean;
}
export declare class CreateBlockDto {
    link: LinkOutput;
    content: boolean;
    silence?: boolean;
    media?: boolean;
    reports?: boolean;
    recursive?: boolean;
    blockHost?: boolean;
}
export declare function plainRelations(entity: any): LinkOutput;
export default class LinkEntity extends BaseEntity {
    toLinkOutput(): void;
    href: string;
    preview: ObjectEntity;
    height: number;
    width: number;
    rel: string;
    hreflang: string;
    mediaType: string;
    protocol: string;
    auth: AuthEntity;
    host: HostEntity;
    port: number;
    path: PathEntity;
    query: QueryEntity;
    hash: HashEntity;
    block: BlockEntity;
}

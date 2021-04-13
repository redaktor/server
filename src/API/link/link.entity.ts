import BaseEntity, {
  Entity, Column, ManyToOne, AfterLoad, AfterInsert
} from "../shared/base.entity";
import ObjectEntity from "../object/object.entity";
import HostEntity from "./host.entity";
import AuthEntity from './auth.entity';
import PathEntity from "./path.entity";
import QueryEntity from "./query.entity";
import HashEntity from "./hash.entity";
import BlockEntity from "./block.entity";

export class CreateLinkDto {
  href: string;
  preview?: ObjectEntity; // TODO can be URL // string;
  height?: number;
  width?: number;
  rel?: string;
  hreflang?: string;
  mediaType?: string;
}
export class LinkOutput extends BaseEntity {
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
export class QueryFullLinkDto {
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
export type QueryLinkDto = CreateLinkDto | QueryFullLinkDto | string;

export class QueryBlockDto {
  content?: boolean;
  silence?: boolean;
  media?: boolean;
  reports?: boolean;
  recursive?: boolean;
  blockHost?: boolean;
}
export class CreateBlockDto {
  link: LinkOutput;
  content: boolean;
  silence?: boolean;
  media?: boolean;
  reports?: boolean;
  /* block anything below too */
  recursive?: boolean;
  blockHost?: boolean;
}

export function plainRelations(entity: any): LinkOutput {
  ['host', 'auth', 'path', 'hash', 'query', 'block'].forEach((k) => {
    if (!entity.hasOwnProperty(k) || !entity[k] || typeof entity[k] !== 'object') {
      entity[k] = null
    } else if (entity[k].hasOwnProperty('text')) {
      entity[k] = entity[k].text
    }
  })
  return entity
}

// mediaType - MIME Media Type
// name - xsd:string | rdf:langString

// rel - [RFC5988] or [HTML5] Link Relation |
// preview - Link | Object
// hreflang - [BCP47] Language Tag
// height | width - xsd:nonNegativeInteger
@Entity('link')
export default class LinkEntity extends BaseEntity {
    @AfterInsert()
    @AfterLoad()
    toLinkOutput() {
      if (!this.host) {return}
      this.href = `${this.protocol}//${this.auth ? this.auth.text+'@' : ''}${this.host.text}` +
      `${this.port ? ':'+this.port : ''}${this.path ? '/'+this.path.text : ''}` +
      `${this.query ? '?'+this.query.text : ''}${this.hash ? '#'+this.hash.text : ''}`;
      plainRelations(this);
    }
    href: string;

    @ManyToOne(type => ObjectEntity)
    preview: ObjectEntity;

    @Column({ nullable: true })
    height: number;

    @Column({ nullable: true })
    width: number;

    @Column({ nullable: true, default: 'noopener noreferrer' })
    rel: string;

    @Column({ nullable: true })
    hreflang: string;

    @Column({ nullable: true, default: 'text/html'})
    mediaType: string;

    @Column({ nullable: true, default: 'https' })
    protocol: string;

    @ManyToOne(type => AuthEntity)
    auth: AuthEntity;

    @ManyToOne(type => HostEntity)
    host: HostEntity;

    @Column({type: 'smallint', nullable: true}) // @Any(number.isPositive().max(65535))
    port: number;

    @ManyToOne(type => PathEntity)
    path: PathEntity;

    @ManyToOne(type => QueryEntity)
    query: QueryEntity;

    @ManyToOne(type => HashEntity)
    hash: HashEntity;

    @ManyToOne(type => BlockEntity, { eager: true })
    block: BlockEntity;
}

import BaseEntity, {
  Entity, Column, JoinColumn, ManyToMany, Index, Tree, TreeParent
} from '../shared/base.entity';
import { Any, object } from '../../framework/validator';

import LinkEntity from '../link/link.entity';
import ContentEntity from '../object/content.entity';


export class CreatePermissionDto {
  id: string;
  name: string;
  @Any(object.isRDFstring())
  contentMap?: {[k:string]: string};
  parent?: PermissionEntity;
  enabled?: boolean;
}

@Entity('permission')
@Tree("nested-set")
export default class PermissionEntity extends BaseEntity {
  /** Provides the globally unique identifier for an Object or Link. */
  @Index({ unique: true })
  @Column()
  id: string;

  /** a simple, human-readable plain-text name for the permission */
  @Column()
  name: string;

  @Column({ default: true })
  enabled: boolean;

  /** Body: The content representation of the Object encoded as a JSON string
  * (use mediaType, defaults to HTML). */
  //@Column('text')
  //content: string;
  /** Multilanguage content representation of the Object encoded as a JSON string
  * (mediaType, default HTML). */
  /* FIXME ISSUE EXISTS /w3c/activitystreams/issues/443 */
  @Any(object.isRDFstring())
  @ManyToMany(type => ContentEntity)
  @JoinColumn()
  contentMap: ContentEntity[];

  /** Indicates one or more entities for which this object
  * is considered a response. */
  @TreeParent()
  parent: PermissionEntity;
}

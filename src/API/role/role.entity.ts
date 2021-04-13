import BaseEntity, { Entity, Column, JoinColumn, ManyToMany, Index } from '../shared/base.entity';
import PermissionEntity from '../permission/permission.entity';
import { Any, object } from '../../framework/validator';

import LinkEntity from '../link/link.entity';
import ContentEntity from '../object/content.entity';


export class CreateRoleDto {
  id: string;
  name: string;
  order: number;
  @Any(object.isRDFstring())
  contentMap?: {[k:string]: string};
}

@Entity('role')
export default class RoleEntity extends BaseEntity {
  /** Provides the globally unique identifier for an Object or Link. */
  @Index({ unique: true })
  @Column()
  id: string;

  /** a simple, human-readable plain-text name for the role */
  @Column()
  name: string;

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

  @ManyToMany(type => PermissionEntity)
  @JoinColumn()
  permissions: PermissionEntity[];
}

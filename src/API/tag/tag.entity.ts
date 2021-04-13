import BaseEntity, { Entity, Column } from '../shared/base.entity';
export interface TagsRO {
  tags: TagEntity[];
}

@Entity('tag')
export default class TagEntity extends BaseEntity {
  @Column()
  tag: string;
}

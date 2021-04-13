import BaseEntity from '../shared/base.entity';
export interface TagsRO {
    tags: TagEntity[];
}
export default class TagEntity extends BaseEntity {
    tag: string;
}

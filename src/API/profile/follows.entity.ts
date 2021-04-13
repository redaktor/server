import BaseEntity, { Entity, Column } from '../shared/base.entity';

@Entity('follows')
export default class FollowsEntity extends BaseEntity {
  @Column()
  followerId: number;
  @Column()
  followingId: number;
}

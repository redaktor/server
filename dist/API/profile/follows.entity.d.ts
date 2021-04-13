import BaseEntity from '../shared/base.entity';
export default class FollowsEntity extends BaseEntity {
    followerId: number;
    followingId: number;
}

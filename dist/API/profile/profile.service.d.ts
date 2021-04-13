import { Repository } from 'typeorm';
import { DeepPartial } from 'typeorm/common/DeepPartial';
import { ApRO, ProfileRO } from './profile.controller';
import UserEntity from '../user/user.entity';
import FollowsEntity from "./follows.entity";
export default class ProfileService {
    private readonly userRepository;
    private readonly followsRepository;
    constructor(userRepository: Repository<UserEntity>, followsRepository: Repository<FollowsEntity>);
    findAll(): Promise<UserEntity[]>;
    findOne(options?: DeepPartial<UserEntity>): Promise<ProfileRO | undefined>;
    findAP(options?: DeepPartial<UserEntity>): Promise<ApRO | undefined>;
    findProfile(id: number, followingUsername: string): Promise<ProfileRO | undefined>;
    follow(followerEmail: string, username: string): Promise<ProfileRO | undefined>;
    unFollow(followerEmail: string, username: string): Promise<ProfileRO | undefined>;
}

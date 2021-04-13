import { BadRequestException, Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { DeepPartial } from 'typeorm/common/DeepPartial';
import * as faker from 'faker';
import { getPort } from '../shared/port.util';
import { ApRO, ProfileRO, ProfileData } from './profile.controller';
import UserEntity from '../user/user.entity';
import FollowsEntity from "./follows.entity";
let [fakeName, fakeUsername, fakeSummary] = [
  faker.name.findName(),
  faker.internet.userName(),
  faker.company.catchPhrase()
];

@Injectable()
export default class ProfileService {
  constructor(
    @InjectRepository(UserEntity)
    private readonly userRepository: Repository<UserEntity>,
    @InjectRepository(FollowsEntity)
    private readonly followsRepository: Repository<FollowsEntity>
  ) {}

  async findAll(): Promise<UserEntity[]> {
    return await this.userRepository.find();
  }

  async findOne(options?: DeepPartial<UserEntity>): Promise<ProfileRO | undefined> {
    const user = await this.userRepository.findOne(options);
    if (user) {
      delete user.id;
      delete user.password;
      return {profile: user};
    }
  }

  async findAP(options?: DeepPartial<UserEntity>): Promise<ApRO | undefined> {
    const user = await this.userRepository.findOne(options);
    if (user) {
      delete user.id;
      delete user.password;
      const port = await getPort();
      const preferredUsername = user.username || fakeUsername;
      const id = `http://localhost:${port}/${preferredUsername}`;
      const name = fakeName; // TODO
      const summary = user.bio || fakeSummary;
      return {
        "@context": "https://www.w3.org/ns/activitystreams",
        type: "Person",
        id,
        name,
        summary,
        preferredUsername,
        inbox: `${id}/inbox/`,
        outbox: `${id}/outbox/`,
        followers: `${id}/followers/`,
        following: `${id}/following/`,
        liked: `${id}/liked/`
      }

      //return {...getFakeProfile(),

      //return {profile: user};
    }
  }

  async findProfile(id: number, followingUsername: string): Promise<ProfileRO | undefined> {
    const _profile = await this.userRepository.findOne( {username: followingUsername});
    if(!_profile) return;
    let profile: ProfileData = {
      username: _profile.username,
      bio: _profile.bio,
      image: _profile.image
    };
    const follows = await this.followsRepository.findOne( {followerId: id, followingId: _profile.id});
    profile.following = !!follows;
    return {profile};
  }

  async follow(followerEmail: string, username: string): Promise<ProfileRO | undefined> {
    if (!followerEmail || !username) {
      throw new BadRequestException('Follower mail and username not provided.');
    }

    const followingUser = await this.userRepository.findOne({username});
    const followerUser = await this.userRepository.findOne({mail: followerEmail});
    if (!!followingUser && !!followerUser) {
      if (followingUser.mail === followerEmail) {
        throw new BadRequestException('FollowerEmail and FollowingId cannot be equal.');
      }
      const _follows = await this.followsRepository.findOne( {followerId: followerUser.id, followingId: followingUser.id});
      if (!_follows) {
        const follows = new FollowsEntity();
        follows.followerId = followerUser.id;
        follows.followingId = followingUser.id;
        await this.followsRepository.save(follows);
      }
      let profile = {
        username: followingUser.username,
        bio: followingUser.bio,
        image: followingUser.image,
        following: true
      };
      return {profile}
    }
  }

  async unFollow(followerEmail: string, username: string): Promise<ProfileRO | undefined> {
    if (!followerEmail || !username) {
      throw new BadRequestException('FollowerId and username not provided.');
    }
    const followingUser = await this.userRepository.findOne({username});
    const followerUser = await this.userRepository.findOne({mail: followerEmail});

    if (!!followingUser && !!followerUser) {
      if (followingUser.id === followerUser.id) {
        throw new BadRequestException('FollowerId and FollowingId cannot be equal.');
      }
      await this.followsRepository.delete({
        followerId: followerUser.id,
        followingId: followingUser.id
      });
      let profile: ProfileData = {
        username: followingUser.username,
        bio: followingUser.bio,
        image: followingUser.image,
        following: false
      };
      return {profile};
    }
  }

}

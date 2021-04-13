"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const tslib_1 = require("tslib");
const common_1 = require("@nestjs/common");
const typeorm_1 = require("@nestjs/typeorm");
const typeorm_2 = require("typeorm");
const faker = require("faker");
const port_util_1 = require("../shared/port.util");
const user_entity_1 = require("../user/user.entity");
const follows_entity_1 = require("./follows.entity");
let [fakeName, fakeUsername, fakeSummary] = [
    faker.name.findName(),
    faker.internet.userName(),
    faker.company.catchPhrase()
];
let ProfileService = class ProfileService {
    constructor(userRepository, followsRepository) {
        this.userRepository = userRepository;
        this.followsRepository = followsRepository;
    }
    async findAll() {
        return await this.userRepository.find();
    }
    async findOne(options) {
        const user = await this.userRepository.findOne(options);
        if (user) {
            delete user.id;
            delete user.password;
            return { profile: user };
        }
    }
    async findAP(options) {
        const user = await this.userRepository.findOne(options);
        if (user) {
            delete user.id;
            delete user.password;
            const port = await port_util_1.getPort();
            const preferredUsername = user.username || fakeUsername;
            const id = `http://localhost:${port}/${preferredUsername}`;
            const name = fakeName;
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
            };
        }
    }
    async findProfile(id, followingUsername) {
        const _profile = await this.userRepository.findOne({ username: followingUsername });
        if (!_profile)
            return;
        let profile = {
            username: _profile.username,
            bio: _profile.bio,
            image: _profile.image
        };
        const follows = await this.followsRepository.findOne({ followerId: id, followingId: _profile.id });
        profile.following = !!follows;
        return { profile };
    }
    async follow(followerEmail, username) {
        if (!followerEmail || !username) {
            throw new common_1.BadRequestException('Follower mail and username not provided.');
        }
        const followingUser = await this.userRepository.findOne({ username });
        const followerUser = await this.userRepository.findOne({ mail: followerEmail });
        if (!!followingUser && !!followerUser) {
            if (followingUser.mail === followerEmail) {
                throw new common_1.BadRequestException('FollowerEmail and FollowingId cannot be equal.');
            }
            const _follows = await this.followsRepository.findOne({ followerId: followerUser.id, followingId: followingUser.id });
            if (!_follows) {
                const follows = new follows_entity_1.default();
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
            return { profile };
        }
    }
    async unFollow(followerEmail, username) {
        if (!followerEmail || !username) {
            throw new common_1.BadRequestException('FollowerId and username not provided.');
        }
        const followingUser = await this.userRepository.findOne({ username });
        const followerUser = await this.userRepository.findOne({ mail: followerEmail });
        if (!!followingUser && !!followerUser) {
            if (followingUser.id === followerUser.id) {
                throw new common_1.BadRequestException('FollowerId and FollowingId cannot be equal.');
            }
            await this.followsRepository.delete({
                followerId: followerUser.id,
                followingId: followingUser.id
            });
            let profile = {
                username: followingUser.username,
                bio: followingUser.bio,
                image: followingUser.image,
                following: false
            };
            return { profile };
        }
    }
};
ProfileService = tslib_1.__decorate([
    common_1.Injectable(),
    tslib_1.__param(0, typeorm_1.InjectRepository(user_entity_1.default)),
    tslib_1.__param(1, typeorm_1.InjectRepository(follows_entity_1.default)),
    tslib_1.__metadata("design:paramtypes", [typeorm_2.Repository,
        typeorm_2.Repository])
], ProfileService);
exports.default = ProfileService;
//# sourceMappingURL=profile.service.js.map
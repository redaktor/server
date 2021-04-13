"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const tslib_1 = require("tslib");
const ipfs_1 = require("../../ipfs");
const request_util_1 = require("../shared/request.util");
const port_util_1 = require("../shared/port.util");
const common_1 = require("@nestjs/common");
const typeorm_1 = require("@nestjs/typeorm");
const typeorm_2 = require("typeorm");
const object_entity_1 = require("./object.entity");
const user_entity_1 = require("../user/user.entity");
const follows_entity_1 = require("../profile/follows.entity");
const slug_1 = require("../../../framework/String/slug");
const uuid_1 = require("../../../framework/uuid");
let ObjectService = class ObjectService {
    constructor(objectRepository, userRepository, followsRepository) {
        this.objectRepository = objectRepository;
        this.userRepository = userRepository;
        this.followsRepository = followsRepository;
    }
    async create(id, objectData) {
        const author = await this.userRepository.findOne(id);
        let object = Object.assign(new object_entity_1.default(), { tagList: [], comments: [] }, objectData);
        object.slug = this.slugify(objectData.title);
        object = await this.objectRepository.save(object);
        if (!!author) {
            if (Array.isArray(author.objects)) {
                author.objects.push(object);
            }
            else {
                author.objects = [object];
            }
            await this.userRepository.save(author);
            const PORT = await port_util_1.getFriendsPort();
            const actor = await request_util_1.default(`http://localhost:${PORT}/profiles/APusername`);
            const { inbox } = JSON.parse(actor);
            console.log('AP inbox!', inbox);
            const filesAdded = await ipfs_1.default.add({
                '@context': 'https://www.w3.org/ns/activitystreams',
                type: 'Note',
                name: object.title,
                content: object.body,
                published: object.published,
                to: [inbox]
            });
            const { path, hash } = filesAdded[0];
            console.log('HASH', hash);
            const req = await request_util_1.default(`${inbox}`, {
                type: 'Create',
                actor: `http://localhost:${PORT}/${author.id}`,
                object: `https://gateway.ipfs.io/ipfs/${hash}/`
            });
            console.log('Added file:', path, 'hash:', hash, 'post to:', inbox, 'REQ', req);
            return { object };
        }
    }
    async update(slug, objectData) {
        let toUpdate = await this.objectRepository.findOne({ slug }, { relations: ['author'] });
        let updated = Object.assign(toUpdate, objectData);
        const object = await this.objectRepository.save(updated);
        return { object };
    }
    async delete(slug) {
        return await this.objectRepository.delete({ slug });
    }
    async findAll(query) {
        const qb = await typeorm_2.getRepository(object_entity_1.default)
            .createQueryBuilder('object')
            .leftJoinAndSelect('object.author', 'author');
        qb.where("1 = 1");
        if ('tag' in query) {
            qb.andWhere("object.tagList LIKE :tag", { tag: `%${query.tag}%` });
        }
        if ('author' in query) {
            const author = await this.userRepository.findOne({ name: query.author });
            if (!!author) {
                qb.andWhere("object.author.id = :id", { id: author.id });
            }
        }
        if ('favorited' in query) {
            const author = await this.userRepository.findOne({ name: query.favorited });
            if (!!author) {
                if (!author.favorites) {
                    author.favorites = [];
                }
                const ids = author.favorites.map(el => el.id);
                qb.andWhere("object.author.id IN (:ids)", { ids });
            }
        }
        qb.orderBy('object.published', 'DESC');
        if ('limit' in query) {
            qb.limit(query.limit);
        }
        if ('offset' in query) {
            qb.offset(query.offset);
        }
        const objectsCount = await qb.getCount();
        const objects = await qb.getMany();
        return { objects, objectsCount };
    }
    async findFeed(id, query) {
        const _follows = await this.followsRepository.find({ followerId: id });
        if (!_follows.length) {
            return { objects: [], objectsCount: 0 };
        }
        const ids = _follows.map(el => el.followingId);
        const qb = await typeorm_2.getRepository(object_entity_1.default)
            .createQueryBuilder('object')
            .where('object.author.id IN (:ids)', { ids });
        qb.orderBy('object.published', 'DESC');
        const objectsCount = await qb.getCount();
        if ('limit' in query) {
            qb.limit(query.limit);
        }
        if ('offset' in query) {
            qb.offset(query.offset);
        }
        const objects = await qb.getMany();
        return { objects, objectsCount };
    }
    async findOne(where) {
        const object = await this.objectRepository.findOne(where, { relations: ['author'] });
        return !!object ? { object } : void 0;
    }
    async addComment(id, slug, commentData) {
        const author = await this.userRepository.findOne(id);
        let object = await this.objectRepository.findOne({ slug });
        const comment = new CommentEntity();
        comment.body = commentData.body;
        if (!author || !object)
            return;
        if (Array.isArray(author.comments)) {
            author.comments.push(comment);
        }
        else {
            author.comments = [comment];
        }
        object.comments.push(comment);
        await this.commentRepository.save(comment);
        object = await this.objectRepository.save(object);
        return { comment: Object.assign(Object.assign({}, comment), { author }) };
    }
    async deleteComment(slug, id) {
        let object = await this.objectRepository.findOne({ slug });
        const comment = await this.commentRepository.findOne(id);
        if (!object || !comment)
            return;
        const deleteIndex = object.comments.findIndex(_comment => _comment.id === comment.id);
        if (deleteIndex >= 0) {
            const deleteComments = object.comments.splice(deleteIndex, 1);
            await this.commentRepository.delete(deleteComments[0].id);
            object = await this.objectRepository.save(object);
        }
        return { object };
    }
    async favorite(userId, slug) {
        let object = await this.objectRepository.findOne({ slug }, { relations: ['author'] });
        const user = await this.userRepository.findOne(userId, { relations: ['favorites'] });
        if (!object || !user)
            return;
        const { id } = object;
        const isNewFavorite = user.favorites.findIndex((_object) => {
            return _object.id === id;
        }) < 0;
        if (isNewFavorite) {
            user.favorites.push(object);
            object.favorited = true;
            object.favoritesCount++;
            await this.userRepository.save(user);
            object = await this.objectRepository.save(object);
        }
        return { object };
    }
    async unFavorite(userId, slug) {
        let object = await this.objectRepository.findOne({ slug }, { relations: ['author'] });
        const user = await this.userRepository.findOne(userId, { relations: ['favorites'] });
        if (!object || !user)
            return;
        const { id } = object;
        const deleteIndex = user.favorites.findIndex((_object) => {
            return _object.id === id;
        });
        if (deleteIndex >= 0) {
            user.favorites.splice(deleteIndex, 1);
            object.favoritesCount--;
            object.favorited = false;
            await this.userRepository.save(user);
            object = await this.objectRepository.save(object);
        }
        return { object };
    }
    async findComments(slug) {
        const object = await this.objectRepository.findOne({ slug }, { relations: ['author'] });
        if (!object)
            return;
        const qb = await typeorm_2.getRepository(CommentEntity)
            .createQueryBuilder('comment')
            .leftJoinAndSelect('comment.author', 'author')
            .where("1 = 1")
            .andWhere("comment.object.id = :id", { id: object.id })
            .orderBy('comment.published', 'DESC');
        const commentsCount = await qb.getCount();
        const comments = await qb.getMany();
        return { comments, commentsCount };
    }
    slugify(title) {
        return `${slug_1.default(title)}-${uuid_1.default()}`;
    }
};
ObjectService = tslib_1.__decorate([
    common_1.Injectable(),
    tslib_1.__param(0, typeorm_1.InjectRepository(object_entity_1.default)),
    tslib_1.__param(1, typeorm_1.InjectRepository(user_entity_1.default)),
    tslib_1.__param(2, typeorm_1.InjectRepository(follows_entity_1.default)),
    tslib_1.__metadata("design:paramtypes", [typeorm_2.Repository,
        typeorm_2.Repository,
        typeorm_2.Repository])
], ObjectService);
exports.default = ObjectService;
//# sourceMappingURL=object.service.js.map
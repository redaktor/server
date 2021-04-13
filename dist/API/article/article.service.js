"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const tslib_1 = require("tslib");
const request_util_1 = require("../shared/request.util");
const port_util_1 = require("../shared/port.util");
const common_1 = require("@nestjs/common");
const typeorm_1 = require("@nestjs/typeorm");
const typeorm_2 = require("typeorm");
const article_entity_1 = require("./article.entity");
const comment_entity_1 = require("./comment.entity");
const user_entity_1 = require("../user/user.entity");
const follows_entity_1 = require("../profile/follows.entity");
const slug_1 = require("../../../framework/String/slug");
const uuid_1 = require("../../../framework/uuid");
let ArticleService = class ArticleService {
    constructor(articleRepository, commentRepository, userRepository, followsRepository) {
        this.articleRepository = articleRepository;
        this.commentRepository = commentRepository;
        this.userRepository = userRepository;
        this.followsRepository = followsRepository;
    }
    async create(id, articleData) {
        const author = await this.userRepository.findOne(id);
        let article = Object.assign(new article_entity_1.default(), { tagList: [], comments: [] }, articleData);
        article.slug = this.slugify(articleData.title);
        article = await this.articleRepository.save(article);
        if (!!author) {
            if (Array.isArray(author.articles)) {
                author.articles.push(article);
            }
            else {
                author.articles = [article];
            }
            await this.userRepository.save(author);
            const PORT = await port_util_1.getFriendsPort();
            const actor = await request_util_1.default(`http://localhost:${PORT}/profiles/APusername`);
            const { inbox } = JSON.parse(actor);
            console.log('AP inbox!', inbox);
            return { article };
        }
    }
    async update(slug, articleData) {
        let toUpdate = await this.articleRepository.findOne({ slug }, { relations: ['author'] });
        let updated = Object.assign(toUpdate, articleData);
        const article = await this.articleRepository.save(updated);
        return { article };
    }
    async delete(slug) {
        return await this.articleRepository.delete({ slug });
    }
    async findAll(query) {
        const qb = await typeorm_2.getRepository(article_entity_1.default)
            .createQueryBuilder('article')
            .leftJoinAndSelect('article.author', 'author');
        qb.where("1 = 1");
        if ('tag' in query) {
            qb.andWhere("article.tagList LIKE :tag", { tag: `%${query.tag}%` });
        }
        if ('author' in query) {
            const author = await this.userRepository.findOne({ username: query.author });
            if (!!author) {
                qb.andWhere("article.author.id = :id", { id: author.uid });
            }
        }
        if ('favorited' in query) {
            const author = await this.userRepository.findOne({ username: query.favorited });
            if (!!author) {
                if (!author.favorites) {
                    author.favorites = [];
                }
                const ids = author.favorites.map(el => el.uid);
                qb.andWhere("article.author.id IN (:ids)", { ids });
            }
        }
        qb.orderBy('article.published', 'DESC');
        if ('limit' in query) {
            qb.limit(query.limit);
        }
        if ('offset' in query) {
            qb.offset(query.offset);
        }
        const articlesCount = await qb.getCount();
        const articles = await qb.getMany();
        return { articles, articlesCount };
    }
    async findFeed(id, query) {
        const _follows = await this.followsRepository.find({ followerId: id });
        if (!_follows.length) {
            return { articles: [], articlesCount: 0 };
        }
        const ids = _follows.map(el => el.followingId);
        const qb = await typeorm_2.getRepository(article_entity_1.default)
            .createQueryBuilder('article')
            .where('article.author.id IN (:ids)', { ids });
        qb.orderBy('article.published', 'DESC');
        const articlesCount = await qb.getCount();
        if ('limit' in query) {
            qb.limit(query.limit);
        }
        if ('offset' in query) {
            qb.offset(query.offset);
        }
        const articles = await qb.getMany();
        return { articles, articlesCount };
    }
    async findOne(where) {
        const article = await this.articleRepository.findOne(where, { relations: ['author'] });
        return !!article ? { article } : void 0;
    }
    async addComment(id, slug, commentData) {
        const author = await this.userRepository.findOne(id);
        let article = await this.articleRepository.findOne({ slug });
        const comment = new comment_entity_1.default();
        comment.body = commentData.body;
        if (!author || !article)
            return;
        if (Array.isArray(author.comments)) {
            author.comments.push(comment);
        }
        else {
            author.comments = [comment];
        }
        article.comments.push(comment);
        await this.commentRepository.save(comment);
        article = await this.articleRepository.save(article);
        return { comment: Object.assign(Object.assign({}, comment), { author }) };
    }
    async deleteComment(slug, id) {
        let article = await this.articleRepository.findOne({ slug });
        const comment = await this.commentRepository.findOne(id);
        if (!article || !comment)
            return;
        const deleteIndex = article.comments.findIndex(_comment => _comment.uid === comment.uid);
        if (deleteIndex >= 0) {
            const deleteComments = article.comments.splice(deleteIndex, 1);
            await this.commentRepository.delete(deleteComments[0].uid);
            article = await this.articleRepository.save(article);
        }
        return { article };
    }
    async favorite(userId, slug) {
        let article = await this.articleRepository.findOne({ slug }, { relations: ['author'] });
        const user = await this.userRepository.findOne(userId, { relations: ['favorites'] });
        if (!article || !user)
            return;
        const { uid } = article;
        const isNewFavorite = user.favorites.findIndex((_article) => {
            return _article.uid === uid;
        }) < 0;
        if (isNewFavorite) {
            user.favorites.push(article);
            article.favorited = true;
            article.favoritesCount++;
            await this.userRepository.save(user);
            article = await this.articleRepository.save(article);
        }
        return { article };
    }
    async unFavorite(userId, slug) {
        let article = await this.articleRepository.findOne({ slug }, { relations: ['author'] });
        const user = await this.userRepository.findOne(userId, { relations: ['favorites'] });
        if (!article || !user)
            return;
        const { uid } = article;
        const deleteIndex = user.favorites.findIndex((_article) => {
            return _article.uid === uid;
        });
        if (deleteIndex >= 0) {
            user.favorites.splice(deleteIndex, 1);
            article.favoritesCount--;
            article.favorited = false;
            await this.userRepository.save(user);
            article = await this.articleRepository.save(article);
        }
        return { article };
    }
    async findComments(slug) {
        const article = await this.articleRepository.findOne({ slug }, { relations: ['author'] });
        if (!article)
            return;
        const qb = await typeorm_2.getRepository(comment_entity_1.default)
            .createQueryBuilder('comment')
            .leftJoinAndSelect('comment.author', 'author')
            .where("1 = 1")
            .andWhere("comment.article.uid = :uid", { uid: article.uid })
            .orderBy('comment.published', 'DESC');
        const commentsCount = await qb.getCount();
        const comments = await qb.getMany();
        return { comments, commentsCount };
    }
    slugify(title) {
        return `${slug_1.default(title)}-${uuid_1.default()}`;
    }
};
ArticleService = tslib_1.__decorate([
    common_1.Injectable(),
    tslib_1.__param(0, typeorm_1.InjectRepository(article_entity_1.default)),
    tslib_1.__param(1, typeorm_1.InjectRepository(comment_entity_1.default)),
    tslib_1.__param(2, typeorm_1.InjectRepository(user_entity_1.default)),
    tslib_1.__param(3, typeorm_1.InjectRepository(follows_entity_1.default)),
    tslib_1.__metadata("design:paramtypes", [typeorm_2.Repository,
        typeorm_2.Repository,
        typeorm_2.Repository,
        typeorm_2.Repository])
], ArticleService);
exports.default = ArticleService;
//# sourceMappingURL=article.service.js.map
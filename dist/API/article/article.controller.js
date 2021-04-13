"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const tslib_1 = require("tslib");
const common_1 = require("@nestjs/common");
const article_entity_1 = require("./article.entity");
const comment_entity_1 = require("./comment.entity");
const user_decorator_1 = require("../user/user.decorator");
const article_service_1 = require("./article.service");
let ArticleController = class ArticleController {
    constructor(articleService) {
        this.articleService = articleService;
    }
    async findAll(query) {
        return await this.articleService.findAll(query);
    }
    async getFeed(userId, query) {
        return await this.articleService.findFeed(userId, query);
    }
    async findOne(slug) {
        return await this.articleService.findOne({ slug });
    }
    async findComments(slug) {
        return await this.articleService.findComments(slug);
    }
    async create(userId, articleData) {
        return this.articleService.create(userId, articleData);
    }
    async update(userId, params, articleData) {
        return this.articleService.update(params.slug, articleData);
    }
    async delete(userId, params) {
        return this.articleService.delete(params.slug);
    }
    async createComment(userId, slug, commentData) {
        return await this.articleService.addComment(userId, slug, commentData);
    }
    async deleteComment(userId, params) {
        const { slug, id } = params;
        return await this.articleService.deleteComment(slug, id);
    }
    async favorite(userId, slug) {
        return await this.articleService.favorite(userId, slug);
    }
    async unFavorite(userId, slug) {
        return await this.articleService.unFavorite(userId, slug);
    }
};
tslib_1.__decorate([
    common_1.Get(),
    tslib_1.__param(0, common_1.Query()),
    tslib_1.__metadata("design:type", Function),
    tslib_1.__metadata("design:paramtypes", [Object]),
    tslib_1.__metadata("design:returntype", Promise)
], ArticleController.prototype, "findAll", null);
tslib_1.__decorate([
    common_1.Get('feed'),
    tslib_1.__param(0, user_decorator_1.default('id')), tslib_1.__param(1, common_1.Query()),
    tslib_1.__metadata("design:type", Function),
    tslib_1.__metadata("design:paramtypes", [Number, Object]),
    tslib_1.__metadata("design:returntype", Promise)
], ArticleController.prototype, "getFeed", null);
tslib_1.__decorate([
    common_1.Get(':slug'),
    tslib_1.__param(0, common_1.Param('slug')),
    tslib_1.__metadata("design:type", Function),
    tslib_1.__metadata("design:paramtypes", [Object]),
    tslib_1.__metadata("design:returntype", Promise)
], ArticleController.prototype, "findOne", null);
tslib_1.__decorate([
    common_1.Get(':slug/comments'),
    tslib_1.__param(0, common_1.Param('slug')),
    tslib_1.__metadata("design:type", Function),
    tslib_1.__metadata("design:paramtypes", [Object]),
    tslib_1.__metadata("design:returntype", Promise)
], ArticleController.prototype, "findComments", null);
tslib_1.__decorate([
    common_1.Post(),
    tslib_1.__param(0, user_decorator_1.default('id')), tslib_1.__param(1, common_1.Body('article')),
    tslib_1.__metadata("design:type", Function),
    tslib_1.__metadata("design:paramtypes", [Number, article_entity_1.CreateArticleDto]),
    tslib_1.__metadata("design:returntype", Promise)
], ArticleController.prototype, "create", null);
tslib_1.__decorate([
    common_1.Put(':slug'),
    tslib_1.__param(0, user_decorator_1.default('id')), tslib_1.__param(1, common_1.Param()),
    tslib_1.__param(2, common_1.Body('article')),
    tslib_1.__metadata("design:type", Function),
    tslib_1.__metadata("design:paramtypes", [Number, Object, article_entity_1.CreateArticleDto]),
    tslib_1.__metadata("design:returntype", Promise)
], ArticleController.prototype, "update", null);
tslib_1.__decorate([
    common_1.Delete(':slug'),
    tslib_1.__param(0, user_decorator_1.default('id')), tslib_1.__param(1, common_1.Param()),
    tslib_1.__metadata("design:type", Function),
    tslib_1.__metadata("design:paramtypes", [Number, Object]),
    tslib_1.__metadata("design:returntype", Promise)
], ArticleController.prototype, "delete", null);
tslib_1.__decorate([
    common_1.Post(':slug/comments'),
    tslib_1.__param(0, user_decorator_1.default('id')), tslib_1.__param(1, common_1.Param('slug')),
    tslib_1.__param(2, common_1.Body('comment')),
    tslib_1.__metadata("design:type", Function),
    tslib_1.__metadata("design:paramtypes", [Number, Object, comment_entity_1.CreateCommentDto]),
    tslib_1.__metadata("design:returntype", Promise)
], ArticleController.prototype, "createComment", null);
tslib_1.__decorate([
    common_1.Delete(':slug/comments/:id'),
    tslib_1.__param(0, user_decorator_1.default('id')), tslib_1.__param(1, common_1.Param()),
    tslib_1.__metadata("design:type", Function),
    tslib_1.__metadata("design:paramtypes", [Number, Object]),
    tslib_1.__metadata("design:returntype", Promise)
], ArticleController.prototype, "deleteComment", null);
tslib_1.__decorate([
    common_1.Post(':slug/favorite'),
    tslib_1.__param(0, user_decorator_1.default('id')), tslib_1.__param(1, common_1.Param('slug')),
    tslib_1.__metadata("design:type", Function),
    tslib_1.__metadata("design:paramtypes", [Number, Object]),
    tslib_1.__metadata("design:returntype", Promise)
], ArticleController.prototype, "favorite", null);
tslib_1.__decorate([
    common_1.Delete(':slug/favorite'),
    tslib_1.__param(0, user_decorator_1.default('id')), tslib_1.__param(1, common_1.Param('slug')),
    tslib_1.__metadata("design:type", Function),
    tslib_1.__metadata("design:paramtypes", [Number, Object]),
    tslib_1.__metadata("design:returntype", Promise)
], ArticleController.prototype, "unFavorite", null);
ArticleController = tslib_1.__decorate([
    common_1.Controller('articles'),
    tslib_1.__metadata("design:paramtypes", [article_service_1.default])
], ArticleController);
exports.default = ArticleController;
//# sourceMappingURL=article.controller.js.map
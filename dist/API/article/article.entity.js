"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const tslib_1 = require("tslib");
const base_entity_1 = require("../shared/base.entity");
const user_entity_1 = require("../user/user.entity");
const comment_entity_1 = require("./comment.entity");
class CreateArticleDto {
    constructor() {
        this.tagList = [];
        this.favorited = false;
    }
}
exports.CreateArticleDto = CreateArticleDto;
let ArticleEntity = class ArticleEntity extends base_entity_1.default {
};
tslib_1.__decorate([
    base_entity_1.Column(),
    tslib_1.__metadata("design:type", String)
], ArticleEntity.prototype, "slug", void 0);
tslib_1.__decorate([
    base_entity_1.Column(),
    tslib_1.__metadata("design:type", String)
], ArticleEntity.prototype, "title", void 0);
tslib_1.__decorate([
    base_entity_1.Column({ default: '' }),
    tslib_1.__metadata("design:type", String)
], ArticleEntity.prototype, "description", void 0);
tslib_1.__decorate([
    base_entity_1.Column({ default: '' }),
    tslib_1.__metadata("design:type", String)
], ArticleEntity.prototype, "body", void 0);
tslib_1.__decorate([
    base_entity_1.Column('simple-array'),
    tslib_1.__metadata("design:type", Array)
], ArticleEntity.prototype, "tagList", void 0);
tslib_1.__decorate([
    base_entity_1.ManyToOne(type => user_entity_1.default, user => user.articles),
    tslib_1.__metadata("design:type", user_entity_1.default)
], ArticleEntity.prototype, "author", void 0);
tslib_1.__decorate([
    base_entity_1.OneToMany(type => comment_entity_1.default, comment => comment.article, { eager: true }),
    base_entity_1.JoinColumn(),
    tslib_1.__metadata("design:type", Array)
], ArticleEntity.prototype, "comments", void 0);
tslib_1.__decorate([
    base_entity_1.Column({ default: 0 }),
    tslib_1.__metadata("design:type", Number)
], ArticleEntity.prototype, "favoritesCount", void 0);
tslib_1.__decorate([
    base_entity_1.Column({ default: false }),
    tslib_1.__metadata("design:type", Boolean)
], ArticleEntity.prototype, "favorited", void 0);
ArticleEntity = tslib_1.__decorate([
    base_entity_1.Entity('article')
], ArticleEntity);
exports.default = ArticleEntity;
//# sourceMappingURL=article.entity.js.map
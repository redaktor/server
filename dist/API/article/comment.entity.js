"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const tslib_1 = require("tslib");
const base_entity_1 = require("../shared/base.entity");
const user_entity_1 = require("../user/user.entity");
const article_entity_1 = require("./article.entity");
class CreateCommentDto {
}
exports.CreateCommentDto = CreateCommentDto;
let CommentEntity = class CommentEntity extends base_entity_1.default {
};
tslib_1.__decorate([
    base_entity_1.Column(),
    tslib_1.__metadata("design:type", String)
], CommentEntity.prototype, "body", void 0);
tslib_1.__decorate([
    base_entity_1.ManyToOne(type => article_entity_1.default, article => article.comments),
    tslib_1.__metadata("design:type", article_entity_1.default)
], CommentEntity.prototype, "article", void 0);
tslib_1.__decorate([
    base_entity_1.ManyToOne(type => user_entity_1.default, user => user.comments),
    tslib_1.__metadata("design:type", user_entity_1.default)
], CommentEntity.prototype, "author", void 0);
CommentEntity = tslib_1.__decorate([
    base_entity_1.Entity('comment')
], CommentEntity);
exports.default = CommentEntity;
//# sourceMappingURL=comment.entity.js.map
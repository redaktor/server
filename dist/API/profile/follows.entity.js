"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const tslib_1 = require("tslib");
const base_entity_1 = require("../shared/base.entity");
let FollowsEntity = class FollowsEntity extends base_entity_1.default {
};
tslib_1.__decorate([
    base_entity_1.Column(),
    tslib_1.__metadata("design:type", Number)
], FollowsEntity.prototype, "followerId", void 0);
tslib_1.__decorate([
    base_entity_1.Column(),
    tslib_1.__metadata("design:type", Number)
], FollowsEntity.prototype, "followingId", void 0);
FollowsEntity = tslib_1.__decorate([
    base_entity_1.Entity('follows')
], FollowsEntity);
exports.default = FollowsEntity;
//# sourceMappingURL=follows.entity.js.map
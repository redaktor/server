"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const tslib_1 = require("tslib");
const base_entity_1 = require("../shared/base.entity");
let TagEntity = class TagEntity extends base_entity_1.default {
};
tslib_1.__decorate([
    base_entity_1.Column(),
    tslib_1.__metadata("design:type", String)
], TagEntity.prototype, "tag", void 0);
TagEntity = tslib_1.__decorate([
    base_entity_1.Entity('tag')
], TagEntity);
exports.default = TagEntity;
//# sourceMappingURL=tag.entity.js.map
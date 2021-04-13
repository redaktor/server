"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const tslib_1 = require("tslib");
const base_entity_1 = require("../shared/base.entity");
const validator_1 = require("../../framework/validator");
const content_entity_1 = require("../object/content.entity");
class CreatePermissionDto {
}
tslib_1.__decorate([
    validator_1.Any(validator_1.object.isRDFstring()),
    tslib_1.__metadata("design:type", Object)
], CreatePermissionDto.prototype, "contentMap", void 0);
exports.CreatePermissionDto = CreatePermissionDto;
let PermissionEntity = class PermissionEntity extends base_entity_1.default {
};
tslib_1.__decorate([
    base_entity_1.Index({ unique: true }),
    base_entity_1.Column(),
    tslib_1.__metadata("design:type", String)
], PermissionEntity.prototype, "id", void 0);
tslib_1.__decorate([
    base_entity_1.Column(),
    tslib_1.__metadata("design:type", String)
], PermissionEntity.prototype, "name", void 0);
tslib_1.__decorate([
    base_entity_1.Column({ default: true }),
    tslib_1.__metadata("design:type", Boolean)
], PermissionEntity.prototype, "enabled", void 0);
tslib_1.__decorate([
    validator_1.Any(validator_1.object.isRDFstring()),
    base_entity_1.ManyToMany(type => content_entity_1.default),
    base_entity_1.JoinColumn(),
    tslib_1.__metadata("design:type", Array)
], PermissionEntity.prototype, "contentMap", void 0);
tslib_1.__decorate([
    base_entity_1.TreeParent(),
    tslib_1.__metadata("design:type", PermissionEntity)
], PermissionEntity.prototype, "parent", void 0);
PermissionEntity = tslib_1.__decorate([
    base_entity_1.Entity('permission'),
    base_entity_1.Tree("nested-set")
], PermissionEntity);
exports.default = PermissionEntity;
//# sourceMappingURL=permission.entity.js.map
"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const tslib_1 = require("tslib");
const base_entity_1 = require("../shared/base.entity");
const permission_entity_1 = require("../permission/permission.entity");
const validator_1 = require("../../framework/validator");
const content_entity_1 = require("../object/content.entity");
class CreateRoleDto {
}
tslib_1.__decorate([
    validator_1.Any(validator_1.object.isRDFstring()),
    tslib_1.__metadata("design:type", Object)
], CreateRoleDto.prototype, "contentMap", void 0);
exports.CreateRoleDto = CreateRoleDto;
let RoleEntity = class RoleEntity extends base_entity_1.default {
};
tslib_1.__decorate([
    base_entity_1.Index({ unique: true }),
    base_entity_1.Column(),
    tslib_1.__metadata("design:type", String)
], RoleEntity.prototype, "id", void 0);
tslib_1.__decorate([
    base_entity_1.Column(),
    tslib_1.__metadata("design:type", String)
], RoleEntity.prototype, "name", void 0);
tslib_1.__decorate([
    validator_1.Any(validator_1.object.isRDFstring()),
    base_entity_1.ManyToMany(type => content_entity_1.default),
    base_entity_1.JoinColumn(),
    tslib_1.__metadata("design:type", Array)
], RoleEntity.prototype, "contentMap", void 0);
tslib_1.__decorate([
    base_entity_1.ManyToMany(type => permission_entity_1.default),
    base_entity_1.JoinColumn(),
    tslib_1.__metadata("design:type", Array)
], RoleEntity.prototype, "permissions", void 0);
RoleEntity = tslib_1.__decorate([
    base_entity_1.Entity('role')
], RoleEntity);
exports.default = RoleEntity;
//# sourceMappingURL=role.entity.js.map
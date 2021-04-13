"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const tslib_1 = require("tslib");
const base_entity_1 = require("../shared/base.entity");
let TypeEntity = class TypeEntity {
    isCoreType() {
        if (base_entity_1.coreTypes.includes(this.text)) {
            this.isCore = true;
        }
    }
};
tslib_1.__decorate([
    base_entity_1.PrimaryGeneratedColumn(),
    tslib_1.__metadata("design:type", Number)
], TypeEntity.prototype, "uid", void 0);
tslib_1.__decorate([
    base_entity_1.Column({ default: 'Create' }),
    tslib_1.__metadata("design:type", String)
], TypeEntity.prototype, "text", void 0);
tslib_1.__decorate([
    base_entity_1.BeforeInsert(),
    tslib_1.__metadata("design:type", Function),
    tslib_1.__metadata("design:paramtypes", []),
    tslib_1.__metadata("design:returntype", void 0)
], TypeEntity.prototype, "isCoreType", null);
tslib_1.__decorate([
    base_entity_1.Column({ default: false }),
    tslib_1.__metadata("design:type", Boolean)
], TypeEntity.prototype, "isCore", void 0);
tslib_1.__decorate([
    base_entity_1.Column({ default: 'redaktor' }),
    tslib_1.__metadata("design:type", String)
], TypeEntity.prototype, "generator", void 0);
TypeEntity = tslib_1.__decorate([
    base_entity_1.Entity('type')
], TypeEntity);
exports.default = TypeEntity;
//# sourceMappingURL=type.entity.js.map
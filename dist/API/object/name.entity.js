"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const tslib_1 = require("tslib");
const base_entity_1 = require("../shared/base.entity");
let NameEntity = class NameEntity {
};
tslib_1.__decorate([
    base_entity_1.PrimaryGeneratedColumn(),
    tslib_1.__metadata("design:type", Number)
], NameEntity.prototype, "uid", void 0);
tslib_1.__decorate([
    base_entity_1.Column({ default: 'en' }),
    tslib_1.__metadata("design:type", String)
], NameEntity.prototype, "language", void 0);
tslib_1.__decorate([
    base_entity_1.Column({ default: '' }),
    tslib_1.__metadata("design:type", String)
], NameEntity.prototype, "text", void 0);
NameEntity = tslib_1.__decorate([
    base_entity_1.Entity('name')
], NameEntity);
exports.default = NameEntity;
//# sourceMappingURL=name.entity.js.map
"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const tslib_1 = require("tslib");
const base_entity_1 = require("../shared/base.entity");
let ContentEntity = class ContentEntity {
};
tslib_1.__decorate([
    base_entity_1.PrimaryGeneratedColumn(),
    tslib_1.__metadata("design:type", Number)
], ContentEntity.prototype, "uid", void 0);
tslib_1.__decorate([
    base_entity_1.Column({ default: 'en' }),
    tslib_1.__metadata("design:type", String)
], ContentEntity.prototype, "language", void 0);
tslib_1.__decorate([
    base_entity_1.Column('text', { default: '' }),
    tslib_1.__metadata("design:type", String)
], ContentEntity.prototype, "text", void 0);
ContentEntity = tslib_1.__decorate([
    base_entity_1.Entity('content')
], ContentEntity);
exports.default = ContentEntity;
//# sourceMappingURL=content.entity.js.map
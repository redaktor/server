"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const tslib_1 = require("tslib");
const base_entity_1 = require("../shared/base.entity");
let SummaryEntity = class SummaryEntity {
};
tslib_1.__decorate([
    base_entity_1.PrimaryGeneratedColumn(),
    tslib_1.__metadata("design:type", Number)
], SummaryEntity.prototype, "uid", void 0);
tslib_1.__decorate([
    base_entity_1.Column({ default: 'en' }),
    tslib_1.__metadata("design:type", String)
], SummaryEntity.prototype, "language", void 0);
tslib_1.__decorate([
    base_entity_1.Column('text', { default: '' }),
    tslib_1.__metadata("design:type", String)
], SummaryEntity.prototype, "text", void 0);
SummaryEntity = tslib_1.__decorate([
    base_entity_1.Entity('summary')
], SummaryEntity);
exports.default = SummaryEntity;
//# sourceMappingURL=summary.entity.js.map
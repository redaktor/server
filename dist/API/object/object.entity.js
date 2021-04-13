"use strict";
var ObjectEntity_1;
Object.defineProperty(exports, "__esModule", { value: true });
const tslib_1 = require("tslib");
const base_entity_1 = require("../shared/base.entity");
const validator_1 = require("../../framework/validator");
const object_base_entity_1 = require("./object.base.entity");
class CreateObjectDto {
}
exports.CreateObjectDto = CreateObjectDto;
let ObjectEntity = ObjectEntity_1 = class ObjectEntity {
};
tslib_1.__decorate([
    base_entity_1.Column(type => object_base_entity_1.default),
    tslib_1.__metadata("design:type", object_base_entity_1.default)
], ObjectEntity.prototype, "base", void 0);
tslib_1.__decorate([
    base_entity_1.ManyToMany(type => ObjectEntity_1, { eager: true, cascade: true }),
    tslib_1.__metadata("design:type", Array)
], ObjectEntity.prototype, "attributedTo", void 0);
tslib_1.__decorate([
    base_entity_1.ManyToOne(type => ObjectEntity_1),
    tslib_1.__metadata("design:type", ObjectEntity)
], ObjectEntity.prototype, "audience", void 0);
tslib_1.__decorate([
    base_entity_1.Column(),
    tslib_1.__metadata("design:type", String)
], ObjectEntity.prototype, "to", void 0);
tslib_1.__decorate([
    base_entity_1.Column(),
    tslib_1.__metadata("design:type", String)
], ObjectEntity.prototype, "cc", void 0);
tslib_1.__decorate([
    base_entity_1.Column({ select: false }),
    tslib_1.__metadata("design:type", String)
], ObjectEntity.prototype, "bto", void 0);
tslib_1.__decorate([
    base_entity_1.Column({ select: false }),
    tslib_1.__metadata("design:type", String)
], ObjectEntity.prototype, "bcc", void 0);
tslib_1.__decorate([
    base_entity_1.TreeParent(),
    tslib_1.__metadata("design:type", ObjectEntity)
], ObjectEntity.prototype, "inReplyTo", void 0);
tslib_1.__decorate([
    base_entity_1.TreeChildren(),
    tslib_1.__metadata("design:type", Array)
], ObjectEntity.prototype, "replies", void 0);
tslib_1.__decorate([
    base_entity_1.TreeLevelColumn(),
    tslib_1.__metadata("design:type", Number)
], ObjectEntity.prototype, "replyLevel", void 0);
tslib_1.__decorate([
    base_entity_1.Column('text'),
    tslib_1.__metadata("design:type", String)
], ObjectEntity.prototype, "source", void 0);
tslib_1.__decorate([
    base_entity_1.OneToOne(type => ObjectEntity_1, { eager: true, cascade: true }),
    base_entity_1.JoinColumn(),
    tslib_1.__metadata("design:type", ObjectEntity)
], ObjectEntity.prototype, "describes", void 0);
tslib_1.__decorate([
    base_entity_1.Column({ length: 32 }),
    tslib_1.__metadata("design:type", String)
], ObjectEntity.prototype, "duration", void 0);
tslib_1.__decorate([
    base_entity_1.Column(),
    tslib_1.__metadata("design:type", Date)
], ObjectEntity.prototype, "endTime", void 0);
tslib_1.__decorate([
    base_entity_1.Column(),
    tslib_1.__metadata("design:type", Date)
], ObjectEntity.prototype, "startTime", void 0);
tslib_1.__decorate([
    validator_1.Any(validator_1.number.min(0).max(100)),
    base_entity_1.Column('float'),
    tslib_1.__metadata("design:type", Number)
], ObjectEntity.prototype, "accuracy", void 0);
tslib_1.__decorate([
    base_entity_1.Column('float'),
    tslib_1.__metadata("design:type", Number)
], ObjectEntity.prototype, "altitude", void 0);
tslib_1.__decorate([
    base_entity_1.Column('float'),
    tslib_1.__metadata("design:type", Number)
], ObjectEntity.prototype, "latitude", void 0);
tslib_1.__decorate([
    base_entity_1.Column('float'),
    tslib_1.__metadata("design:type", Number)
], ObjectEntity.prototype, "longitude", void 0);
tslib_1.__decorate([
    validator_1.Any(validator_1.number.min(0)),
    base_entity_1.Column('float'),
    tslib_1.__metadata("design:type", Number)
], ObjectEntity.prototype, "radius", void 0);
tslib_1.__decorate([
    base_entity_1.Column({ default: 'm' }),
    tslib_1.__metadata("design:type", String)
], ObjectEntity.prototype, "units", void 0);
tslib_1.__decorate([
    base_entity_1.Column({ default: false }),
    tslib_1.__metadata("design:type", Boolean)
], ObjectEntity.prototype, "sensitive", void 0);
tslib_1.__decorate([
    validator_1.Any(validator_1.number.isInt()),
    base_entity_1.Column({ default: 0 }),
    tslib_1.__metadata("design:type", Number)
], ObjectEntity.prototype, "visibility", void 0);
tslib_1.__decorate([
    base_entity_1.Column('text', { default: '' }),
    tslib_1.__metadata("design:type", String)
], ObjectEntity.prototype, "spoiler_text", void 0);
tslib_1.__decorate([
    validator_1.Any(validator_1.number.isInt()),
    base_entity_1.Column('bigint'),
    tslib_1.__metadata("design:type", Number)
], ObjectEntity.prototype, "app_id", void 0);
ObjectEntity = ObjectEntity_1 = tslib_1.__decorate([
    base_entity_1.Entity('object'),
    base_entity_1.Tree("closure-table")
], ObjectEntity);
exports.default = ObjectEntity;
//# sourceMappingURL=object.entity.js.map
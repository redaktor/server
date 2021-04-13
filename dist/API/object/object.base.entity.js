"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const tslib_1 = require("tslib");
const base_entity_1 = require("../shared/base.entity");
const validator_1 = require("../../framework/validator");
const type_entity_1 = require("./type.entity");
const object_entity_1 = require("./object.entity");
const link_entity_1 = require("../link/link.entity");
const tag_entity_1 = require("../tag/tag.entity");
const name_entity_1 = require("./name.entity");
const summary_entity_1 = require("./summary.entity");
const content_entity_1 = require("./content.entity");
class CreateObjectBaseDto {
}
tslib_1.__decorate([
    validator_1.Any(validator_1.object.isRDFstring()),
    tslib_1.__metadata("design:type", Object)
], CreateObjectBaseDto.prototype, "nameMap", void 0);
tslib_1.__decorate([
    validator_1.Any(validator_1.object.isRDFstring()),
    tslib_1.__metadata("design:type", Object)
], CreateObjectBaseDto.prototype, "summaryMap", void 0);
tslib_1.__decorate([
    validator_1.Any(validator_1.object.isRDFstring()),
    tslib_1.__metadata("design:type", Object)
], CreateObjectBaseDto.prototype, "contentMap", void 0);
exports.CreateObjectBaseDto = CreateObjectBaseDto;
let ObjectBaseEntity = class ObjectBaseEntity extends base_entity_1.default {
};
tslib_1.__decorate([
    base_entity_1.Column({ default: 'text/html' }),
    validator_1.Any(validator_1.string.hasValidMime()),
    tslib_1.__metadata("design:type", String)
], ObjectBaseEntity.prototype, "mediaType", void 0);
tslib_1.__decorate([
    base_entity_1.Column({ default: false }),
    tslib_1.__metadata("design:type", Boolean)
], ObjectBaseEntity.prototype, "isURL", void 0);
tslib_1.__decorate([
    base_entity_1.Column({ default: false }),
    tslib_1.__metadata("design:type", Boolean)
], ObjectBaseEntity.prototype, "isSingleObject", void 0);
tslib_1.__decorate([
    base_entity_1.Column('simple-json', { nullable: true }),
    tslib_1.__metadata("design:type", Object)
], ObjectBaseEntity.prototype, "unknownProperties", void 0);
tslib_1.__decorate([
    validator_1.Any(validator_1.object.isRDFstring()),
    base_entity_1.ManyToMany(type => summary_entity_1.default),
    base_entity_1.JoinColumn(),
    tslib_1.__metadata("design:type", Array)
], ObjectBaseEntity.prototype, "summaryMap", void 0);
tslib_1.__decorate([
    validator_1.Any(validator_1.object.isRDFstring()),
    base_entity_1.ManyToMany(type => name_entity_1.default),
    base_entity_1.JoinColumn(),
    tslib_1.__metadata("design:type", Array)
], ObjectBaseEntity.prototype, "nameMap", void 0);
tslib_1.__decorate([
    validator_1.Any(validator_1.object.isRDFstring()),
    base_entity_1.ManyToMany(type => content_entity_1.default),
    base_entity_1.JoinColumn(),
    tslib_1.__metadata("design:type", Array)
], ObjectBaseEntity.prototype, "contentMap", void 0);
tslib_1.__decorate([
    base_entity_1.ManyToOne(type => type_entity_1.default, { eager: true, cascade: true }),
    base_entity_1.JoinColumn(),
    tslib_1.__metadata("design:type", type_entity_1.default)
], ObjectBaseEntity.prototype, "type", void 0);
tslib_1.__decorate([
    base_entity_1.ManyToMany(type => object_entity_1.default),
    base_entity_1.JoinColumn(),
    tslib_1.__metadata("design:type", object_entity_1.default)
], ObjectBaseEntity.prototype, "generator", void 0);
tslib_1.__decorate([
    base_entity_1.ManyToMany(type => link_entity_1.default, { eager: true, cascade: true }),
    base_entity_1.JoinColumn(),
    tslib_1.__metadata("design:type", link_entity_1.default)
], ObjectBaseEntity.prototype, "id", void 0);
tslib_1.__decorate([
    base_entity_1.ManyToMany(type => link_entity_1.default, { nullable: true }),
    base_entity_1.JoinColumn(),
    tslib_1.__metadata("design:type", link_entity_1.default)
], ObjectBaseEntity.prototype, "url", void 0);
tslib_1.__decorate([
    base_entity_1.ManyToOne(type => object_entity_1.default),
    tslib_1.__metadata("design:type", object_entity_1.default)
], ObjectBaseEntity.prototype, "context", void 0);
tslib_1.__decorate([
    validator_1.Any(validator_1.array.items(validator_1.string.isHashtag())),
    base_entity_1.ManyToMany(type => tag_entity_1.default),
    tslib_1.__metadata("design:type", Array)
], ObjectBaseEntity.prototype, "tag", void 0);
tslib_1.__decorate([
    base_entity_1.ManyToMany(type => object_entity_1.default),
    base_entity_1.JoinColumn(),
    tslib_1.__metadata("design:type", Array)
], ObjectBaseEntity.prototype, "icon", void 0);
tslib_1.__decorate([
    base_entity_1.ManyToMany(type => object_entity_1.default),
    base_entity_1.JoinColumn(),
    tslib_1.__metadata("design:type", Array)
], ObjectBaseEntity.prototype, "image", void 0);
tslib_1.__decorate([
    base_entity_1.ManyToMany(type => object_entity_1.default),
    base_entity_1.JoinColumn(),
    tslib_1.__metadata("design:type", Array)
], ObjectBaseEntity.prototype, "location", void 0);
tslib_1.__decorate([
    base_entity_1.ManyToMany(type => object_entity_1.default),
    base_entity_1.JoinColumn(),
    tslib_1.__metadata("design:type", Array)
], ObjectBaseEntity.prototype, "preview", void 0);
ObjectBaseEntity = tslib_1.__decorate([
    base_entity_1.Entity('object-base')
], ObjectBaseEntity);
exports.default = ObjectBaseEntity;
//# sourceMappingURL=object.base.entity.js.map
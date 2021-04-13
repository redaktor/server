"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const tslib_1 = require("tslib");
const base_entity_1 = require("../shared/base.entity");
const object_base_entity_1 = require("../object/object.base.entity");
const type_entity_1 = require("./type.entity");
const actor_entity_1 = require("../actor/actor.entity");
let ActivityEntity = class ActivityEntity extends object_base_entity_1.default {
};
tslib_1.__decorate([
    base_entity_1.ManyToMany(type => actor_entity_1.default, actor => actor.outbox),
    tslib_1.__metadata("design:type", Array)
], ActivityEntity.prototype, "actors", void 0);
tslib_1.__decorate([
    base_entity_1.ManyToOne(type => type_entity_1.default),
    tslib_1.__metadata("design:type", type_entity_1.default)
], ActivityEntity.prototype, "type", void 0);
tslib_1.__decorate([
    base_entity_1.Column({ default: false }),
    tslib_1.__metadata("design:type", Boolean)
], ActivityEntity.prototype, "isPublic", void 0);
ActivityEntity = tslib_1.__decorate([
    base_entity_1.Entity('activity')
], ActivityEntity);
exports.default = ActivityEntity;
//# sourceMappingURL=activity.entity.js.map
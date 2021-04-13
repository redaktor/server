"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const tslib_1 = require("tslib");
const base_entity_1 = require("../shared/base.entity");
const type_entity_1 = require("../activity/type.entity");
let TypeEntity = class TypeEntity extends type_entity_1.default {
};
tslib_1.__decorate([
    base_entity_1.Column({ default: '' }),
    tslib_1.__metadata("design:type", String)
], TypeEntity.prototype, "text", void 0);
tslib_1.__decorate([
    base_entity_1.Column({ default: false }),
    tslib_1.__metadata("design:type", Boolean)
], TypeEntity.prototype, "isActor", void 0);
TypeEntity = tslib_1.__decorate([
    base_entity_1.Entity('type')
], TypeEntity);
exports.default = TypeEntity;
//# sourceMappingURL=type.entity.js.map
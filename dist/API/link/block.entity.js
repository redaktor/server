"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const tslib_1 = require("tslib");
const base_entity_1 = require("../shared/base.entity");
let BlockEntity = class BlockEntity extends base_entity_1.default {
};
tslib_1.__decorate([
    base_entity_1.Column({ default: false }),
    tslib_1.__metadata("design:type", Boolean)
], BlockEntity.prototype, "silence", void 0);
tslib_1.__decorate([
    base_entity_1.Column({ default: false }),
    tslib_1.__metadata("design:type", Boolean)
], BlockEntity.prototype, "media", void 0);
tslib_1.__decorate([
    base_entity_1.Column({ default: false }),
    tslib_1.__metadata("design:type", Boolean)
], BlockEntity.prototype, "reports", void 0);
tslib_1.__decorate([
    base_entity_1.Column({ default: false }),
    tslib_1.__metadata("design:type", Boolean)
], BlockEntity.prototype, "content", void 0);
tslib_1.__decorate([
    base_entity_1.Column({ default: false }),
    base_entity_1.Index(),
    tslib_1.__metadata("design:type", Boolean)
], BlockEntity.prototype, "recursive", void 0);
tslib_1.__decorate([
    base_entity_1.Column({ default: false }),
    tslib_1.__metadata("design:type", Boolean)
], BlockEntity.prototype, "blockHost", void 0);
BlockEntity = tslib_1.__decorate([
    base_entity_1.Entity()
], BlockEntity);
exports.default = BlockEntity;
//# sourceMappingURL=block.entity.js.map
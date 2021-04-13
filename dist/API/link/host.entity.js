"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const tslib_1 = require("tslib");
const typeorm_1 = require("typeorm");
const block_entity_1 = require("./block.entity");
let HostEntity = class HostEntity {
};
tslib_1.__decorate([
    typeorm_1.PrimaryGeneratedColumn(),
    tslib_1.__metadata("design:type", Number)
], HostEntity.prototype, "id", void 0);
tslib_1.__decorate([
    typeorm_1.Column({ length: 255 }),
    typeorm_1.Index({ unique: true }),
    tslib_1.__metadata("design:type", String)
], HostEntity.prototype, "text", void 0);
tslib_1.__decorate([
    typeorm_1.ManyToOne(type => block_entity_1.default, { eager: true, cascade: true }),
    tslib_1.__metadata("design:type", block_entity_1.default)
], HostEntity.prototype, "block", void 0);
HostEntity = tslib_1.__decorate([
    typeorm_1.Entity('host')
], HostEntity);
exports.default = HostEntity;
//# sourceMappingURL=host.entity.js.map
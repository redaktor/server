"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const tslib_1 = require("tslib");
const typeorm_1 = require("typeorm");
let PathEntity = class PathEntity {
};
tslib_1.__decorate([
    typeorm_1.PrimaryGeneratedColumn(),
    tslib_1.__metadata("design:type", Number)
], PathEntity.prototype, "id", void 0);
tslib_1.__decorate([
    typeorm_1.Column({ type: 'text', nullable: true }),
    tslib_1.__metadata("design:type", String)
], PathEntity.prototype, "text", void 0);
PathEntity = tslib_1.__decorate([
    typeorm_1.Entity()
], PathEntity);
exports.default = PathEntity;
//# sourceMappingURL=path.entity.js.map
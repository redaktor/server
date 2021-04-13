"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const tslib_1 = require("tslib");
const typeorm_1 = require("typeorm");
let AuthEntity = class AuthEntity {
};
tslib_1.__decorate([
    typeorm_1.PrimaryGeneratedColumn(),
    tslib_1.__metadata("design:type", Number)
], AuthEntity.prototype, "id", void 0);
tslib_1.__decorate([
    typeorm_1.Column({ type: 'text', nullable: true }),
    tslib_1.__metadata("design:type", String)
], AuthEntity.prototype, "text", void 0);
AuthEntity = tslib_1.__decorate([
    typeorm_1.Entity()
], AuthEntity);
exports.default = AuthEntity;
//# sourceMappingURL=auth.entity.js.map
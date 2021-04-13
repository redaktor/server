"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const tslib_1 = require("tslib");
const typeorm_1 = require("typeorm");
let QueryEntity = class QueryEntity {
};
tslib_1.__decorate([
    typeorm_1.PrimaryGeneratedColumn(),
    tslib_1.__metadata("design:type", Number)
], QueryEntity.prototype, "id", void 0);
tslib_1.__decorate([
    typeorm_1.Column({ type: 'text', nullable: true }),
    tslib_1.__metadata("design:type", String)
], QueryEntity.prototype, "text", void 0);
QueryEntity = tslib_1.__decorate([
    typeorm_1.Entity()
], QueryEntity);
exports.default = QueryEntity;
//# sourceMappingURL=query.entity.js.map
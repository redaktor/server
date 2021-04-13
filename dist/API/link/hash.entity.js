"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const tslib_1 = require("tslib");
const typeorm_1 = require("typeorm");
let HashEntity = class HashEntity {
};
tslib_1.__decorate([
    typeorm_1.PrimaryGeneratedColumn(),
    tslib_1.__metadata("design:type", Number)
], HashEntity.prototype, "id", void 0);
tslib_1.__decorate([
    typeorm_1.Column({ length: 2048, nullable: true }),
    tslib_1.__metadata("design:type", String)
], HashEntity.prototype, "text", void 0);
HashEntity = tslib_1.__decorate([
    typeorm_1.Entity()
], HashEntity);
exports.default = HashEntity;
//# sourceMappingURL=hash.entity.js.map
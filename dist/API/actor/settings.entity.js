"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const tslib_1 = require("tslib");
const base_entity_1 = require("../shared/base.entity");
const link_entity_1 = require("../link/link.entity");
let SettingsEntity = class SettingsEntity {
};
tslib_1.__decorate([
    base_entity_1.PrimaryGeneratedColumn('uuid'),
    tslib_1.__metadata("design:type", String)
], SettingsEntity.prototype, "uid", void 0);
tslib_1.__decorate([
    base_entity_1.OneToOne(type => link_entity_1.default),
    tslib_1.__metadata("design:type", link_entity_1.default)
], SettingsEntity.prototype, "bannerLink", void 0);
tslib_1.__decorate([
    base_entity_1.Column({ default: false }),
    tslib_1.__metadata("design:type", Boolean)
], SettingsEntity.prototype, "isAdmin", void 0);
tslib_1.__decorate([
    base_entity_1.Column({ default: false }),
    tslib_1.__metadata("design:type", Boolean)
], SettingsEntity.prototype, "isModerator", void 0);
tslib_1.__decorate([
    base_entity_1.Column({ default: false }),
    tslib_1.__metadata("design:type", Boolean)
], SettingsEntity.prototype, "isVerified", void 0);
tslib_1.__decorate([
    base_entity_1.Column(),
    tslib_1.__metadata("design:type", String)
], SettingsEntity.prototype, "primaryColor", void 0);
tslib_1.__decorate([
    base_entity_1.Column(),
    tslib_1.__metadata("design:type", String)
], SettingsEntity.prototype, "secondaryColor", void 0);
tslib_1.__decorate([
    base_entity_1.Column('simple-json'),
    tslib_1.__metadata("design:type", Object)
], SettingsEntity.prototype, "json", void 0);
SettingsEntity = tslib_1.__decorate([
    base_entity_1.Entity('settings')
], SettingsEntity);
exports.default = SettingsEntity;
//# sourceMappingURL=settings.entity.js.map
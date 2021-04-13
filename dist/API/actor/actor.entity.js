"use strict";
var ActorEntity_1;
Object.defineProperty(exports, "__esModule", { value: true });
const tslib_1 = require("tslib");
const base_entity_1 = require("../shared/base.entity");
const user_entity_1 = require("../user/user.entity");
const object_base_entity_1 = require("../object/object.base.entity");
const object_entity_1 = require("../object/object.entity");
const activity_entity_1 = require("../activity/activity.entity");
const settings_entity_1 = require("./settings.entity");
class CreateActorDto {
}
exports.CreateActorDto = CreateActorDto;
let ActorEntity = ActorEntity_1 = class ActorEntity extends object_base_entity_1.default {
    skipUser() { delete this.user; }
};
tslib_1.__decorate([
    base_entity_1.PrimaryGeneratedColumn('uuid'),
    tslib_1.__metadata("design:type", Number)
], ActorEntity.prototype, "uid", void 0);
tslib_1.__decorate([
    base_entity_1.CreateDateColumn(),
    tslib_1.__metadata("design:type", Date)
], ActorEntity.prototype, "published", void 0);
tslib_1.__decorate([
    base_entity_1.UpdateDateColumn(),
    tslib_1.__metadata("design:type", Date)
], ActorEntity.prototype, "updated", void 0);
tslib_1.__decorate([
    base_entity_1.AfterInsert(),
    base_entity_1.AfterLoad(),
    tslib_1.__metadata("design:type", Function),
    tslib_1.__metadata("design:paramtypes", []),
    tslib_1.__metadata("design:returntype", void 0)
], ActorEntity.prototype, "skipUser", null);
tslib_1.__decorate([
    base_entity_1.ManyToOne(type => user_entity_1.default, user => user.actors),
    tslib_1.__metadata("design:type", user_entity_1.default)
], ActorEntity.prototype, "user", void 0);
tslib_1.__decorate([
    base_entity_1.Column(),
    tslib_1.__metadata("design:type", String)
], ActorEntity.prototype, "preferredUsername", void 0);
tslib_1.__decorate([
    base_entity_1.ManyToMany(type => activity_entity_1.default),
    base_entity_1.JoinTable(),
    tslib_1.__metadata("design:type", Array)
], ActorEntity.prototype, "inbox", void 0);
tslib_1.__decorate([
    base_entity_1.ManyToMany(type => activity_entity_1.default),
    base_entity_1.JoinTable(),
    tslib_1.__metadata("design:type", Array)
], ActorEntity.prototype, "outbox", void 0);
tslib_1.__decorate([
    base_entity_1.ManyToMany(type => ActorEntity_1),
    base_entity_1.JoinTable(),
    tslib_1.__metadata("design:type", Array)
], ActorEntity.prototype, "following", void 0);
tslib_1.__decorate([
    base_entity_1.ManyToMany(type => ActorEntity_1),
    base_entity_1.JoinTable(),
    tslib_1.__metadata("design:type", Array)
], ActorEntity.prototype, "followers", void 0);
tslib_1.__decorate([
    base_entity_1.ManyToMany(type => object_entity_1.default),
    base_entity_1.JoinTable(),
    tslib_1.__metadata("design:type", Array)
], ActorEntity.prototype, "liked", void 0);
tslib_1.__decorate([
    base_entity_1.ManyToMany(type => object_entity_1.default),
    tslib_1.__metadata("design:type", Array)
], ActorEntity.prototype, "streams", void 0);
tslib_1.__decorate([
    base_entity_1.OneToOne(type => settings_entity_1.default),
    base_entity_1.JoinColumn(),
    tslib_1.__metadata("design:type", settings_entity_1.default)
], ActorEntity.prototype, "settings", void 0);
tslib_1.__decorate([
    base_entity_1.Column(),
    tslib_1.__metadata("design:type", Date)
], ActorEntity.prototype, "lastFetchedAt", void 0);
tslib_1.__decorate([
    base_entity_1.ManyToMany(type => activity_entity_1.default, { eager: true }),
    tslib_1.__metadata("design:type", Array)
], ActorEntity.prototype, "pinnedActivities", void 0);
tslib_1.__decorate([
    base_entity_1.Column('simple-json', { nullable: true }),
    tslib_1.__metadata("design:type", Object)
], ActorEntity.prototype, "unknownProperties", void 0);
ActorEntity = ActorEntity_1 = tslib_1.__decorate([
    base_entity_1.Entity('actor')
], ActorEntity);
exports.default = ActorEntity;
//# sourceMappingURL=actor.entity.js.map
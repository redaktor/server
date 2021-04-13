"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const tslib_1 = require("tslib");
const base_entity_1 = require("../shared/base.entity");
const typeorm_1 = require("typeorm");
const validator_1 = require("../../framework/validator");
const crypto = require("crypto");
const actor_entity_1 = require("../actor/actor.entity");
class LoginUserDto {
}
tslib_1.__decorate([
    validator_1.Any(),
    tslib_1.__metadata("design:type", String)
], LoginUserDto.prototype, "password", void 0);
tslib_1.__decorate([
    validator_1.Any(),
    tslib_1.__metadata("design:type", String)
], LoginUserDto.prototype, "name", void 0);
exports.LoginUserDto = LoginUserDto;
class CreateUserDto extends LoginUserDto {
}
tslib_1.__decorate([
    validator_1.Any(validator_1.string.isEmail()),
    tslib_1.__metadata("design:type", String)
], CreateUserDto.prototype, "email", void 0);
exports.CreateUserDto = CreateUserDto;
class UpdateUserDto {
}
tslib_1.__decorate([
    validator_1.Any(validator_1.optional, validator_1.string),
    tslib_1.__metadata("design:type", String)
], UpdateUserDto.prototype, "name", void 0);
tslib_1.__decorate([
    validator_1.Any(validator_1.optional, validator_1.string),
    tslib_1.__metadata("design:type", String)
], UpdateUserDto.prototype, "bio", void 0);
tslib_1.__decorate([
    validator_1.Any(validator_1.optional, validator_1.string),
    tslib_1.__metadata("design:type", String)
], UpdateUserDto.prototype, "image", void 0);
tslib_1.__decorate([
    validator_1.Any(validator_1.optional, validator_1.string.isEmail()),
    tslib_1.__metadata("design:type", String)
], UpdateUserDto.prototype, "email", void 0);
exports.UpdateUserDto = UpdateUserDto;
let UserEntity = class UserEntity extends base_entity_1.default {
    hashPassword() {
        const l = 32;
        this.salt = crypto.randomBytes(Math.ceil(l / 2)).toString('hex').slice(0, l);
        const hash = crypto.createHmac('sha512', this.salt);
        hash.update(this.password);
        this.password = hash.digest('hex');
    }
    toSelected() {
        if (!this.selectedActor) {
            this.selectedActor = this.defaultActor;
        }
    }
};
tslib_1.__decorate([
    typeorm_1.BeforeInsert(),
    tslib_1.__metadata("design:type", Function),
    tslib_1.__metadata("design:paramtypes", []),
    tslib_1.__metadata("design:returntype", void 0)
], UserEntity.prototype, "hashPassword", null);
tslib_1.__decorate([
    typeorm_1.Index({ unique: true }),
    typeorm_1.Column(),
    tslib_1.__metadata("design:type", String)
], UserEntity.prototype, "name", void 0);
tslib_1.__decorate([
    typeorm_1.Index({ unique: true }),
    typeorm_1.Column(),
    tslib_1.__metadata("design:type", String)
], UserEntity.prototype, "email", void 0);
tslib_1.__decorate([
    typeorm_1.Column({ select: false }),
    tslib_1.__metadata("design:type", String)
], UserEntity.prototype, "salt", void 0);
tslib_1.__decorate([
    typeorm_1.Column({ select: false }),
    tslib_1.__metadata("design:type", String)
], UserEntity.prototype, "password", void 0);
tslib_1.__decorate([
    typeorm_1.OneToMany(type => actor_entity_1.default, actor => actor.user, { eager: true }),
    tslib_1.__metadata("design:type", Array)
], UserEntity.prototype, "actors", void 0);
tslib_1.__decorate([
    typeorm_1.OneToOne(type => actor_entity_1.default),
    typeorm_1.JoinColumn(),
    tslib_1.__metadata("design:type", actor_entity_1.default)
], UserEntity.prototype, "defaultActor", void 0);
tslib_1.__decorate([
    typeorm_1.AfterInsert(),
    typeorm_1.AfterLoad(),
    tslib_1.__metadata("design:type", Function),
    tslib_1.__metadata("design:paramtypes", []),
    tslib_1.__metadata("design:returntype", void 0)
], UserEntity.prototype, "toSelected", null);
tslib_1.__decorate([
    typeorm_1.OneToOne(type => actor_entity_1.default, { nullable: true, eager: true }),
    typeorm_1.JoinColumn(),
    tslib_1.__metadata("design:type", actor_entity_1.default)
], UserEntity.prototype, "selectedActor", void 0);
UserEntity = tslib_1.__decorate([
    typeorm_1.Entity('user')
], UserEntity);
exports.default = UserEntity;
//# sourceMappingURL=user.entity.js.map
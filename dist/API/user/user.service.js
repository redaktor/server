"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const tslib_1 = require("tslib");
const crypto = require("crypto");
const common_1 = require("@nestjs/common");
const typeorm_1 = require("@nestjs/typeorm");
const typeorm_2 = require("typeorm");
const validator_1 = require("../../framework/validator");
const user_entity_1 = require("./user.entity");
const actor_service_1 = require("../actor/actor.service");
let UserService = class UserService {
    constructor(userRepository, actorService) {
        this.userRepository = userRepository;
        this.actorService = actorService;
    }
    async create(dto, persist = true) {
        const { name, email, password } = dto;
        const dbQuery = typeorm_2.getRepository(user_entity_1.default)
            .createQueryBuilder('user')
            .where('user.name = :name', { name })
            .orWhere('user.email = :email', { email });
        const qUser = await dbQuery.getOne();
        if (qUser) {
            const errors = { name: 'Username and email must be unique.' };
            throw new common_1.HttpException({
                message: 'Input data validation failed', errors
            }, common_1.HttpStatus.BAD_REQUEST);
        }
        let user = this.userRepository.create({ name, email, password });
        const actorRO = await this.actorService.create({
            user,
            preferredUsername: name,
            isActor: true
        });
        user.actors = [actorRO.actor];
        user.defaultActor = actorRO.actor;
        console.log('u', { user });
        if (persist) {
            user = await this.userRepository.save(user);
        }
        console.log('user', { user });
        return { user };
    }
    async update(id, dto) {
        let toUpdate = await this.userRepository.findOne(id);
        if (!!toUpdate) {
            delete toUpdate.password;
        }
        let updated = Object.assign(toUpdate, dto);
        const user = await this.userRepository.save(updated);
        return { user };
    }
    async delete(id, email) {
        let user = await this.userRepository.findOne(id);
        if (!user) {
            const errors = { User: ' not found' };
            throw new common_1.HttpException({ errors }, 401);
        }
        ;
        return await this.userRepository.delete({ email });
    }
    async findOne(loginUserDto) {
        console.log('findOne');
        return await this.userRepository.findOne({
            name: loginUserDto.name,
            password: crypto.createHmac('sha512', loginUserDto.password).digest('hex')
        }, {
            relations: ['actors', 'selectedActor']
        });
    }
    async findById(id) {
        const user = await this.userRepository.findOne(id);
        if (!user) {
            const errors = { User: ' not found' };
            throw new common_1.HttpException({ errors }, 401);
        }
        ;
        return { user };
    }
    async findByEmail(email) {
        const user = await this.userRepository.findOne({ email });
        if (!user) {
            const errors = { User: ' not found' };
            throw new common_1.HttpException({ errors }, 401);
        }
        ;
        return { user };
    }
};
tslib_1.__decorate([
    tslib_1.__param(1, validator_1.Any(validator_1.string.isEmail())),
    tslib_1.__metadata("design:type", Function),
    tslib_1.__metadata("design:paramtypes", [Number, String]),
    tslib_1.__metadata("design:returntype", Promise)
], UserService.prototype, "delete", null);
tslib_1.__decorate([
    tslib_1.__param(0, validator_1.Any(validator_1.string.isEmail())),
    tslib_1.__metadata("design:type", Function),
    tslib_1.__metadata("design:paramtypes", [String]),
    tslib_1.__metadata("design:returntype", Promise)
], UserService.prototype, "findByEmail", null);
UserService = tslib_1.__decorate([
    common_1.Injectable(),
    tslib_1.__param(0, typeorm_1.InjectRepository(user_entity_1.default)),
    tslib_1.__metadata("design:paramtypes", [typeorm_2.Repository,
        actor_service_1.default])
], UserService);
exports.UserService = UserService;
//# sourceMappingURL=user.service.js.map
"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const tslib_1 = require("tslib");
const common_1 = require("@nestjs/common");
const typeorm_1 = require("@nestjs/typeorm");
const typeorm_2 = require("typeorm");
const actor_entity_1 = require("./actor.entity");
const settings_entity_1 = require("./settings.entity");
const type_entity_1 = require("../object/type.entity");
let ActorService = class ActorService {
    constructor(actorRepository, settingsRepository, typeRepository) {
        this.actorRepository = actorRepository;
        this.settingsRepository = settingsRepository;
        this.typeRepository = typeRepository;
    }
    static createBase(objectData) {
    }
    async create(actorData, persist = true) {
        let actor = this.actorRepository.create();
        actor.type = await this.typeRepository.save({
            text: actorData.type || 'Person'
        });
        if (!actorData.user) {
            return { actor };
        }
        actor.user = actorData.user;
        actor.preferredUsername = actorData.preferredUsername;
        actor.lastFetchedAt = Date.now();
        actor.settings = this.settingsRepository.create({});
        if (persist) {
            actor = await this.actorRepository.save(actor);
        }
        console.log('actor', { actor });
        return { actor };
    }
    async update(uid, actorData) {
        let toUpdate = await this.actorRepository.findOne({ uid }, { relations: ['author'] });
        let updated = Object.assign(toUpdate, actorData);
        const actor = await this.actorRepository.save(updated);
        return { actor };
    }
    async delete(uid) {
        return await this.actorRepository.delete({ uid });
    }
};
ActorService = tslib_1.__decorate([
    common_1.Injectable(),
    tslib_1.__param(0, typeorm_1.InjectRepository(actor_entity_1.default)),
    tslib_1.__param(1, typeorm_1.InjectRepository(settings_entity_1.default)),
    tslib_1.__param(2, typeorm_1.InjectRepository(type_entity_1.default)),
    tslib_1.__metadata("design:paramtypes", [typeorm_2.Repository,
        typeorm_2.Repository,
        typeorm_2.Repository])
], ActorService);
exports.default = ActorService;
//# sourceMappingURL=actor.service.js.map
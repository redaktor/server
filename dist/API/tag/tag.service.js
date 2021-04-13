"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const tslib_1 = require("tslib");
const common_1 = require("@nestjs/common");
const typeorm_1 = require("@nestjs/typeorm");
const typeorm_2 = require("typeorm");
const tag_entity_1 = require("./tag.entity");
let TagService = class TagService {
    constructor(tagRepository) {
        this.tagRepository = tagRepository;
    }
    async findAll() {
        const tags = await this.tagRepository.find();
        return { tags };
    }
};
TagService = tslib_1.__decorate([
    common_1.Injectable(),
    tslib_1.__param(0, typeorm_1.InjectRepository(tag_entity_1.default)),
    tslib_1.__metadata("design:paramtypes", [typeorm_2.Repository])
], TagService);
exports.default = TagService;
//# sourceMappingURL=tag.service.js.map
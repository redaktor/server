"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const tslib_1 = require("tslib");
const common_1 = require("@nestjs/common");
const object_entity_1 = require("./object.entity");
const user_decorator_1 = require("../user/user.decorator");
const object_service_1 = require("./object.service");
let ObjectController = class ObjectController {
    constructor(objectService) {
        this.objectService = objectService;
    }
    async findAll(query) {
        return await this.objectService.findAll(query);
    }
    async getFeed(userId, query) {
        return await this.objectService.findFeed(userId, query);
    }
    async findOne(slug) {
        return await this.objectService.findOne({ slug });
    }
    async create(userId, objectData) {
        return this.objectService.create(userId, objectData);
    }
    async update(userId, params, objectData) {
        return this.objectService.update(params.slug, objectData);
    }
    async delete(userId, params) {
        return this.objectService.delete(params.slug);
    }
    async favorite(userId, slug) {
        return await this.objectService.favorite(userId, slug);
    }
    async unFavorite(userId, slug) {
        return await this.objectService.unFavorite(userId, slug);
    }
};
tslib_1.__decorate([
    common_1.Get(),
    tslib_1.__param(0, common_1.Query()),
    tslib_1.__metadata("design:type", Function),
    tslib_1.__metadata("design:paramtypes", [Object]),
    tslib_1.__metadata("design:returntype", Promise)
], ObjectController.prototype, "findAll", null);
tslib_1.__decorate([
    common_1.Get('feed'),
    tslib_1.__param(0, user_decorator_1.default('id')), tslib_1.__param(1, common_1.Query()),
    tslib_1.__metadata("design:type", Function),
    tslib_1.__metadata("design:paramtypes", [Number, Object]),
    tslib_1.__metadata("design:returntype", Promise)
], ObjectController.prototype, "getFeed", null);
tslib_1.__decorate([
    common_1.Get(':slug'),
    tslib_1.__param(0, common_1.Param('slug')),
    tslib_1.__metadata("design:type", Function),
    tslib_1.__metadata("design:paramtypes", [Object]),
    tslib_1.__metadata("design:returntype", Promise)
], ObjectController.prototype, "findOne", null);
tslib_1.__decorate([
    common_1.Post(),
    tslib_1.__param(0, user_decorator_1.default('id')), tslib_1.__param(1, common_1.Body('object')),
    tslib_1.__metadata("design:type", Function),
    tslib_1.__metadata("design:paramtypes", [Number, object_entity_1.CreateObjectDto]),
    tslib_1.__metadata("design:returntype", Promise)
], ObjectController.prototype, "create", null);
tslib_1.__decorate([
    common_1.Put(':slug'),
    tslib_1.__param(0, user_decorator_1.default('id')), tslib_1.__param(1, common_1.Param()),
    tslib_1.__param(2, common_1.Body('object')),
    tslib_1.__metadata("design:type", Function),
    tslib_1.__metadata("design:paramtypes", [Number, Object, object_entity_1.CreateObjectDto]),
    tslib_1.__metadata("design:returntype", Promise)
], ObjectController.prototype, "update", null);
tslib_1.__decorate([
    common_1.Delete(':slug'),
    tslib_1.__param(0, user_decorator_1.default('id')), tslib_1.__param(1, common_1.Param()),
    tslib_1.__metadata("design:type", Function),
    tslib_1.__metadata("design:paramtypes", [Number, Object]),
    tslib_1.__metadata("design:returntype", Promise)
], ObjectController.prototype, "delete", null);
tslib_1.__decorate([
    common_1.Post(':slug/favorite'),
    tslib_1.__param(0, user_decorator_1.default('id')), tslib_1.__param(1, common_1.Param('slug')),
    tslib_1.__metadata("design:type", Function),
    tslib_1.__metadata("design:paramtypes", [Number, Object]),
    tslib_1.__metadata("design:returntype", Promise)
], ObjectController.prototype, "favorite", null);
tslib_1.__decorate([
    common_1.Delete(':slug/favorite'),
    tslib_1.__param(0, user_decorator_1.default('id')), tslib_1.__param(1, common_1.Param('slug')),
    tslib_1.__metadata("design:type", Function),
    tslib_1.__metadata("design:paramtypes", [Number, Object]),
    tslib_1.__metadata("design:returntype", Promise)
], ObjectController.prototype, "unFavorite", null);
ObjectController = tslib_1.__decorate([
    common_1.Controller('objects'),
    tslib_1.__metadata("design:paramtypes", [object_service_1.default])
], ObjectController);
exports.default = ObjectController;
//# sourceMappingURL=object.controller.js.map
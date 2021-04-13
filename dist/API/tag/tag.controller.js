"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const tslib_1 = require("tslib");
const common_1 = require("@nestjs/common");
const swagger_1 = require("@nestjs/swagger");
const tag_service_1 = require("./tag.service");
let TagController = class TagController {
    constructor(tagService) {
        this.tagService = tagService;
    }
    async findAll() {
        return await this.tagService.findAll();
    }
};
tslib_1.__decorate([
    common_1.Get(),
    tslib_1.__metadata("design:type", Function),
    tslib_1.__metadata("design:paramtypes", []),
    tslib_1.__metadata("design:returntype", Promise)
], TagController.prototype, "findAll", null);
TagController = tslib_1.__decorate([
    swagger_1.ApiBearerAuth(),
    swagger_1.ApiProduces('application/json'),
    common_1.Controller('tags'),
    tslib_1.__metadata("design:paramtypes", [tag_service_1.default])
], TagController);
exports.default = TagController;
//# sourceMappingURL=tag.controller.js.map
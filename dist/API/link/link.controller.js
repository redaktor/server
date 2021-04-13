"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const tslib_1 = require("tslib");
const common_1 = require("@nestjs/common");
const link_service_1 = require("./link.service");
let LinkController = class LinkController {
    constructor(linkService) {
        this.linkService = linkService;
    }
    async findAll(query) {
        return await this.linkService.findAll(query);
    }
    async create(linkData) {
        return this.linkService.create(linkData);
    }
    async test() {
        return this.linkService.test();
    }
};
tslib_1.__decorate([
    common_1.Get(),
    tslib_1.__param(0, common_1.Query()),
    tslib_1.__metadata("design:type", Function),
    tslib_1.__metadata("design:paramtypes", [Object]),
    tslib_1.__metadata("design:returntype", Promise)
], LinkController.prototype, "findAll", null);
tslib_1.__decorate([
    common_1.Post(),
    tslib_1.__param(0, common_1.Body('link')),
    tslib_1.__metadata("design:type", Function),
    tslib_1.__metadata("design:paramtypes", [Object]),
    tslib_1.__metadata("design:returntype", Promise)
], LinkController.prototype, "create", null);
tslib_1.__decorate([
    common_1.Get('test'),
    tslib_1.__metadata("design:type", Function),
    tslib_1.__metadata("design:paramtypes", []),
    tslib_1.__metadata("design:returntype", Promise)
], LinkController.prototype, "test", null);
LinkController = tslib_1.__decorate([
    common_1.Controller('links'),
    tslib_1.__metadata("design:paramtypes", [link_service_1.default])
], LinkController);
exports.default = LinkController;
//# sourceMappingURL=link.controller.js.map
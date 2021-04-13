"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const tslib_1 = require("tslib");
const common_1 = require("@nestjs/common");
const swagger_1 = require("@nestjs/swagger");
const profile_service_1 = require("./profile.service");
const user_decorator_1 = require("../user/user.decorator");
let ProfileController = class ProfileController {
    constructor(profileService) {
        this.profileService = profileService;
    }
    async getAPProfile() {
        return await this.profileService.findAP();
    }
    async getProfile(userId, username) {
        return await this.profileService.findProfile(userId, username);
    }
    async follow(mail, username) {
        return await this.profileService.follow(mail, username);
    }
    async unFollow(mail, username) {
        return await this.profileService.unFollow(mail, username);
    }
};
tslib_1.__decorate([
    common_1.Get('APusername'),
    tslib_1.__metadata("design:type", Function),
    tslib_1.__metadata("design:paramtypes", []),
    tslib_1.__metadata("design:returntype", Promise)
], ProfileController.prototype, "getAPProfile", null);
tslib_1.__decorate([
    common_1.Get(':username'),
    tslib_1.__param(0, user_decorator_1.default('id')), tslib_1.__param(1, common_1.Param('username')),
    tslib_1.__metadata("design:type", Function),
    tslib_1.__metadata("design:paramtypes", [Number, String]),
    tslib_1.__metadata("design:returntype", Promise)
], ProfileController.prototype, "getProfile", null);
tslib_1.__decorate([
    swagger_1.ApiResponse({ status: 201, description: 'The user has been successfully followed.' }),
    swagger_1.ApiResponse({ status: 403, description: 'Forbidden.' }),
    common_1.Post(':username/follow'),
    tslib_1.__param(0, user_decorator_1.default('mail')), tslib_1.__param(1, common_1.Param('username')),
    tslib_1.__metadata("design:type", Function),
    tslib_1.__metadata("design:paramtypes", [String, String]),
    tslib_1.__metadata("design:returntype", Promise)
], ProfileController.prototype, "follow", null);
tslib_1.__decorate([
    swagger_1.ApiOperation({ title: 'Unfollow user' }),
    swagger_1.ApiResponse({ status: 201, description: 'The user has been successfully unfollowed.' }),
    swagger_1.ApiResponse({ status: 403, description: 'Forbidden.' }),
    common_1.Delete(':username/follow'),
    tslib_1.__param(0, user_decorator_1.default('mail')), tslib_1.__param(1, common_1.Param('username')),
    tslib_1.__metadata("design:type", Function),
    tslib_1.__metadata("design:paramtypes", [String, String]),
    tslib_1.__metadata("design:returntype", Promise)
], ProfileController.prototype, "unFollow", null);
ProfileController = tslib_1.__decorate([
    swagger_1.ApiBearerAuth(),
    common_1.Controller('profiles'),
    tslib_1.__metadata("design:paramtypes", [profile_service_1.default])
], ProfileController);
exports.default = ProfileController;
//# sourceMappingURL=profile.controller.js.map
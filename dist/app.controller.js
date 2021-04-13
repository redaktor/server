"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const tslib_1 = require("tslib");
const path_1 = require("path");
const common_1 = require("@nestjs/common");
const passport_1 = require("@nestjs/passport");
const user_entity_1 = require("./API/user/user.entity");
const user_decorator_1 = require("./API/user/user.decorator");
const user_service_1 = require("./API/user/user.service");
const auth_service_1 = require("./API/auth/auth.service");
const typeorm_1 = require("typeorm");
let AppController = class AppController {
    constructor(userService, authService) {
        this.userService = userService;
        this.authService = authService;
    }
    async login(req) {
        return this.authService.login(req.user);
    }
    getProfile(req) {
        return req.user;
    }
    async getMe(req) {
        const user = await this.userService.findById(req.user.uid);
        console.log('IS LOGGED IN?', user);
        return user;
    }
    async create(userData) {
        return await this.userService.create(userData);
    }
    async update(req, userData) {
        return await this.userService.update(req.user.uid, userData);
    }
    async delete(req, mail) {
        return await this.userService.delete(req.user.uid, mail);
    }
    root(res) {
        res.sendFile(path_1.resolve(__dirname, '../../../src/client/output/dist/index.html'));
    }
    async test() {
        const data = await typeorm_1.getRepository('permission').find();
        console.log('find', data);
        return data;
    }
    onApplicationBootstrap() {
    }
};
tslib_1.__decorate([
    common_1.UseGuards(passport_1.AuthGuard('local')),
    common_1.Post('auth/login'),
    tslib_1.__param(0, common_1.Request()),
    tslib_1.__metadata("design:type", Function),
    tslib_1.__metadata("design:paramtypes", [Object]),
    tslib_1.__metadata("design:returntype", Promise)
], AppController.prototype, "login", null);
tslib_1.__decorate([
    common_1.UseGuards(passport_1.AuthGuard('jwt')),
    common_1.Get('auth/login'),
    tslib_1.__param(0, common_1.Request()),
    tslib_1.__metadata("design:type", Function),
    tslib_1.__metadata("design:paramtypes", [Object]),
    tslib_1.__metadata("design:returntype", void 0)
], AppController.prototype, "getProfile", null);
tslib_1.__decorate([
    common_1.UseGuards(passport_1.AuthGuard('jwt')),
    common_1.Get('me'),
    tslib_1.__param(0, common_1.Request()),
    tslib_1.__metadata("design:type", Function),
    tslib_1.__metadata("design:paramtypes", [Object]),
    tslib_1.__metadata("design:returntype", Promise)
], AppController.prototype, "getMe", null);
tslib_1.__decorate([
    common_1.Post('users'),
    tslib_1.__param(0, common_1.Body('user')),
    tslib_1.__metadata("design:type", Function),
    tslib_1.__metadata("design:paramtypes", [user_entity_1.CreateUserDto]),
    tslib_1.__metadata("design:returntype", Promise)
], AppController.prototype, "create", null);
tslib_1.__decorate([
    common_1.Put('user'),
    tslib_1.__param(0, common_1.Request()), tslib_1.__param(1, common_1.Body('user')),
    tslib_1.__metadata("design:type", Function),
    tslib_1.__metadata("design:paramtypes", [Object, user_entity_1.UpdateUserDto]),
    tslib_1.__metadata("design:returntype", Promise)
], AppController.prototype, "update", null);
tslib_1.__decorate([
    common_1.Delete('users/:mail'),
    tslib_1.__param(0, common_1.Request()), tslib_1.__param(1, common_1.Param('mail')),
    tslib_1.__metadata("design:type", Function),
    tslib_1.__metadata("design:paramtypes", [Object, Object]),
    tslib_1.__metadata("design:returntype", Promise)
], AppController.prototype, "delete", null);
tslib_1.__decorate([
    common_1.Get(),
    tslib_1.__param(0, common_1.Res()),
    tslib_1.__metadata("design:type", Function),
    tslib_1.__metadata("design:paramtypes", [Object]),
    tslib_1.__metadata("design:returntype", void 0)
], AppController.prototype, "root", null);
tslib_1.__decorate([
    common_1.Get('test'),
    tslib_1.__metadata("design:type", Function),
    tslib_1.__metadata("design:paramtypes", []),
    tslib_1.__metadata("design:returntype", Promise)
], AppController.prototype, "test", null);
AppController = tslib_1.__decorate([
    common_1.UseInterceptors(user_decorator_1.ExcludeNullInterceptor),
    common_1.Controller(),
    tslib_1.__metadata("design:paramtypes", [user_service_1.UserService,
        auth_service_1.AuthService])
], AppController);
exports.AppController = AppController;
//# sourceMappingURL=app.controller.js.map
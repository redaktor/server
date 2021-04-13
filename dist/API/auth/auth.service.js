"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const tslib_1 = require("tslib");
const common_1 = require("@nestjs/common");
const jwt_1 = require("@nestjs/jwt");
const user_service_1 = require("../user/user.service");
const uuid_1 = require("../../framework/uuid");
let AuthService = class AuthService {
    constructor(userService, jwtService) {
        this.userService = userService;
        this.jwtService = jwtService;
    }
    createUserToken(user) {
        let now = new Date();
        let exp = new Date(now);
        exp.setDate(now.getDate() + 60);
        return {
            sub: user.uid,
            name: user.name,
            xsrf: uuid_1.default(),
            exp: exp.getTime(),
            iat: now.getTime(),
            iss: 'redaktor'
        };
    }
    ;
    async validateUser(name, password) {
        const user = await this.userService.findOne({ name, password });
        if (user && user.password === password) {
            const { password } = user, result = tslib_1.__rest(user, ["password"]);
            return result;
        }
        return null;
    }
    async login(user) {
        return {
            access_token: this.jwtService.sign(this.createUserToken(user)),
        };
    }
};
AuthService = tslib_1.__decorate([
    common_1.Injectable(),
    tslib_1.__metadata("design:paramtypes", [user_service_1.UserService,
        jwt_1.JwtService])
], AuthService);
exports.AuthService = AuthService;
//# sourceMappingURL=auth.service.js.map
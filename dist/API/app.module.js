"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const tslib_1 = require("tslib");
const common_1 = require("@nestjs/common");
const typeorm_1 = require("@nestjs/typeorm");
const typeorm_2 = require("typeorm");
const user_module_1 = require("./user/user.module");
const profile_module_1 = require("./profile/profile.module");
const article_module_1 = require("./article/article.module");
const tag_module_1 = require("./tag/tag.module");
const link_module_1 = require("./link/link.module");
const app_controller_1 = require("./app.controller");
let AppModule = class AppModule {
    constructor(connection) {
        this.connection = connection;
    }
};
AppModule = tslib_1.__decorate([
    common_1.Module({
        imports: [
            typeorm_1.TypeOrmModule.forRoot(),
            user_module_1.default,
            profile_module_1.default,
            article_module_1.default,
            tag_module_1.default,
            link_module_1.default
        ],
        controllers: [app_controller_1.default],
        providers: []
    }),
    tslib_1.__metadata("design:paramtypes", [typeorm_2.Connection])
], AppModule);
exports.default = AppModule;
//# sourceMappingURL=app.module.js.map
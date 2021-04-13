"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const tslib_1 = require("tslib");
const common_1 = require("@nestjs/common");
const typeorm_1 = require("@nestjs/typeorm");
const user_module_1 = require("../user/user.module");
const user_entity_1 = require("../user/user.entity");
const profile_controller_1 = require("./profile.controller");
const profile_service_1 = require("./profile.service");
const follows_entity_1 = require("./follows.entity");
let ProfileModule = class ProfileModule {
    configure(consumer) {
    }
};
ProfileModule = tslib_1.__decorate([
    common_1.Module({
        imports: [typeorm_1.TypeOrmModule.forFeature([user_entity_1.default, follows_entity_1.default]), user_module_1.default],
        providers: [profile_service_1.default],
        controllers: [
            profile_controller_1.default
        ],
        exports: []
    })
], ProfileModule);
exports.default = ProfileModule;
//# sourceMappingURL=profile.module.js.map
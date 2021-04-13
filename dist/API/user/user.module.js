"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const tslib_1 = require("tslib");
const common_1 = require("@nestjs/common");
const typeorm_1 = require("@nestjs/typeorm");
const user_service_1 = require("./user.service");
const user_entity_1 = require("./user.entity");
const actor_entity_1 = require("../actor/actor.entity");
const settings_entity_1 = require("../actor/settings.entity");
const type_entity_1 = require("../object/type.entity");
const actor_service_1 = require("../actor/actor.service");
let UserModule = class UserModule {
    configure(consumer) {
    }
};
UserModule = tslib_1.__decorate([
    common_1.Module({
        imports: [
            typeorm_1.TypeOrmModule.forFeature([
                user_entity_1.default, actor_entity_1.default, settings_entity_1.default, type_entity_1.default
            ]),
        ],
        providers: [user_service_1.UserService, actor_service_1.default],
        controllers: [],
        exports: [user_service_1.UserService]
    })
], UserModule);
exports.UserModule = UserModule;
//# sourceMappingURL=user.module.js.map
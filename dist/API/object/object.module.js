"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const tslib_1 = require("tslib");
const common_1 = require("@nestjs/common");
const typeorm_1 = require("@nestjs/typeorm");
const user_module_1 = require("../user/user.module");
const object_controller_1 = require("./object.controller");
const object_service_1 = require("./object.service");
const object_entity_1 = require("./object.entity");
const user_entity_1 = require("../user/user.entity");
const follows_entity_1 = require("../profile/follows.entity");
let ObjectModule = class ObjectModule {
    configure(consumer) {
    }
};
ObjectModule = tslib_1.__decorate([
    common_1.Module({
        imports: [
            typeorm_1.TypeOrmModule.forFeature([object_entity_1.default, user_entity_1.default, follows_entity_1.default]),
            user_module_1.default
        ],
        providers: [object_service_1.default],
        controllers: [object_controller_1.default]
    })
], ObjectModule);
exports.default = ObjectModule;
//# sourceMappingURL=object.module.js.map
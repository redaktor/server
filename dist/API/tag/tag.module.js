"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const tslib_1 = require("tslib");
const common_1 = require("@nestjs/common");
const typeorm_1 = require("@nestjs/typeorm");
const user_module_1 = require("../user/user.module");
const tag_service_1 = require("./tag.service");
const tag_entity_1 = require("./tag.entity");
const tag_controller_1 = require("./tag.controller");
let TagModule = class TagModule {
    configure(consumer) { }
};
TagModule = tslib_1.__decorate([
    common_1.Module({
        imports: [typeorm_1.TypeOrmModule.forFeature([tag_entity_1.default]), user_module_1.default],
        providers: [tag_service_1.default],
        controllers: [tag_controller_1.default],
        exports: []
    })
], TagModule);
exports.default = TagModule;
//# sourceMappingURL=tag.module.js.map
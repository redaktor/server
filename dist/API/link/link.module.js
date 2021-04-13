"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const tslib_1 = require("tslib");
const common_1 = require("@nestjs/common");
const typeorm_1 = require("@nestjs/typeorm");
const link_controller_1 = require("./link.controller");
const link_service_1 = require("./link.service");
const link_entity_1 = require("./link.entity");
const block_entity_1 = require("./block.entity");
const host_entity_1 = require("./host.entity");
const auth_entity_1 = require("./auth.entity");
const path_entity_1 = require("./path.entity");
const query_entity_1 = require("./query.entity");
const hash_entity_1 = require("./hash.entity");
let LinkModule = class LinkModule {
    configure(consumer) {
    }
};
LinkModule = tslib_1.__decorate([
    common_1.Module({
        imports: [
            typeorm_1.TypeOrmModule.forFeature([
                link_entity_1.default, block_entity_1.default, host_entity_1.default, auth_entity_1.default,
                path_entity_1.default, query_entity_1.default, hash_entity_1.default
            ])
        ],
        providers: [link_service_1.default],
        controllers: [link_controller_1.default]
    })
], LinkModule);
exports.default = LinkModule;
//# sourceMappingURL=link.module.js.map
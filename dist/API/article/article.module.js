"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const tslib_1 = require("tslib");
const common_1 = require("@nestjs/common");
const typeorm_1 = require("@nestjs/typeorm");
const user_module_1 = require("../user/user.module");
const article_controller_1 = require("./article.controller");
const article_service_1 = require("./article.service");
const article_entity_1 = require("./article.entity");
const comment_entity_1 = require("./comment.entity");
const user_entity_1 = require("../user/user.entity");
const follows_entity_1 = require("../profile/follows.entity");
let ArticleModule = class ArticleModule {
    configure(consumer) {
    }
};
ArticleModule = tslib_1.__decorate([
    common_1.Module({
        imports: [
            typeorm_1.TypeOrmModule.forFeature([article_entity_1.default, comment_entity_1.default, user_entity_1.default, follows_entity_1.default]),
            user_module_1.default
        ],
        providers: [article_service_1.default],
        controllers: [article_controller_1.default]
    })
], ArticleModule);
exports.default = ArticleModule;
//# sourceMappingURL=article.module.js.map
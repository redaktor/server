"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const tslib_1 = require("tslib");
const base_entity_1 = require("../shared/base.entity");
const object_entity_1 = require("../object/object.entity");
const host_entity_1 = require("./host.entity");
const auth_entity_1 = require("./auth.entity");
const path_entity_1 = require("./path.entity");
const query_entity_1 = require("./query.entity");
const hash_entity_1 = require("./hash.entity");
const block_entity_1 = require("./block.entity");
class CreateLinkDto {
}
exports.CreateLinkDto = CreateLinkDto;
class LinkOutput extends base_entity_1.default {
}
exports.LinkOutput = LinkOutput;
class QueryFullLinkDto {
}
exports.QueryFullLinkDto = QueryFullLinkDto;
class QueryBlockDto {
}
exports.QueryBlockDto = QueryBlockDto;
class CreateBlockDto {
}
exports.CreateBlockDto = CreateBlockDto;
function plainRelations(entity) {
    ['host', 'auth', 'path', 'hash', 'query', 'block'].forEach((k) => {
        if (!entity.hasOwnProperty(k) || !entity[k] || typeof entity[k] !== 'object') {
            entity[k] = null;
        }
        else if (entity[k].hasOwnProperty('text')) {
            entity[k] = entity[k].text;
        }
    });
    return entity;
}
exports.plainRelations = plainRelations;
let LinkEntity = class LinkEntity extends base_entity_1.default {
    toLinkOutput() {
        if (!this.host) {
            return;
        }
        this.href = `${this.protocol}//${this.auth ? this.auth.text + '@' : ''}${this.host.text}` +
            `${this.port ? ':' + this.port : ''}${this.path ? '/' + this.path.text : ''}` +
            `${this.query ? '?' + this.query.text : ''}${this.hash ? '#' + this.hash.text : ''}`;
        plainRelations(this);
    }
};
tslib_1.__decorate([
    base_entity_1.AfterInsert(),
    base_entity_1.AfterLoad(),
    tslib_1.__metadata("design:type", Function),
    tslib_1.__metadata("design:paramtypes", []),
    tslib_1.__metadata("design:returntype", void 0)
], LinkEntity.prototype, "toLinkOutput", null);
tslib_1.__decorate([
    base_entity_1.ManyToOne(type => object_entity_1.default),
    tslib_1.__metadata("design:type", object_entity_1.default)
], LinkEntity.prototype, "preview", void 0);
tslib_1.__decorate([
    base_entity_1.Column({ nullable: true }),
    tslib_1.__metadata("design:type", Number)
], LinkEntity.prototype, "height", void 0);
tslib_1.__decorate([
    base_entity_1.Column({ nullable: true }),
    tslib_1.__metadata("design:type", Number)
], LinkEntity.prototype, "width", void 0);
tslib_1.__decorate([
    base_entity_1.Column({ nullable: true, default: 'noopener noreferrer' }),
    tslib_1.__metadata("design:type", String)
], LinkEntity.prototype, "rel", void 0);
tslib_1.__decorate([
    base_entity_1.Column({ nullable: true }),
    tslib_1.__metadata("design:type", String)
], LinkEntity.prototype, "hreflang", void 0);
tslib_1.__decorate([
    base_entity_1.Column({ nullable: true, default: 'text/html' }),
    tslib_1.__metadata("design:type", String)
], LinkEntity.prototype, "mediaType", void 0);
tslib_1.__decorate([
    base_entity_1.Column({ nullable: true, default: 'https' }),
    tslib_1.__metadata("design:type", String)
], LinkEntity.prototype, "protocol", void 0);
tslib_1.__decorate([
    base_entity_1.ManyToOne(type => auth_entity_1.default),
    tslib_1.__metadata("design:type", auth_entity_1.default)
], LinkEntity.prototype, "auth", void 0);
tslib_1.__decorate([
    base_entity_1.ManyToOne(type => host_entity_1.default),
    tslib_1.__metadata("design:type", host_entity_1.default)
], LinkEntity.prototype, "host", void 0);
tslib_1.__decorate([
    base_entity_1.Column({ type: 'smallint', nullable: true }),
    tslib_1.__metadata("design:type", Number)
], LinkEntity.prototype, "port", void 0);
tslib_1.__decorate([
    base_entity_1.ManyToOne(type => path_entity_1.default),
    tslib_1.__metadata("design:type", path_entity_1.default)
], LinkEntity.prototype, "path", void 0);
tslib_1.__decorate([
    base_entity_1.ManyToOne(type => query_entity_1.default),
    tslib_1.__metadata("design:type", query_entity_1.default)
], LinkEntity.prototype, "query", void 0);
tslib_1.__decorate([
    base_entity_1.ManyToOne(type => hash_entity_1.default),
    tslib_1.__metadata("design:type", hash_entity_1.default)
], LinkEntity.prototype, "hash", void 0);
tslib_1.__decorate([
    base_entity_1.ManyToOne(type => block_entity_1.default, { eager: true }),
    tslib_1.__metadata("design:type", block_entity_1.default)
], LinkEntity.prototype, "block", void 0);
LinkEntity = tslib_1.__decorate([
    base_entity_1.Entity('link')
], LinkEntity);
exports.default = LinkEntity;
//# sourceMappingURL=link.entity.js.map
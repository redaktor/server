"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const tslib_1 = require("tslib");
const typeorm_1 = require("typeorm");
tslib_1.__exportStar(require("typeorm"), exports);
exports.coreTypes = ['Link', 'Mention',
    'Application', 'Group', 'Organization', 'Person', 'Service',
    'Article', 'Audio', 'Document', 'Event', 'Image', 'Note', 'Page', 'Place',
    'Profile', 'Relationship', 'Tombstone', 'Video',
    'Accept', 'Add', 'Announce', 'Arrive', 'Block', 'Create', 'Delete', 'Dislike',
    'Flag', 'Follow', 'Ignore', 'Invite', 'Join', 'Leave', 'Like', 'Listen', 'Move',
    'Offer', 'Question', 'Reject', 'Read', 'Remove', 'TentativeReject', 'TentativeAccept',
    'Travel', 'Undo', 'Update', 'View'];
class BaseEntity extends typeorm_1.BaseEntity {
}
tslib_1.__decorate([
    typeorm_1.PrimaryGeneratedColumn(),
    tslib_1.__metadata("design:type", Number)
], BaseEntity.prototype, "uid", void 0);
tslib_1.__decorate([
    typeorm_1.CreateDateColumn(),
    tslib_1.__metadata("design:type", Date)
], BaseEntity.prototype, "published", void 0);
tslib_1.__decorate([
    typeorm_1.UpdateDateColumn(),
    tslib_1.__metadata("design:type", Date)
], BaseEntity.prototype, "updated", void 0);
exports.default = BaseEntity;
//# sourceMappingURL=base.entity.js.map
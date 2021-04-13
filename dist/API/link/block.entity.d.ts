import BaseEntity from "../shared/base.entity";
export default class BlockEntity extends BaseEntity {
    silence: boolean;
    media: boolean;
    reports: boolean;
    content: boolean;
    recursive: boolean;
    blockHost: boolean;
}

import BaseEntity from '../shared/base.entity';
import ContentEntity from '../object/content.entity';
export declare class CreatePermissionDto {
    id: string;
    name: string;
    contentMap?: {
        [k: string]: string;
    };
    parent?: PermissionEntity;
    enabled?: boolean;
}
export default class PermissionEntity extends BaseEntity {
    id: string;
    name: string;
    enabled: boolean;
    contentMap: ContentEntity[];
    parent: PermissionEntity;
}

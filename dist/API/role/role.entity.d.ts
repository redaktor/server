import BaseEntity from '../shared/base.entity';
import PermissionEntity from '../permission/permission.entity';
import ContentEntity from '../object/content.entity';
export declare class CreateRoleDto {
    id: string;
    name: string;
    order: number;
    contentMap?: {
        [k: string]: string;
    };
}
export default class RoleEntity extends BaseEntity {
    id: string;
    name: string;
    contentMap: ContentEntity[];
    permissions: PermissionEntity[];
}

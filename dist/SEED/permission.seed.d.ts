import { CreatePermissionDto } from '../API/permission/permission.entity';
interface CreatePermissionSeed extends CreatePermissionDto {
    parentId?: string;
}
export declare const PERMISSIONS: CreatePermissionSeed[];
export declare const ROLES: {
    id: string;
    name: string;
    contentMap: {
        en: string;
    };
    permissions: any[];
}[];
export {};

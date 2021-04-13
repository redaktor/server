import BaseEntity from '../shared/base.entity';
import ActorEntity from '../actor/actor.entity';
export interface UserData {
    name: string;
    email: string;
    actors?: ActorEntity[];
    selectedActor?: ActorEntity;
}
export interface UserRO {
    user: UserEntity;
}
export interface MinApRO {
    [key: string]: any;
    id: string;
}
export declare class LoginUserDto {
    readonly password: string;
    readonly name: string;
}
export declare class CreateUserDto extends LoginUserDto {
    readonly email: string;
}
export declare class UpdateUserDto {
    readonly name?: string;
    readonly bio?: string;
    readonly image?: string;
    readonly email?: string;
}
export default class UserEntity extends BaseEntity {
    hashPassword(): void;
    name: string;
    email: string;
    salt: string;
    password: string;
    twoFactorSecret: string;
    twoFactorEnabled: boolean;
    twoFactorTempSecret?: string;
    actors: ActorEntity[];
    defaultActor: ActorEntity;
    toSelected(): void;
    selectedActor: ActorEntity;
}

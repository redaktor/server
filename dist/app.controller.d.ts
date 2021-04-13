import { OnApplicationBootstrap } from '@nestjs/common';
import { UserRO, CreateUserDto, UpdateUserDto } from './API/user/user.entity';
import { UserService } from './API/user/user.service';
import { AuthService } from './API/auth/auth.service';
export declare class AppController implements OnApplicationBootstrap {
    private readonly userService;
    private readonly authService;
    constructor(userService: UserService, authService: AuthService);
    login(req: any): Promise<{
        access_token: string;
    }>;
    getProfile(req: any): any;
    getMe(req: any): Promise<UserRO>;
    create(userData: CreateUserDto): Promise<UserRO>;
    update(req: any, userData: UpdateUserDto): Promise<UserRO>;
    delete(req: any, mail: any): Promise<any>;
    root(res: any): void;
    test(): Promise<unknown[]>;
    onApplicationBootstrap(): void;
}

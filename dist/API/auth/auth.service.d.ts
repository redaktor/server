import { JwtService } from '@nestjs/jwt';
import { UserService } from '../user/user.service';
import UserEntity from '../user/user.entity';
export declare class AuthService {
    private readonly userService;
    private readonly jwtService;
    constructor(userService: UserService, jwtService: JwtService);
    createUserToken(user: UserEntity): {
        sub: number;
        name: string;
        xsrf: string;
        exp: number;
        iat: number;
        iss: string;
    };
    validateUser(name: string, password: string): Promise<any>;
    login(user: any): Promise<{
        access_token: string;
    }>;
}

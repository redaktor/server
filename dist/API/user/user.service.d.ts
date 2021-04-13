import { Repository } from 'typeorm';
import UserEntity, { UserRO, CreateUserDto, LoginUserDto, UpdateUserDto } from './user.entity';
import ActorService from '../actor/actor.service';
export declare class UserService {
    protected readonly userRepository: Repository<UserEntity>;
    private readonly actorService;
    constructor(userRepository: Repository<UserEntity>, actorService: ActorService);
    create(dto: CreateUserDto, persist?: boolean): Promise<UserRO>;
    update(id: number, dto: UpdateUserDto): Promise<UserRO | undefined>;
    delete(id: number, email: string): Promise<any>;
    findOne(loginUserDto: LoginUserDto): Promise<UserEntity | undefined>;
    findById(id: number): Promise<UserRO>;
    findByEmail(email: string): Promise<UserRO>;
}

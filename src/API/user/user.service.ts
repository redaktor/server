import * as crypto from 'crypto';
import { Injectable, HttpStatus, HttpException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, getRepository } from 'typeorm';
import { Any, string } from '../../framework/validator';
import UserEntity, {UserRO,CreateUserDto,LoginUserDto,UpdateUserDto} from './user.entity';
import ActorService from '../actor/actor.service';

@Injectable()
export class UserService {
  constructor(
    @InjectRepository(UserEntity)
    protected readonly userRepository: Repository<UserEntity>,
    private readonly actorService: ActorService
  ) {}

//  @Validate() // TODO FIXME in Controller
  async create(dto: CreateUserDto, persist = true): Promise<UserRO> {
    //console.log('dto',dto);
    // check uniqueness of name/email
    const { name, email, password } = dto;
    const dbQuery = getRepository(UserEntity)
      .createQueryBuilder('user')
      .where('user.name = :name', { name })
      .orWhere('user.email = :email', { email });

    const qUser = await dbQuery.getOne();
    if (qUser) {
      const errors = { name: 'Username and email must be unique.' };
      throw new HttpException({
        message: 'Input data validation failed', errors
      }, HttpStatus.BAD_REQUEST);
    }
    // Create new user
    let user = this.userRepository.create({ name, email, password });
    const actorRO = await this.actorService.create({
      user,
      preferredUsername: name,
      isActor: true
    });
    user.actors = [actorRO.actor];
    user.defaultActor = actorRO.actor;


    /* TODO IF OWNER create domain as default actor ! */

    /* TODO check controller
    const errors = await validate(user);
    if (errors.length > 0) {
      const _errors = {name: 'Userinput is not valid.'};
      throw new HttpException({message: 'Input data validation failed', _errors}, HttpStatus.BAD_REQUEST);

    } else {
      const savedUser = await this.userRepository.save(user);
      return savedUser);
    }
    */
    console.log('u', { user })
    if (persist) { user = await this.userRepository.save(user) }
    console.log('user', { user })
    return { user };
  }

  //@Validate()
  async update(id: number, dto: UpdateUserDto): Promise<UserRO | undefined> {
    let toUpdate = await this.userRepository.findOne(id);
    if (!!toUpdate) {
      delete toUpdate.password;
      //delete toUpdate.favorites;
    }
    let updated = Object.assign(toUpdate, dto);
    const user = await this.userRepository.save(updated);
    return { user };
  }

  //@Validate()
  async delete(id: number, @Any(string.isEmail()) email: string): Promise<any> {
    let user = await this.userRepository.findOne(id);
    if (!user) {
      const errors = {User: ' not found'};
      throw new HttpException({ errors }, 401);
    };
    return await this.userRepository.delete({ email });
  }


  /*
    async findAll(): Promise<UserEntity[]> {
      return await this.userRepository.find();
    }
  */

  async findOne(loginUserDto: LoginUserDto): Promise<UserEntity | undefined> {
    console.log('findOne')
    return await this.userRepository.findOne({
      name: loginUserDto.name,
      password: crypto.createHmac('sha512', loginUserDto.password).digest('hex')
    }, {
      relations: ['actors', 'selectedActor']
    });
  }

  async findById(id: number): Promise<UserRO> {
    const user = await this.userRepository.findOne(id);
    if (!user) {
      const errors = {User: ' not found'};
      throw new HttpException({ errors }, 401);
    };
    return { user };
  }

  //@Validate()
  async findByEmail(@Any(string.isEmail()) email: string): Promise<UserRO> {
    const user = await this.userRepository.findOne({email});
    if (!user) {
      const errors = {User: ' not found'};
      throw new HttpException({ errors }, 401);
    };
    return { user };
  }
}

import { Injectable } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { UserService } from '../user/user.service';
import UserEntity from '../user/user.entity';
import uuid from '../../framework/uuid';

@Injectable()
export class AuthService {
  constructor(
    private readonly userService: UserService,
    private readonly jwtService: JwtService,
  ) {}

  createUserToken(user: UserEntity) {
    let now = new Date();
    let exp = new Date(now);
    exp.setDate(now.getDate() + 60);

    return {
      //mail: user.mail,
      sub: user.uid,
      name: user.name,
      xsrf: uuid(),
      exp: exp.getTime(),
      iat: now.getTime(),
      iss: 'redaktor'
    }
  };

  async validateUser(name: string, password: string): Promise<any> {
    const user = await this.userService.findOne({name, password});
    if (user && user.password === password) {
      const { password, ...result } = user;
      return result;
    }
    return null;
  }

  async login(user: any) {
    return {
      access_token: this.jwtService.sign(this.createUserToken(user)),
    };
  }
}

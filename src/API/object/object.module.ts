import { MiddlewareConsumer, Module, NestModule, RequestMethod } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import UserModule from '../user/user.module';
import ObjectController from './object.controller';
import ObjectService from './object.service';
import Object from './object.entity';
import User from '../user/user.entity';
import Follows from '../profile/follows.entity';

@Module({
  imports: [
    TypeOrmModule.forFeature([Object, User, Follows]),
    UserModule
  ],
  providers: [ ObjectService ],
  controllers: [ ObjectController ]
})
export default class ObjectModule implements NestModule {
  public configure(consumer: MiddlewareConsumer) {

  }
}

import { Module, MiddlewareConsumer, NestModule, RequestMethod } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import UserModule from '../user/user.module';
import UserEntity from "../user/user.entity";
import ProfileController from './profile.controller';
import ProfileService from './profile.service';
import FollowsEntity from "./follows.entity";

@Module({
  imports: [TypeOrmModule.forFeature([UserEntity, FollowsEntity]), UserModule],
  providers: [ProfileService],
  controllers: [
    ProfileController
  ],
  exports: []
})
export default class ProfileModule implements NestModule {
  public configure(consumer: MiddlewareConsumer) {
    /*
    consumer
      .apply(AuthMiddleware)
      .forRoutes({path: 'profiles/:username/follow', method: RequestMethod.ALL});
    */
  }
}

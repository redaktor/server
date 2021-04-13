import { Module, MiddlewareConsumer, NestModule, RequestMethod } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
//import AuthMiddleware from './auth.middleware';
import { UserService } from './user.service';
import UserEntity from './user.entity';
import ActorEntity from '../actor/actor.entity';
import SettingsEntity from '../actor/settings.entity';
import TypeEntity from '../object/type.entity';
import ActorService from '../actor/actor.service';
import LinkEntity from '../link/link.entity';
/*import BlockEntity from '../link/block.entity';
import HostEntity from '../link/host.entity';
import AuthEntity from '../link/auth.entity';
import PathEntity from '../link/path.entity';
import QueryEntity from '../link/query.entity';
import HashEntity from "../link/hash.entity";*/
import LinkModule from '../link/link.module';
//import LinkService from '../link/link.service';

@Module({
  imports: [
    TypeOrmModule.forFeature([
      UserEntity, ActorEntity, SettingsEntity, TypeEntity/*, LinkEntity,
      BlockEntity, HostEntity, AuthEntity, PathEntity, QueryEntity, HashEntity*/
    ]),
    //LinkModule
  ],
  providers: [ UserService, ActorService/*, LinkService*/ ],
  controllers: [ ],
  exports: [ UserService ]
})
export class UserModule implements NestModule {
  public configure(consumer: MiddlewareConsumer) {
    /*
    consumer
      .apply(AuthMiddleware)
      .forRoutes(
        {path: 'user', method: RequestMethod.GET},
        {path: 'user', method: RequestMethod.PUT},
        {path: 'users/:mail', method: RequestMethod.DELETE}
      );
      */
  }
}

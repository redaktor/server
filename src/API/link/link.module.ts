import { MiddlewareConsumer, Module, NestModule } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';

import LinkController from './link.controller';
import LinkService from './link.service';
import LinkEntity from './link.entity';
import BlockEntity from './block.entity';
import HostEntity from './host.entity';
import AuthEntity from './auth.entity';
import PathEntity from './path.entity';
import QueryEntity from './query.entity';
import HashEntity from "./hash.entity";

@Module({
  imports: [
    TypeOrmModule.forFeature([
      LinkEntity, BlockEntity, HostEntity, AuthEntity,
      PathEntity, QueryEntity, HashEntity
    ])
  ],
  providers: [ LinkService ],
  controllers: [ LinkController ]
})
export default class LinkModule implements NestModule {
  public configure(consumer: MiddlewareConsumer) {
    /*
    consumer
      .apply(AuthMiddleware)
      .forRoutes(
        {path: 'aticles/feed', method: RequestMethod.GET},
        {path: 'aticles', method: RequestMethod.POST},
        {path: 'aticles/:slug', method: RequestMethod.DELETE},
        {path: 'aticles/:slug', method: RequestMethod.PUT},
        {path: 'links/:slug/comments', method: RequestMethod.POST},
        {path: 'links/:slug/comments/:id', method: RequestMethod.DELETE},
        {path: 'links/:slug/favorite', method: RequestMethod.POST},
        {path: 'links/:slug/favorite', method: RequestMethod.DELETE}
      )
      */
  }
}

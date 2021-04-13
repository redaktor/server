import { MiddlewareConsumer, Module, NestModule, RequestMethod } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import AuthMiddleware from '../user/auth.middleware';
import UserModule from '../user/user.module';
import ArticleController from './article.controller';
import ArticleService from './article.service';
import Article from './article.entity';
import Comment from './comment.entity';
import User from '../user/user.entity';
import Follows from '../profile/follows.entity';

@Module({
  imports: [
    TypeOrmModule.forFeature([Article, Comment, User, Follows]),
    UserModule
  ],
  providers: [ ArticleService ],
  controllers: [ ArticleController ]
})
export default class ArticleModule implements NestModule {
  public configure(consumer: MiddlewareConsumer) {
    /*
    consumer
      .apply(AuthMiddleware)
      .forRoutes(
        {path: 'aticles/feed', method: RequestMethod.GET},
        {path: 'aticles', method: RequestMethod.POST},
        {path: 'aticles/:slug', method: RequestMethod.DELETE},
        {path: 'aticles/:slug', method: RequestMethod.PUT},
        {path: 'articles/:slug/comments', method: RequestMethod.POST},
        {path: 'articles/:slug/comments/:id', method: RequestMethod.DELETE},
        {path: 'articles/:slug/favorite', method: RequestMethod.POST},
        {path: 'articles/:slug/favorite', method: RequestMethod.DELETE}
      )
      */
  }
}

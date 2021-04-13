import { MiddlewareConsumer, NestModule } from '@nestjs/common';
export default class ArticleModule implements NestModule {
    configure(consumer: MiddlewareConsumer): void;
}

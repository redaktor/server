import { MiddlewareConsumer, NestModule } from '@nestjs/common';
export default class TagModule implements NestModule {
    configure(consumer: MiddlewareConsumer): void;
}

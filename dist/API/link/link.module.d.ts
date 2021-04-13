import { MiddlewareConsumer, NestModule } from '@nestjs/common';
export default class LinkModule implements NestModule {
    configure(consumer: MiddlewareConsumer): void;
}

import { MiddlewareConsumer, NestModule } from '@nestjs/common';
export default class ObjectModule implements NestModule {
    configure(consumer: MiddlewareConsumer): void;
}

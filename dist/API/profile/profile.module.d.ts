import { MiddlewareConsumer, NestModule } from '@nestjs/common';
export default class ProfileModule implements NestModule {
    configure(consumer: MiddlewareConsumer): void;
}

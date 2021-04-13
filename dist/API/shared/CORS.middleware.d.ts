import { NestMiddleware, MiddlewareFunction } from '@nestjs/common';
export default class CorsMiddleware implements NestMiddleware {
    resolve(...args: any[]): MiddlewareFunction;
}

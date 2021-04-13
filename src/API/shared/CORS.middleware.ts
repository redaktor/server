import { Injectable, NestMiddleware, MiddlewareFunction } from '@nestjs/common';

@Injectable()
export default class CorsMiddleware implements NestMiddleware {
  // Add headers and Remove trailing slash
  resolve(...args: any[]): MiddlewareFunction {
    return (req, res, next: any) => {
      console.log(req.method, req.originalUrl)
      // No trailing slash
      const test = /\?[^]*\//.test(req.url);
      if (req.url.substr(-1) === '/' && req.url.length > 1 && !test) {
        res.redirect(301, req.url.slice(0, -1));
      }

      // Website you wish to allow to connect
      res.setHeader('Access-Control-Allow-Origin', 'http://localhost');
      // Request methods you wish to allow
      res.setHeader('Access-Control-Allow-Methods', 'OPTIONS, GET, POST, PUT, PATCH, DELETE');
      // Request headers you wish to allow
      res.setHeader('Access-Control-Allow-Headers', 'Origin, X-Requested-With, Content-Type, Accept');
      // If you need the website to include cookies in the requests sent (e.g. for sessions)
      //res.setHeader('Access-Control-Allow-Credentials', true);

      // Pass to next layer of middleware
      next();

    };
  }
}

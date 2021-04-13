import { NestFactory } from '@nestjs/core';
import { NestExpressApplication } from '@nestjs/platform-express';
import { resolve } from 'path';
import * as cookieParser from 'cookie-parser';
import * as bodyParser from 'body-parser';
import * as helmet from 'helmet';
import * as csurf from 'csurf';
import { getPort/*, getFriendsPort, PORTS*/ } from './API/shared/port.util';
//import { BASE_URL } from './config';
import { AppModule } from './app.module';

async function bootstrap() {
  // Unhandled Promise Rejections get logged in console
  // TODO logfile
  process.on('unhandledRejection', (reason: Error, promise) => {
    console.warn('A promise was rejected but did not have a .catch() handler:');
    console.warn(reason && reason.stack || reason || promise);
    throw reason;
  });
  // TODO require('events').EventEmitter.defaultMaxListeners = 128;

  const app = await NestFactory.create<NestExpressApplication>(AppModule);

  app.setBaseViewsDir(resolve(__dirname, '../../src/client/output/dist/'))
  .useStaticAssets(resolve(__dirname, '../../src/client/output/dist/'), {
    index: ['index.htm', 'index.html']
  })
  .use(cookieParser())
  //.use(csurf({ cookie: true })) /* TODO CSRF and TS */
  .use(helmet())
  .enableCors()
  // Plain JSON and ActivityPub JSON bodies
  .use(bodyParser.json({ type: 'application/json', limit: '50mb' }))
  //.use(bodyParser.json({ type: 'application/activity+json', limit: '50mb' }))
  .setViewEngine('ejs');

  /* TODO CSRF and TS */
  app.use(function (err: any, req: Request, res: any, next: any) {
    if (err.code !== 'EBADCSRFTOKEN') return next(err)
    // handle CSRF token errors here
    res.status(403)
    res.send('Form tampered with – CSRF ERROR')
  });

  const PORT = await getPort();
  await app.listen(PORT);
}
bootstrap();

"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const core_1 = require("@nestjs/core");
const path_1 = require("path");
const cookieParser = require("cookie-parser");
const bodyParser = require("body-parser");
const helmet = require("helmet");
const port_util_1 = require("./API/shared/port.util");
const app_module_1 = require("./app.module");
async function bootstrap() {
    process.on('unhandledRejection', (reason, promise) => {
        console.warn('A promise was rejected but did not have a .catch() handler:');
        console.warn(reason && reason.stack || reason || promise);
        throw reason;
    });
    const app = await core_1.NestFactory.create(app_module_1.AppModule);
    app.setBaseViewsDir(path_1.resolve(__dirname, '../../src/client/output/dist/'))
        .useStaticAssets(path_1.resolve(__dirname, '../../src/client/output/dist/'), {
        index: ['index.htm', 'index.html']
    })
        .use(cookieParser())
        .use(helmet())
        .enableCors()
        .use(bodyParser.json({ type: 'application/json', limit: '50mb' }))
        .setViewEngine('ejs');
    app.use(function (err, req, res, next) {
        if (err.code !== 'EBADCSRFTOKEN')
            return next(err);
        res.status(403);
        res.send('Form tampered with – CSRF ERROR');
    });
    const PORT = await port_util_1.getPort();
    await app.listen(PORT);
}
bootstrap();
//# sourceMappingURL=index.js.map
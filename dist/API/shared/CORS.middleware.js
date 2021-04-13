"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const tslib_1 = require("tslib");
const common_1 = require("@nestjs/common");
let CorsMiddleware = class CorsMiddleware {
    resolve(...args) {
        return (req, res, next) => {
            console.log(req.method, req.originalUrl);
            const test = /\?[^]*\//.test(req.url);
            if (req.url.substr(-1) === '/' && req.url.length > 1 && !test) {
                res.redirect(301, req.url.slice(0, -1));
            }
            res.setHeader('Access-Control-Allow-Origin', 'http://localhost');
            res.setHeader('Access-Control-Allow-Methods', 'OPTIONS, GET, POST, PUT, PATCH, DELETE');
            res.setHeader('Access-Control-Allow-Headers', 'Origin, X-Requested-With, Content-Type, Accept');
            next();
        };
    }
};
CorsMiddleware = tslib_1.__decorate([
    common_1.Injectable()
], CorsMiddleware);
exports.default = CorsMiddleware;
//# sourceMappingURL=CORS.middleware.js.map
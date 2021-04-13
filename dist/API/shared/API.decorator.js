"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const common_1 = require("@nestjs/common");
const swagger_1 = require("@nestjs/swagger");
const shared_1 = require("../../../framework/validator/shared");
const validation_pipe_1 = require("./validation.pipe");
function API(_options = {}, ...otherOptions) {
    let options = typeof _options === 'string' ? { description: _options } : _options;
    options = otherOptions.reduce((o, other) => (Object.assign(Object.assign({}, o), other)), options);
    const responses = new Set();
    const response = (o) => {
        responses.add(o.status);
        responses.add(`${o.status}`[0]);
        if (o.description && typeof o.description !== 'string' && o.description in common_1.HttpStatus) {
            o.description = common_1.HttpStatus[o.description].replace(/_/g, ' ');
        }
        return swagger_1.ApiResponse(o);
    };
    return function APIDeco(target, key, descriptor) {
        let strKey = (typeof key === 'symbol' ? key.toString() : (key || ''));
        let { title, description, operationId, deprecated } = options;
        if (title || description || operationId || typeof deprecated === 'boolean') {
            if (!descriptor && !!target.constructor) {
                if (!shared_1.getMeta(target.constructor)) {
                    shared_1.setMeta({ title, description, operationId, deprecated }, target.constructor);
                }
            }
            else {
                title = title || strKey;
                swagger_1.ApiOperation({ title, description, operationId, deprecated });
            }
        }
        const optionsFn = {
            response: swagger_1.ApiResponse, produces: swagger_1.ApiProduces, consumes: swagger_1.ApiConsumes, tags: swagger_1.ApiUseTags
        };
        let k;
        for (k in options) {
            const v = options[k];
            const intK = parseInt(k, 10);
            if (!isNaN(intK) && intK in common_1.HttpStatus) {
                response({ status: intK, description: options[k] });
            }
            else if (k === 'response' && !!options.response) {
                Array.isArray(v) ? (v.map((r) => response(r))) : response(v);
            }
            else if (typeof optionsFn[k] === 'function') {
                Array.isArray(v) ? optionsFn[k](...v) : optionsFn[k](v);
            }
        }
        let has403 = !!(Reflect.getMetadata('swagger/apiBearer', target) ||
            Reflect.getMetadata('swagger/apiOauth2', target) ||
            (!!key && Reflect.getMetadata('swagger/apiBearer', target, strKey)) ||
            (!!key && Reflect.getMetadata('swagger/apiOauth2', target, strKey))) || false;
        if (!responses.has(2) && !responses.has(3)) {
            response({ status: 200, description: 'OK' });
        }
        if (has403 && !responses.has(403)) {
            response({ status: 403, description: 'Forbidden' });
        }
        if (!!descriptor) {
            return common_1.UsePipes(new validation_pipe_1.ValidationPipe())(target, key, descriptor);
        }
    };
}
exports.default = API;
//# sourceMappingURL=API.decorator.js.map
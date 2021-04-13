"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const tslib_1 = require("tslib");
const common_1 = require("@nestjs/common");
const constants_1 = require("../../../framework/validator/constants");
const V = require("../../../framework/validator");
exports.FAILED = 'Input data validation failed.';
let ValidationPipe = class ValidationPipe {
    async transform(value, metadata) {
        console.log('!!!', metadata, value);
        const { metatype, type, data } = metadata;
        if (!value && data === constants_1.USER_KEY) {
            console.log('AUTH ... ...');
            throw new common_1.ForbiddenException('Please Log In ...');
        }
        if (!metatype || !this.toValidate(type, metatype)) {
            return value;
        }
        if (!value) {
            throw new common_1.BadRequestException(`No data submitted for root parameter ${data}`);
        }
        const { errors } = V.validateMeta(metatype, value);
        if (errors.length > 0) {
            throw new common_1.BadRequestException({ errors }, 'Input data validation failed');
        }
        return value;
    }
    toValidate(type, metatype) {
        if (!metatype || type === 'custom') {
            return false;
        }
        const types = [String, Boolean, Number, Array, Object];
        return !!types.find((type) => metatype === type);
    }
};
ValidationPipe = tslib_1.__decorate([
    common_1.Injectable()
], ValidationPipe);
exports.ValidationPipe = ValidationPipe;
function Validate() {
    return V.Validator((errors) => {
        throw new common_1.BadRequestException({ errors }, exports.FAILED);
    });
}
exports.Validate = Validate;
//# sourceMappingURL=validation.pipe.js.map
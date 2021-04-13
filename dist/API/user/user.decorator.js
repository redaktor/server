"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const tslib_1 = require("tslib");
const common_1 = require("@nestjs/common");
const operators_1 = require("rxjs/operators");
let ExcludeNullInterceptor = class ExcludeNullInterceptor {
    intercept(context, next) {
        return next
            .handle()
            .pipe(operators_1.map((v) => {
            v = v === null ? '' : v;
            if (typeof v === 'object') {
                if (v.hasOwnProperty('user') && v.user.hasOwnProperty('password')) {
                    v.user.password = '[...]';
                }
                else if (v.hasOwnProperty('password')) {
                    v.password = '[...]';
                }
            }
            return v;
        }));
    }
};
ExcludeNullInterceptor = tslib_1.__decorate([
    common_1.Injectable()
], ExcludeNullInterceptor);
exports.ExcludeNullInterceptor = ExcludeNullInterceptor;
//# sourceMappingURL=user.decorator.js.map
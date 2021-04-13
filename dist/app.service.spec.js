"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const testing_1 = require("@nestjs/testing");
const app_controller_1 = require("./app.controller");
const app_service_1 = require("./app.service");
const users_module_1 = require("./API/users/users.module");
const auth_module_1 = require("./API/auth/auth.module");
describe('AppService', () => {
    let appService;
    beforeEach(async () => {
        const app = await testing_1.Test.createTestingModule({
            imports: [auth_module_1.AuthModule, users_module_1.UsersModule],
            controllers: [app_controller_1.AppController],
            providers: [app_service_1.AppService],
        }).compile();
        appService = app.get(app_service_1.AppService);
    });
    describe('app service', () => {
        it('should return "Hello World!"', () => {
            expect(appService.getHello()).toBe('Hello World!');
        });
    });
});
//# sourceMappingURL=app.service.spec.js.map
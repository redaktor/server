"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const testing_1 = require("@nestjs/testing");
const app_controller_1 = require("./app.controller");
const app_service_1 = require("./app.service");
const auth_module_1 = require("./API/auth/auth.module");
const users_module_1 = require("./API/users/users.module");
describe('AppController', () => {
    let appController;
    beforeEach(async () => {
        const app = await testing_1.Test.createTestingModule({
            imports: [auth_module_1.AuthModule, users_module_1.UsersModule],
            controllers: [app_controller_1.AppController],
            providers: [app_service_1.AppService],
        }).compile();
        appController = app.get(app_controller_1.AppController);
    });
    it('should be defined', () => {
        expect(appController).toBeDefined();
    });
});
//# sourceMappingURL=app.controller.spec.js.map
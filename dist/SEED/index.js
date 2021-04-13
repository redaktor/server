"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const typeorm_1 = require("typeorm");
async function redaktorSeed() {
    const permissions = typeorm_1.getRepository('permission');
    const permissionsData = await permissions.find();
    const roles = typeorm_1.getRepository('permission');
    const rolesData = await roles.find();
    console.log('repo', permissions);
    if (!permissionsData.length) {
        console.log('no permissionsData', permissionsData);
    }
    if (!rolesData.length) {
        console.log('no rolesData', rolesData);
    }
}
exports.default = redaktorSeed;
//# sourceMappingURL=index.js.map
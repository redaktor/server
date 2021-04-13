"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const main_1 = require("@dojo/framework/has/main");
const bundlePath = ((main_1.default('host-node') ? __dirname : 'src/Auth/nls') + '/common');
const locales = ['de'];
const messages = {
    eSession: 'Error: Could not find a properly configured session middleware',
    eSessionSec: 'Error: Could not find a properly configured session token secret',
    eRequest: 'Error: Could not receive a "request token"',
    eAccess: 'Error: Could not exchange the given credential for an "access token"'
};
exports.default = { bundlePath, locales, messages };
//# sourceMappingURL=common.js.map
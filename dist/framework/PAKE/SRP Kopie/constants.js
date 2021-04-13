"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const rfc5054groups_1 = require("./rfc5054groups");
var ACTIONS;
(function (ACTIONS) {
    ACTIONS[ACTIONS["R_REGISTER"] = 0] = "R_REGISTER";
    ACTIONS[ACTIONS["R_SRP_AUTH"] = 1] = "R_SRP_AUTH";
    ACTIONS[ACTIONS["R_SRP_EVIDENCE"] = 2] = "R_SRP_EVIDENCE";
    ACTIONS[ACTIONS["R_SRP_VERIFY"] = 3] = "R_SRP_VERIFY";
    ACTIONS[ACTIONS["R_ID_TOKEN"] = 4] = "R_ID_TOKEN";
})(ACTIONS = exports.ACTIONS || (exports.ACTIONS = {}));
exports.SRP = rfc5054groups_1.SRP;
exports.HASH = { SHA256: 'sha256', SHA384: 'sha384', SHA512: 'sha512' };
//# sourceMappingURL=constants.js.map
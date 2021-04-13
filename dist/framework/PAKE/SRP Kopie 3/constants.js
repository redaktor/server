"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const rfc5054groups_1 = require("./rfc5054groups");
var ACTION;
(function (ACTION) {
    ACTION[ACTION["R_REGISTER"] = 0] = "R_REGISTER";
    ACTION[ACTION["R_SRP_AUTH"] = 1] = "R_SRP_AUTH";
    ACTION[ACTION["R_SRP_EVIDENCE"] = 2] = "R_SRP_EVIDENCE";
    ACTION[ACTION["R_SRP_VERIFY"] = 3] = "R_SRP_VERIFY";
    ACTION[ACTION["R_ID_TOKEN"] = 4] = "R_ID_TOKEN";
    ACTION[ACTION["R_LOGGED_IN"] = 5] = "R_LOGGED_IN";
})(ACTION = exports.ACTION || (exports.ACTION = {}));
exports.SRP = rfc5054groups_1.SRP;
exports.HASH = { SHA256: 'sha256', SHA384: 'sha384', SHA512: 'sha512' };
//# sourceMappingURL=constants.js.map
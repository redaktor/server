"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const webtoken_1 = require("../JSON/webtoken");
var jToken = webtoken_1.default.encode({ hello: 'world' }, 'secret', 'sha256');
var result = webtoken_1.default.decode(jToken, 'secret');
console.log('jToken', jToken);
console.log('result', result);
//# sourceMappingURL=testJwt.js.map
"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const Base_1 = require("./Base");
const _1 = require("./");
class Client extends _1.Server {
    constructor() {
        super(...arguments);
        this.x = null;
    }
    register(identity, P, publicRsaKey) {
        const action = Base_1.Base.ACTION.R_REGISTER;
        const I = this.encryptRSA(identity, publicRsaKey);
        this.put({ s: _1.Server.randomByteHex(), state: action });
        const { s, group } = this;
        return { I, group, action, s: s.toString(), v: this.makeV(identity, P) };
    }
}
exports.Client = Client;
//# sourceMappingURL=Client.js.map
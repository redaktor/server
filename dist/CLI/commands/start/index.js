"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const Command_1 = require("../../Command");
class Start extends Command_1.default {
    constructor() { super(); }
    async run(system) {
        const hi = `Hi ${system.userName}.`;
        if (!system.status.setup) {
        }
        else {
            this.success `${hi}`;
        }
    }
}
exports.default = Start;
//# sourceMappingURL=index.js.map
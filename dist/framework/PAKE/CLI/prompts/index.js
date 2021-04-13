"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const _inquirer = require("inquirer");
const list_1 = require("./list");
_inquirer.registerPrompt('list', list_1.ListPrompt);
function inquirerNLS(bundle) {
    Object.defineProperty(_inquirer, 'bundle', {
        enumerable: false,
        configurable: false,
        writable: false,
        value: bundle
    });
    return _inquirer;
}
exports.inquirerNLS = inquirerNLS;
exports.inquirer = _inquirer;
//# sourceMappingURL=index.js.map
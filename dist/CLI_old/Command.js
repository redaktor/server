"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const tslib_1 = require("tslib");
const inquirer = require("inquirer");
const main_1 = require("@dojo/framework/i18n/main");
const System_1 = require("./shared/System");
const log_1 = require("../framework/String/tag/log");
tslib_1.__exportStar(require("../framework/String/tag/log"), exports);
class Command {
    constructor() {
        this.prompt = inquirer.prompt;
        this.messages = {};
        this.quitting = false;
        this.passwordField = { type: 'password', mask: System_1.BULLET };
        this.log = (s, ...values) => this.logFn(log_1.log, s, ...values);
        this.message = (s, ...values) => this.logFn(log_1.message, s, ...values);
        this.success = (s, ...values) => this.logFn(log_1.success, s, ...values);
        this.warning = (s, ...values) => this.logFn(log_1.warning, s, ...values);
        this.error = (s, ...values) => this.logFn(log_1.error, s, ...values);
        this.list = (s, ...values) => this.logFn(log_1.list, s, ...values);
        this.input = (s, ...values) => this.logFn(log_1.input, s, ...values);
        this.output = (s, ...values) => this.logFn(log_1.output, s, ...values);
        this.neutral = (s, ...values) => this.logFn(log_1.neutral, s, ...values);
        this.muted = (s, ...values) => this.logFn(log_1.muted, s, ...values);
        this.info = log_1.info;
        System_1.onlyNODE();
    }
    exit() {
        process.exit();
        return true;
    }
    async i18n(bundle) {
        this.messages = await main_1.default(bundle, main_1.default.locale);
        this.reset();
        return this.messages;
    }
    msg(_id = 'unknown', el, fallback = '') {
        var m = (!!(this.messages) && this.messages[_id]);
        if (!m) {
            m = _id;
        }
        if (!!el && typeof el === 'object') {
            const rawData = !!(el.dataset) ? el.dataset : el;
            (m.match(/[_]\{([^}]+)\}/gi) || []).map((tplStr) => {
                const pointer = tplStr.slice(2, -1);
                var data = rawData[pointer];
                if (typeof data !== 'string' && tplStr.slice(2, 3) === '/') {
                    data = m;
                }
                m = m.replace(tplStr, (typeof data === 'string') ? data : fallback);
            });
        }
        return m;
    }
    choices(...ids) {
        return ids.map((key) => ({ name: this.msg(key), value: key }));
    }
    reset() { log_1.reset ` `; }
    logFn(fn, strings, ...values) {
        if (typeof strings === 'string') {
            return fn `${this.msg(strings)} ${values.map((v) => this.msg(v)).join(' ')}`;
        }
        return fn(strings, ...values);
    }
}
exports.default = Command;
//# sourceMappingURL=Command.js.map
"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const tslib_1 = require("tslib");
const fs = require("fs");
const os = require("os");
const path = require("path");
const inquirer = require("inquirer");
const main_1 = require("@dojo/framework/i18n/main");
const log_1 = require("../../String/tag/log");
const uuid_1 = require("../../uuid");
const SRP_1 = require("../../PAKE/SRP");
tslib_1.__exportStar(require("../../String/tag/log"), exports);
class Command {
    constructor() {
        this.configName = '';
        this.prompt = inquirer.prompt;
        this.messages = {};
        this.quitting = false;
        this.passwordField = { type: 'password', mask: Command.BULLET };
        this.server = new SRP_1.Server();
        this.rLog = (s, ...values) => this.logFn(log_1.log, s, ...values);
        this.message = (s, ...values) => this.logFn(log_1.message, s, ...values);
        this.success = (s, ...values) => this.logFn(log_1.success, s, ...values);
        this.warning = (s, ...values) => this.logFn(log_1.warning, s, ...values);
        this.warningError = (s, ...values) => this.logFn(log_1.error, s, ...values);
        this.list = (s, ...values) => this.logFn(log_1.list, s, ...values);
        this.input = (s, ...values) => this.logFn(log_1.input, s, ...values);
        this.output = (s, ...values) => this.logFn(log_1.output, s, ...values);
        this.neutral = (s, ...values) => this.logFn(log_1.neutral, s, ...values);
        this.muted = (s, ...values) => this.logFn(log_1.muted, s, ...values);
        this.info = log_1.info;
        const stats = fs.statSync(__filename);
        const id = uuid_1.default(`${stats.ino}@${stats.dev}`);
        this.settings = {
            id,
            userName: os.userInfo().username
        };
        this.configName = path.join(os.homedir(), `/.settings_${this.settings.id}`);
    }
    async run() { return Promise.resolve(); }
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
    async read(pw, filePath = this.configName, parseJSON = true) {
        return new Promise((resolve) => {
            try {
                let res = fs.readFileSync(filePath, 'utf8');
                if (!!parseJSON) {
                    res = JSON.parse(pw ? this.server.decrypt(res, pw) : res);
                }
                resolve(res);
            }
            catch (e) {
                if (filePath === this.configName) {
                }
                resolve({});
            }
        });
    }
    async write(o, pw, filePath = this.configName, updatedAt = null) {
        const cDate = new Date();
        const uDate = updatedAt || '';
        return new Promise((resolve, reject) => {
            try {
                let res = JSON.stringify(Object.assign({ statusCode: 200, iat: cDate, uat: uDate }, o));
                if (!!pw) {
                    res = this.server.encrypt(res, pw);
                }
                fs.writeFile(filePath, res, 'utf8', (e) => {
                    !e ? resolve(res) : reject(e);
                });
            }
            catch (e) {
                reject(e);
            }
        });
    }
    hasConfig() {
        return fs.existsSync(this.configName);
    }
    async readConfig(pw) {
        return await this.read(pw);
    }
    async mixinConfig(o, pw) {
        const token = await this.read(pw);
        const newToken = Object.assign(Object.assign({}, token), o);
        return this.write(newToken, pw);
    }
}
exports.Command = Command;
Command.BULLET = (os.platform() === 'win32') ? '*' : '●';
//# sourceMappingURL=Command.js.map
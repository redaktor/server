"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const tslib_1 = require("tslib");
const command_1 = require("@oclif/command");
const fs = require("fs");
const os = require("os");
const path = require("path");
const inquirer = require("inquirer");
const main_1 = require("@dojo/framework/i18n/main");
const constants_1 = require("./shared/constants");
const log_1 = require("../framework/String/tag/log");
const uuid_1 = require("../framework/uuid");
const webtoken_1 = require("../framework/JSON/webtoken");
tslib_1.__exportStar(require("../framework/String/tag/log"), exports);
exports.flags = command_1.flags;
class Command extends command_1.Command {
    constructor(argv, config) {
        super(argv, config);
        this.argv = argv;
        this.config = config;
        this.configName = '';
        this.prompt = inquirer.prompt;
        this.messages = {};
        this.quitting = false;
        this.passwordField = { type: 'password', mask: constants_1.BULLET };
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
        const { home, root, arch, platform, windows, debug, name, version, pjson } = this.config;
        this.redaktor = {
            id,
            version,
            userName: os.userInfo().username,
            brand: name || '',
            debug: !!debug,
            configDir: path.dirname(this.config.configDir) || './',
            home, root, arch, platform, windows, pjson
        };
        this.configName = path.resolve(this.redaktor.configDir, `redaktor_${this.redaktor.id}.jwt`);
        console.log(this.configName);
    }
    run() { return Promise.resolve(); }
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
    async read(pw, fileName = this.configName) {
        return new Promise((resolve) => {
            try {
                let res = fs.readFileSync(fileName, 'utf8');
                res = pw ? (webtoken_1.default.decode(res, pw) || {}) : JSON.parse(res);
                resolve(res);
            }
            catch (e) {
                if (fileName === this.configName) {
                }
                resolve({});
            }
        });
    }
    async write(o, pw, fileName = this.configName, updatedAt = null) {
        const cDate = new Date();
        const uDate = updatedAt || '';
        return new Promise((resolve, reject) => {
            try {
                let res = Object.assign({ statusCode: 200, iat: cDate, uat: uDate }, o);
                res = pw ? webtoken_1.default.encode(res, pw, 'sha256') : JSON.stringify(res);
                fs.writeFileSync(fileName, res, 'utf8');
                resolve(res);
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
//# sourceMappingURL=Command.js.map
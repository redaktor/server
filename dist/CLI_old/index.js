"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const tslib_1 = require("tslib");
const fs = require("fs");
const inquirer = require("inquirer");
const typeorm_1 = require("typeorm");
const uuid_1 = require("../framework/uuid");
const password_1 = require("../framework/crypto/password");
const CLI_1 = require("../CLI");
const CLI_2 = require("../nls/CLI");
const Command_1 = require("./Command");
const System_1 = require("./shared/System");
const db_install_1 = require("./shared/db.install");
tslib_1.__exportStar(require("../framework/String/tag/log"), exports);
class CLI extends Command_1.default {
    constructor() {
        super();
        this.system = System_1.default.kickstart();
        this.startCLI();
    }
    async startCLI() {
        await this.i18n(CLI_2.default);
        const hi = `Hi ${this.system.userName}.`;
        this.error('warn');
        if (!this.system.status.setup) {
            this.info(CLI_1._ `G${hi} ${this.msg('welcome')} ${this.msg('name')}\n`[0]);
            await this.setup();
            this.startCLI();
        }
        else {
            this.success `${hi}`;
            if (!!(process.env.PW) && this.checkPW(process.env.PW || '')) {
                this.startServer(process.env.PW);
            }
            else {
                this.startServer();
            }
        }
    }
    async startServer(PW) {
        if (!PW) {
            PW = await this.askPW();
        }
        console.log('START SERVER w.', PW);
    }
    async setup(saltMin = 100, saltMax = 260) {
        const { userName } = this.system;
        this.success('installed', ':');
        CLI_1.log `${this.msg('credDir')}\n`;
        let pw = await this.setPassword();
        this.system.write({ secret: uuid_1.nonce(64, 128), salt: uuid_1.nonce(saltMin, saltMax), kid: uuid_1.default() }, pw);
        if (!this.checkPW(pw)) {
            this.error('writeErr');
            CLI_1.log `${this.msg('writeHint', { userName })}`;
            return this.setPassword();
        }
        const db = await this.setDB();
        const token = this.system.read(pw);
        this.system.write(Object.assign(Object.assign({}, token), { db }), pw);
        const finalToken = this.system.read(pw);
        console.log(finalToken);
        pw = '';
        this.quitting = true;
        this.output('thanks', '_and', 'comeback');
        this.reset();
        return this.exit();
    }
    async setPassword() {
        const pwMin = 4;
        const MIN = Math.max(2, Math.min(5, pwMin));
        const ERR = Math.max(2, Math.min(5, Math.round(pwMin / 2)));
        CLI_1.log `${this.msg('pwFlow1')}\n  ${this.msg('pwFlow2')}\n`;
        const { pwType } = await this.prompt([{
                type: 'list', name: 'pwType', message: this.msg('pwType'),
                choices: [
                    { name: this.msg('pwMask'), value: this.passwordField },
                    { name: this.msg('pwShow'), value: { type: 'input' } }
                ]
            }]);
        this.passwordField = pwType;
        CLI_1.log `\n> G${this.msg('pwFlow3')}`;
        this.warning('pwRule', '\n ', 'pwHint', '\n ', 'pwScore', `${pwMin}\n`);
        let pwBar = '';
        let { pw } = await this.prompt([Object.assign(Object.assign({}, this.passwordField), { name: 'pw', message: this.msg('qPw'), filter: password_1.strength, validate: (strength) => {
                    let { warning, suggestions, score, bar, message } = strength;
                    bar = bar.map((s, i) => !i ? CLI_1._ `G${s}` : CLI_1._ `R${s}`).join('');
                    if (score >= MIN) {
                        pwBar = `${bar} ${message}`;
                        return true;
                    }
                    const errMsg = this.msg(score < ERR ? 'pwErr1' : 'pwErr2');
                    warning = `${errMsg}${warning.length ? `\n${warning}` : ''}`;
                    suggestions = [this.messages.pwRule, this.messages.pwHint].concat(suggestions);
                    message += !suggestions.length ? `\n${warning}` :
                        `:\n${warning}\n${System_1.BULLET} ${suggestions.join(`\n${System_1.BULLET} `)}`;
                    return `${bar} ${score === 3 ? CLI_1._ `Y${message}` : CLI_1._ `R${message}`}`;
                }, transformer: (s) => (typeof s === 'string' ? s : '') })]);
        pw = pw.zxcvbn.password;
        await this.prompt([Object.assign(Object.assign({}, this.passwordField), { name: 'pwConfirmed', message: `${pwBar}\n${this.msg('pwConfirm')}`, filter: password_1.strength, validate: (strength) => {
                    return (strength.zxcvbn.password !== pw ? this.msg('pwCErr') : true);
                }, transformer: (s) => (typeof s === 'string' ? s : '') })]);
        if (!!this.quitting) {
            throw new Error('quitting');
        }
        return pw;
    }
    async setDB(preferences) {
        const dbPrompts = db_install_1.default(this.system.userName, preferences).map((o) => {
            if (typeof o.message === 'string') {
                o.message = this.msg(o.message);
            }
            return o;
        });
        !preferences && CLI_1.log `> G${this.msg('dbFlow1')}\n\n  ${this.msg('dbFlow2')}`;
        this.warning('dbFlow3', '\n');
        let { type } = await this.prompt([{
                type: 'list', name: 'type', message: this.msg('dbType'),
                choices: Object.keys(dbPrompts).map((k) => ({ name: k }))
            }]);
        const settings = await this.prompt(dbPrompts[type]);
        return this.checkDB(Object.assign({ type }, settings));
    }
    async setExtendedDB(preferences) {
        console.log(preferences || 'extend DB');
    }
    async checkDB(db, basicSettings = true) {
        try {
            await typeorm_1.createConnection(db);
            return db;
        }
        catch (e) {
            this.error `${this.msg(basicSettings ? 'dbErr1' : 'dbErr2')}`;
            this.warning `[details] ${typeof e === 'object' && e.message ? e.message : e}\n`;
            let { toDo } = await this.prompt([{
                    type: 'list', name: 'toDo', message: this.msg('whatToDo'),
                    choices: this.choices('again', 'dbExtra')
                }]);
            return toDo === 'again' ? this.setDB(db) : this.setExtendedDB();
        }
    }
    async checkSpecialServer() {
        return new Promise((resolve) => {
            fs.readFile('~/.my.cnf', 'utf8', (err, data) => {
                if (err) {
                    resolve(false);
                }
                if (/uberspace\.de\/dokuwiki/g.test(data)) {
                    resolve('U6');
                }
                else if (/manual\.uberspace\.de/g.test(data)) {
                    resolve('U7');
                }
            });
        });
    }
    async askPW() {
        const o = await inquirer.prompt(Object.assign(Object.assign({}, this.passwordField), { name: 'PW', message: this.msg('qPw'), validate: async (pw) => {
                const o = await this.checkPW(pw);
                return !o ? this.msg('vWrongPw') : true;
            } }));
        return o.PW;
    }
    async checkPW(pw) {
        if (!pw || typeof pw !== 'string') {
            return Promise.reject(false);
        }
        const config = await this.system.read(pw);
        return new Promise((resolve, reject) => {
            if (typeof config !== 'object' || !(config.salt) || config.statusCode !== 200) {
                reject(false);
            }
            resolve(true);
        });
    }
    async listCommands() {
    }
    async runCommands() {
    }
}
exports.default = CLI;
new CLI();
//# sourceMappingURL=index.js.map
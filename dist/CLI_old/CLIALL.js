"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const fs = require("fs");
const path = require("path");
const typeorm_1 = require("typeorm");
const uuid_1 = require("../../framework/uuid");
const password_1 = require("../../framework/crypto/password");
const CLI_1 = require("../CLI");
const db_install_1 = require("../shared/db.install");
const CLI_2 = require("../nls/CLI");
class CLI extends CLI_1.default {
    constructor() {
        super();
        this.startCLI();
    }
    async startCLI() {
        console.log(this.checkSpecialServer());
        await this.i18n(CLI_2.default);
        const hi = `Hi ${this.userName}.`;
        if (!fs.existsSync(path.join(this.directory, '/server.jwt'))) {
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
        this.success('installed', ':');
        CLI_1.log `${this.msg('credDir')}\n  ${this.directory}\n`;
        if (!fs.existsSync(this.directory)) {
            fs.mkdirSync(this.directory);
        }
        let pw = await this.setPassword();
        this.write({ secret: uuid_1.nonce(64, 128), salt: uuid_1.nonce(saltMin, saltMax), kid: uuid_1.default() }, pw);
        if (!this.checkPW(pw)) {
            this.error('writeErr');
            CLI_1.log `${this.msg('writeHint', { directory: this.directory, user: this.userName })}`;
            return this.setPassword();
        }
        if (!pw) {
            this.directory = '';
        }
        const db = await this.setDB();
        const token = this.read(pw);
        this.write(Object.assign(Object.assign({}, token), { db }), pw);
        const finalToken = this.read(pw);
        console.log(finalToken);
        pw = '';
        this.quitting = true;
        this.output('thanks', '_and', 'comeback');
        this.reset();
        return this.exit();
    }
    async setPassword() {
        const pwMin = this.config.passwordMinStrength;
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
        this.warning('pwRule', '\n ', 'pwHint', '\n ', 'pwScore', '\n');
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
                        `:\n${warning}\n${this.bullet} ${suggestions.join(`\n${this.bullet} `)}`;
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
        const dbPrompts = db_install_1.default(this.userName, preferences).map((o) => {
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
}
exports.CLI = CLI;
new CLI();
//# sourceMappingURL=CLIALL.js.map
"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const inquirer = require("inquirer");
const typeorm_1 = require("typeorm");
const Command_1 = require("../Command");
const constants_1 = require("../shared/constants");
const db_install_1 = require("../shared/db.install");
const CLI_1 = require("../../nls/CLI");
const uuid_1 = require("../../framework/uuid");
const password_1 = require("../../framework/crypto/password");
const log_1 = require("../../framework/String/tag/log");
class Setup extends Command_1.Command {
    constructor() {
        super(...arguments);
        this.pwConfirmedCount = 0;
    }
    async run() {
        const { args, flags } = this.parse(Setup);
        await this.i18n(CLI_1.default);
        const hi = `Hi ${this.redaktor.userName}.`;
        try {
            if (!this.hasConfig()) {
                throw ('No credential file yet.');
            }
            this.success `${hi}`;
        }
        catch (e) {
            this.info(log_1._ `G${hi} ${this.msg('welcome')} ${this.msg('name')}\n`[0]);
            await this.setup();
        }
    }
    async setup(saltMin = 100, saltMax = 260) {
        const { userName } = this.redaktor;
        this.success('installed', ':');
        log_1.log `${this.msg('credDir')}\n`;
        const { pwType } = await this.prompt([{
                type: 'list', name: 'pwType', message: this.msg('pwType'),
                choices: [
                    { name: this.msg('pwMask'), value: this.passwordField },
                    { name: this.msg('pwShow'), value: { type: 'input' } }
                ]
            }]);
        this.passwordField = pwType;
        let pw = await this.setPassword();
        this.write({ secret: uuid_1.nonce(64, 128), salt: uuid_1.nonce(saltMin, saltMax), kid: uuid_1.default() }, pw);
        if (!this.checkPW(pw)) {
            this.warningError('writeErr');
            log_1.log `${this.msg('writeHint', { userName })}`;
            return this.setPassword();
        }
        const db = await this.setDB();
        let token = await this.read(pw);
        await this.write(Object.assign(Object.assign({}, token), { db }), pw);
        pw = '';
        this.quitting = true;
        this.output('thanks', '_and', 'comeback');
        this.reset();
        return this.exit();
    }
    async setPassword() {
        this.pwConfirmedCount = 0;
        const pwMin = 4;
        const MIN = Math.max(2, Math.min(5, pwMin));
        const ERR = Math.max(2, Math.min(5, Math.round(pwMin / 2)));
        log_1.log `\n\n${this.msg('pwFlow1')}`;
        this.success(this.msg('pwFlow2'));
        this.warning('pwRule', '\n ', 'pwHint', '\n ', 'pwScore', `${pwMin}\n`);
        let pwBar = '';
        let { pw } = await this.prompt([Object.assign(Object.assign({}, this.passwordField), { name: 'pw', message: this.msg('qPw'), filter: password_1.strength, validate: (strength) => {
                    let { warning, suggestions, score, bar, message } = strength;
                    bar = bar.map((s, i) => !i ? log_1._ `G${s}` : log_1._ `R${s}`).join('');
                    if (score >= MIN) {
                        pwBar = `${bar} ${message}`;
                        return true;
                    }
                    const errMsg = this.msg(score < ERR ? 'pwErr1' : 'pwErr2');
                    warning = `${errMsg}${warning.length ? `\n${warning}` : ''}`;
                    suggestions = [this.messages.pwRule, this.messages.pwHint].concat(suggestions);
                    message += !suggestions.length ? `\n${warning}` :
                        `:\n${warning}\n${constants_1.BULLET} ${suggestions.join(`\n${constants_1.BULLET} `)}`;
                    return `${bar} ${score === 3 ? log_1._ `Y${message}` : log_1._ `R${message}`}`;
                }, transformer: (s) => (typeof s === 'string' ? s : '') })]);
        pw = pw.zxcvbn.password;
        let { pwConfirmed } = await this.prompt([Object.assign(Object.assign({}, this.passwordField), { name: 'pwConfirmed', message: `${pwBar}\n\n${this.msg('pwConfirm')}`, filter: password_1.strength, validate: (strength) => {
                    this.pwConfirmedCount++;
                    return strength.zxcvbn.password === pw || this.pwConfirmedCount === 3 ? true :
                        this.msg('pwCErr');
                }, transformer: (s) => (typeof s === 'string' ? s : '') })]);
        if (pwConfirmed.zxcvbn.password !== pw) {
            this.warning(' --> restart');
            this.log(' ');
            return this.setPassword();
        }
        if (!!this.quitting) {
            throw new Error('quitting');
        }
        return pw;
    }
    async setDB(preferences) {
        const dbPrompts = db_install_1.default(this.redaktor, preferences);
        !preferences && this.success `${this.msg('prima')}!\n\n`;
        !preferences && this.log(this.msg('dbFlow1'));
        this.warning('dbFlow2', '\n');
        let { type } = await this.prompt([{
                type: 'list', name: 'type', message: this.msg('dbType'),
                choices: Object.keys(dbPrompts).map((k) => ({ name: k }))
            }]);
        const settings = await this.prompt(dbPrompts[type].map((o) => {
            if (typeof o.message === 'string') {
                o.message = this.msg(o.message);
            }
            return o;
        }));
        return this.checkDB(Object.assign({ type }, settings));
    }
    async setExtendedDB(preferences) {
        console.log(preferences || 'extend DB');
    }
    async checkDB(db, basicSettings = true) {
        try {
            await typeorm_1.createConnection(db);
            this.success `${this.msg('prima')}!\n`;
            return db;
        }
        catch (e) {
            this.warningError `${this.msg(basicSettings ? 'dbErr1' : 'dbErr2')}`;
            this.warning `[details] ${typeof e === 'object' && e.message ? e.message : e}\n`;
            let { toDo } = await this.prompt([{
                    type: 'list', name: 'toDo', message: this.msg('whatToDo'),
                    choices: this.choices('again', 'dbExtra')
                }]);
            return toDo === 'again' ? this.setDB(db) : this.setExtendedDB();
        }
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
        const config = await this.read(pw);
        return new Promise((resolve, reject) => {
            if (typeof config !== 'object' || !(config.salt) || config.statusCode !== 200) {
                reject(false);
            }
            resolve(true);
        });
    }
}
exports.default = Setup;
Setup.description = 'describe the command here';
Setup.examples = [
    `$ redaktor setup
... TODO
`,
];
Setup.flags = {
    help: Command_1.flags.help({ char: 'h' }),
    name: Command_1.flags.string({ char: 'n', description: 'name to print' }),
    force: Command_1.flags.boolean({ char: 'f' }),
};
Setup.args = [{ name: 'file' }];
//# sourceMappingURL=setup.js.map
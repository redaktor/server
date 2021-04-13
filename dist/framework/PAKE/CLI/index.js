"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const util = require("util");
const path = require("path");
const prompts_1 = require("./prompts");
const Command_1 = require("./Command");
const nls_1 = require("./nls/");
const uuid_1 = require("../../uuid");
const password_1 = require("../../crypto/password");
const log_1 = require("../../String/tag/log");
const SRP_1 = require("../../PAKE/SRP");
const Client_1 = require("../../PAKE/SRP/Client");
class Setup extends Command_1.Command {
    constructor() {
        super(...arguments);
        this.pwConfirmedCount = 0;
    }
    setConfig(config) {
        for (let key in config) {
            process.env[`SRP_${key}`] = config[key];
        }
    }
    async run(appEnv) {
        if (!!appEnv) {
            this.env = appEnv;
        }
        await this.i18n(nls_1.default);
        this.inquirer = prompts_1.inquirerNLS(this.messages);
        this.prompt = this.inquirer.prompt;
        const { userName } = this.settings;
        const hi = `Hi ${userName}.`;
        try {
            if (!this.hasConfig()) {
                throw ('No credential file yet.');
            }
            this.success `${hi}`;
            log_1.log `${this.msg('startServer')}`;
            this.setConfig(await this.askPW());
        }
        catch (e) {
            this.info(log_1._ `G${hi} ${this.msg('welcome')} ${this.msg('name')}\n`[0]);
            this.setConfig(await this.setup());
        }
        return true;
    }
    async getKeys() { return util.promisify(SRP_1.Server.getKeys)(null); }
    ;
    async setup(saltMin = 100, saltMax = 260) {
        const { id, userName } = this.settings;
        this.success('installed', ':');
        const { pwType } = await this.prompt([{
                type: 'list', name: 'pwType', message: this.msg('pwType'),
                choices: [
                    { name: this.msg('pwMask'), value: this.passwordField },
                    { name: this.msg('pwShow'), value: { type: 'input' } }
                ]
            }]);
        this.passwordField = pwType;
        let pw = await this.setPassword();
        log_1.log `\n`;
        const { port } = await this.prompt([{
                type: 'input', name: 'port', message: this.msg('port'), default: '8080',
                validate: (port) => {
                    const portInt = parseInt(port, 10);
                    return (typeof portInt === 'number' && !isNaN(portInt) &&
                        portInt >= 0 && portInt < 65536);
                }
            }]);
        log_1.log `\n`;
        const PEMS = await this.getKeys();
        const keys = SRP_1.Server.initKeys(PEMS.server);
        try {
            await this.write({
                pwType,
                settings: ''
            }, null, path.resolve(__dirname, `../settings.json`));
            let servers = !!process.env.SRP_servers ? JSON.parse(process.env.SRP_servers) : {};
            servers = JSON.stringify(Object.assign(Object.assign({}, servers), { [port]: this.env }));
            await this.write(Object.assign({ type: 'SRP_CREDENTIALS', keys: JSON.stringify(PEMS), secret: SRP_1.Server.randomByteHex(128), sessionsecret: SRP_1.Server.randomByteHex(128), signature: SRP_1.Server.randomByteHex(64), salt: uuid_1.nonce(saltMin, saltMax), kid: uuid_1.default(), env: this.env, port,
                servers }, (new Client_1.Client()).register(id, pw, keys.public)), SRP_1.Server.forge.pbkdf2(pw, id, 8, 32, 'sha256'));
            if (!(await this.checkPW(pw))) {
                log_1.log `${this.msg('writeHint', { userName })}`;
                throw (this.warningError('writeErr'));
            }
        }
        catch (e) {
            return this.run();
        }
        log_1.log `${this.msg('credDir1')}`;
        log_1.log `${this.msg('credDir2')}`;
        log_1.log `${this.configName}\n`;
        const config = await this.askPW(pw);
        this.quitting = true;
        this.output('thanks', '_and', 'comeback');
        this.reset();
        return config;
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
                        `:\n${warning}\n${Command_1.Command.BULLET} ${suggestions.join(`\n${Command_1.Command.BULLET} `)}`;
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
            console.log(' ');
            return this.setPassword();
        }
        if (!!this.quitting) {
            throw new Error('quitting');
        }
        return pw;
    }
    async validatePW(pw) {
        const config = await this.checkPW(pw);
        if (!config) {
            log_1.log `this.msg('vWrongPw')`;
        }
        return !!config;
    }
    async askPW(pw) {
        let config = !!pw ? await this.checkPW(pw) : {};
        if (!!pw) {
            return config;
        }
        await this.inquirer.prompt(Object.assign(Object.assign({}, this.passwordField), { name: 'PW', message: this.msg('qPw'), validate: async (pw) => {
                config = await this.checkPW(pw);
                return !config ? this.msg('vWrongPw') : true;
            } }));
        return config;
    }
    async checkPW(pw) {
        if (!pw || typeof pw !== 'string') {
            return Promise.reject(false);
        }
        const config = await this.read(SRP_1.Server.forge.pbkdf2(pw, this.settings.id, 8, 32, 'sha256'));
        return new Promise((resolve, reject) => {
            if (typeof config !== 'object' || !(config.salt) || config.statusCode !== 200) {
                reject(false);
            }
            resolve(config);
        });
    }
}
exports.Setup = Setup;
Setup.description = 'describe the command here';
Setup.examples = [
    `$ redaktor setup
... TODO
`
];
Setup.args = [{ name: 'file' }];
//# sourceMappingURL=index.js.map
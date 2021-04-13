"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const has_1 = require("@dojo/framework/has/has");
const main_1 = require("@dojo/core/main");
const main_2 = require("@dojo/framework/i18n/main");
const unique_1 = require("../../../util/unique");
const helper_1 = require("../helper");
const inquirer = require("inquirer");
const fs = require("fs");
const path = require("path");
const net = require("net");
const chalk_1 = require("chalk");
const CLI_1 = require("../nls/CLI");
const Socket = net.Socket;
const opn = require('opn');
const zxcvbn = require('zxcvbn');
const _bullet = (helper_1.OS === 'win32') ? '*' : '●';
const pwBar1 = chalk_1.default.green('█') + chalk_1.default.red('███');
const pwBar2 = chalk_1.default.green('██') + chalk_1.default.red('██');
class CLI {
    constructor(kwArgs, directory = '', providers = {}, providersOK = [], providersLeft = [], providerKeys = [], readonlyKeys = [
        'provider', 'statusCode', 'iat', 'uat'
    ], user = '', helpPW = false, messages = {}) {
        this.kwArgs = kwArgs;
        this.directory = directory;
        this.providers = providers;
        this.providersOK = providersOK;
        this.providersLeft = providersLeft;
        this.providerKeys = providerKeys;
        this.readonlyKeys = readonlyKeys;
        this.user = user;
        this.helpPW = helpPW;
        this.messages = messages;
        this.quitting = false;
        this.q = (pw = '', providerID) => {
            const qKey = {
                type: 'input',
                name: 'provider_key',
                message: (o) => {
                    const iksu = this.iksu(o.providerID);
                    if (o.helpAction === 'open') {
                        opn(iksu[3]);
                    }
                    return this.msg('qWhat') + iksu[1] + ' ?';
                },
                validate: (value) => {
                    return (value.length < 3) ?
                        this.msg('vLength', { key: 'key', length: 3 }) : true;
                }
            };
            const qSecret = {
                type: 'password',
                name: 'provider_secret',
                message: (o) => {
                    const iksu = this.iksu(o.providerID);
                    return this.msg('qWhat') + iksu[2] + ' ?';
                },
                validate: (value, o) => {
                    return (!(o.providerID) && value.length < 3) ?
                        this.msg('vLength', { key: 'secret', length: 3 }) : true;
                }
            };
            return {
                actions: [{
                        type: 'list',
                        name: 'action',
                        message: this.msg('qAction'),
                        choices: [
                            { name: this.msg('qaCreate'), value: 'create', short: this.msg('qsCreate') },
                            { name: this.msg('qaEdit'), value: 'edit', short: this.msg('qsEdit') },
                            { name: this.msg('qaQuit'), value: 'quit', short: this.msg('qaQuit') }
                        ]
                    }],
                password: [{
                        type: 'password',
                        name: 'pw',
                        message: this.msg('qPw'),
                        filter: zxcvbn,
                        validate: (pw) => {
                            const o = helper_1.checkPW(pw.password);
                            return (!o || typeof o !== 'object' || !(o.salt)) ? this.msg('vWrongPw') : true;
                        }
                    }],
                passwordSet: [
                    {
                        type: 'password',
                        name: 'pw',
                        message: this.msg('qPw'),
                        filter: zxcvbn,
                        validate: (strength) => {
                            if (strength.score < 2) {
                                return pwBar1 + chalk_1.default.red(' ' + this.msg('vPW1') + ' (' + this.msg('vSc') + ' 1/4):\n') +
                                    strength.feedback.warning + '\n' + _bullet + ' ' +
                                    strength.feedback.suggestions.join('\n' + _bullet + ' ');
                            }
                            else if (strength.score < 3) {
                                return pwBar2 + chalk_1.default.yellow(' ' + this.msg('vPW2') + ' (' + this.msg('vSc') + ' 2/4):\n') +
                                    strength.feedback.warning + '\n' + _bullet + ' ' +
                                    strength.feedback.suggestions.join('\n' + _bullet + ' ');
                            }
                            return true;
                        }
                    },
                    {
                        type: 'password',
                        name: 'pwConfirmed',
                        message: this.msg('qPwConfirmed'),
                        filter: zxcvbn
                    }
                ],
                create: [
                    {
                        type: 'list',
                        name: 'providerID',
                        message: this.msg('qProviderID'),
                        choices: () => {
                            return this.providersLeft.map((_p) => ({
                                name: _p, value: _p, short: _p
                            })).concat([{ name: this.msg('qaNewP'), value: 'unknown', short: this.msg('_new') }]);
                        }
                    },
                    {
                        type: 'input',
                        name: 'providerID',
                        message: this.msg('qProviderIDtba') + '\n' + chalk_1.default.dim('> 3 ' + this.msg('chars')),
                        validate: (value) => {
                            if (value.length < 3) {
                                return this.msg('vLength', { key: 'name', length: 3 });
                            }
                            else if (this.providersOK.indexOf(value) > -1) {
                                return this.msg('vExistsP');
                            }
                            else if (this.providersLeft.indexOf(value) > -1) {
                                return this.msg('vPrimaryP');
                            }
                            else {
                                return true;
                            }
                        },
                        when: (o) => (o.providerID === 'unknown')
                    },
                    {
                        type: 'list',
                        name: 'doHelp',
                        message: (o) => {
                            const key = o.providerID;
                            let msg = chalk_1.default.dim(this.providers[key].description) + '\n';
                            msg += chalk_1.default.reset('  ') +
                                chalk_1.default.bold(this.msg('qCanHelp') + ' ' + this.providers[key].title + ' ?');
                            return msg;
                        },
                        choices: [this.msg('qcHelp'), this.msg('qcNoHelp')],
                        when: (o) => (o.providerID !== 'unknown'),
                        filter: (value) => (value === this.msg('qcHelp'))
                    },
                    {
                        type: 'list',
                        name: 'helpAction',
                        message: (o) => {
                            const iksu = this.iksu(o.providerID);
                            return (chalk_1.default.reset(iksu[0] || ' ') + '\n' +
                                chalk_1.default.green([this.msg('need'), iksu[1], this.msg('_and'), iksu[2] + '.'].join(' ')) +
                                '\n' + chalk_1.default.dim(this.msg('qcHelpGet') + ' ' + iksu[3]));
                        },
                        choices: [
                            {
                                name: this.msg('qcOpenPage'),
                                value: 'open',
                                short: this.msg('qsOpenPage')
                            },
                            {
                                name: this.msg('qcGoOn'),
                                value: 'go',
                                short: '...'
                            }
                        ],
                        when: (o) => (o.doHelp === true && o.providerID !== 'unknown')
                    },
                    qKey,
                    qSecret,
                    {
                        type: 'input',
                        name: 'provider_note',
                        message: this.msg('qNote'),
                        default: this.msg('qNoNote'),
                        filter: (value) => ((value === this.msg('qNoNote')) ? '' : value.trim())
                    }
                ],
                edit: [
                    {
                        type: 'list',
                        name: 'providerID',
                        message: this.msg('qeProviderID'),
                        choices: helper_1.getTokenChoices.bind(this)
                    },
                    {
                        type: 'list',
                        name: 'providerEdit',
                        message: (o) => {
                            helper_1.logToken(helper_1.readToken(pw, o.providerID));
                            return this.msg('qProviderEdit');
                        },
                        choices: [
                            { name: this.msg('qeKS'), value: 'editShort', short: this.msg('qsKS') },
                            { name: this.msg('qeAll'), value: 'editFull', short: this.msg('qsAll') },
                            { name: this.msg('qeAdd'), value: 'editAdd', short: this.msg('qsAdd') },
                            { name: this.msg('qeNo'), value: 'start', short: 'OK!' },
                        ]
                    },
                    main_1.lang.mixin({
                        when: (o) => (o.providerEdit === 'editShort'),
                        default: (o) => ((helper_1.readToken(pw, o.providerID).key) || '')
                    }, qKey),
                    main_1.lang.mixin({
                        when: (o) => (o.providerEdit === 'editShort'),
                        default: (o) => ((helper_1.readToken(pw, o.providerID).secret) || '')
                    }, qSecret)
                ],
                editAdd: [
                    {
                        type: 'input',
                        name: 'providerAddKey',
                        message: (o) => {
                            const msg = chalk_1.default.red('Read Only: "' + this.readonlyKeys.join('", "') + '".');
                            return (msg + '\n' + this.msg('qProviderAddKey'));
                        },
                        validate: (value) => {
                            return (value === '' || this.readonlyKeys.indexOf(value) > -1) ?
                                this.msg('vAddKey') : true;
                        }
                    },
                    {
                        type: 'input',
                        name: 'providerAddValue',
                        message: (o) => (this.msg('qProviderAddValue') + o.providerAddKey + ' ?')
                    },
                    {
                        type: 'list',
                        name: 'providerAddAnother',
                        message: this.msg('qProviderAddAnother'),
                        choices: [this.msg('yes'), this.msg('no')]
                    }
                ]
            };
        };
        if (!has_1.default('host-node')) {
            throw new Error('requires node.js');
        }
        main_2.default(CLI_1.default, main_2.default.locale).then(this._init.bind(this));
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
    scanPort(port, host) {
        if (typeof port === 'string') {
            port = parseInt(port);
        }
        var socket = new Socket();
        var status = 'closed';
        return new Promise(function (resolve, reject) {
            socket.on('connect', function () { status = 'open'; socket.destroy(); });
            socket.setTimeout(500);
            socket.on('timeout', function () { status = 'closed'; socket.destroy(); });
            socket.on('error', function () { status = 'closed'; });
            socket.on('close', function () { resolve(status); });
            socket.connect(port, host);
        });
    }
    iksu(key) {
        return [
            (this.providers[key].setup.instructions || ' '),
            (this.providers[key].setup.key || 'key'),
            (this.providers[key].setup.secret || 'secret'),
            (this.providers[key].setup.url || 'https://indieauth.com')
        ];
    }
    _init(messages) {
        this.messages = messages;
        const subDir = (this.directory === '') ? '.IndieAuth' : this.directory;
        this.directory = path.resolve(helper_1.userDir || './', subDir);
        this.user = path.basename(helper_1.userDir || './');
        console.log(chalk_1.default.reset(' '));
        console.log(chalk_1.default.red(' ╔════╗ ') + chalk_1.default.green('   __   '));
        console.log(chalk_1.default.red(' ╚════╝ ') + chalk_1.default.green('  /__\\ '));
        console.log(chalk_1.default.red(' ╔════╗ ') + chalk_1.default.green(' / || \\'));
        console.log(chalk_1.default.red(' ║    ║ ') + chalk_1.default.green('(__||__)'));
        console.log(chalk_1.default.red(' ║    ║ '));
        console.log(chalk_1.default.red(' ╚════╝ ') + 'Hi ' + this.user + ', ' + this.msg('welcome'));
        helper_1.doLog({ success: '      IndieAuth Command Line Utility !' });
        this.providers = helper_1.getProviders('', true, true, true);
        this.updateProviders();
        this.prerequisites();
    }
    updateProviders(pw) {
        this.providerKeys = Object.keys(this.providers);
        this.providersLeft = [];
        this.providersOK = [];
        let q = this.q(pw);
        this.providerKeys.forEach((key) => {
            let a = (!!this.providers[key].setup && this.providers[key].setup.additionalProperties);
            if (!!pw && !!a) {
                let secretIndex = (q.create.map((action) => {
                    return action.name;
                }).indexOf('provider_secret') || (q.create.length - 1));
                q.create.splice.apply(q.create, [secretIndex + 1, 0].concat(a));
            }
            if (!fs.existsSync(path.resolve(this.directory, key + '.jwt'))) {
                this.providersLeft.push(key);
            }
            else {
                this.providersOK.push(key);
            }
        });
        if (!!pw) {
            q.create = q.create.map((action) => {
                var key;
                for (key in action) {
                    if (typeof action[key] === 'function') {
                        action[key] = action[key].bind(this);
                    }
                }
                return action;
            });
            return q;
        }
    }
    prerequisites() {
        return new Promise((resolve, reject) => {
            if (!fs.existsSync(path.join(this.directory, '/IndieAuth.jwt'))) {
                try {
                    helper_1.doLog({ warning: this.msg('cInstalled') + ' :' });
                    if (!fs.existsSync(this.directory)) {
                        fs.mkdirSync(this.directory);
                    }
                    helper_1.doLog({
                        success: this.msg('cCredDir') + '\n' + this.directory
                    });
                    helper_1.doLog({
                        neutral: this.msg('cPWnote1') + '\n' + this.msg('cPWnote2') +
                            '\n> ' + chalk_1.default.green(this.msg('cPWnote3'))
                    });
                    this.setPassword();
                }
                catch (e) {
                    this.directory = '';
                    reject(false);
                }
            }
            else {
                if (!!(process.env.PW) && helper_1.checkPW(process.env.PW || '')) {
                    this.start({ pw: zxcvbn(process.env.PW) });
                }
                else {
                    inquirer.prompt(this.q().password).then(this.start.bind(this));
                }
            }
        });
    }
    setPassword(saltMinLength = 100, saltMaxLength = 260) {
        return inquirer.prompt(this.q().passwordSet).then((o) => {
            if (!!this.quitting) {
                return;
            }
            if (o.pwConfirmed.password !== o.pw.password) {
                helper_1.doLog({ error: this.msg('cPWerr') });
                this.setPassword(saltMinLength, saltMaxLength);
            }
            else {
                const kid = unique_1.uuid();
                const salt = unique_1.nonce(saltMinLength, saltMaxLength);
                if (typeof kid !== 'string' || typeof salt !== 'string' ||
                    salt.length < saltMinLength || salt.length > saltMaxLength) {
                    helper_1.doLog({ error: this.msg('cWriteErr') });
                    helper_1.doLog({ error: this.msg('cPWerr') });
                    this.setPassword(100, 260);
                }
                helper_1.writeToken({ salt: salt, kid: kid }, o.pw.password);
                if (!helper_1.checkPW(o.pw.password)) {
                    helper_1.doLog({ error: this.msg('cWriteErr') });
                    helper_1.doLog({ neutral: this.msg('cWriteHint', { directory: this.directory, user: this.user }) });
                    return this.setPassword(saltMinLength, saltMaxLength);
                }
                this.start(o, true);
            }
        });
    }
    helpWithPW() {
        helper_1.doLog({ error: this.msg('cNoPWerr') });
        helper_1.doLog({ error: this.msg('cNoPWerr2') });
        const __q = [{
                type: 'list',
                name: 'startCLI',
                message: this.msg('cCLI'),
                choices: [
                    { name: this.msg('yes'), value: 'yes', short: 'CLI' },
                    { name: this.msg('noAgain'), value: 'no', short: this.msg('qaQuit') }
                ]
            }];
        return inquirer.prompt(__q).then((hO) => {
            if (hO.startCLI === 'yes') {
                return Promise.resolve(new CLI({ directory: this.directory }));
            }
            else {
                return Promise.reject(false);
            }
        });
    }
    editFull(o, id, pw) {
        const _token = helper_1.readToken(pw, id);
        const qEditFull = Object.keys(_token)
            .filter((key) => (this.readonlyKeys.indexOf(key) < 0))
            .map((key) => ({
            type: 'input',
            name: ('provider_' + key),
            message: this.msg('qProviderNewValue') + ' "' + key + '" ?',
            default: _token[key]
        }));
        return inquirer.prompt(qEditFull).then((eO) => {
            eO.providerID = id;
            helper_1.writeToken(eO, pw);
            this.start(o, false, true);
        });
    }
    editAdd(o, id, pw, _o) {
        const _token = (_o || { providerID: id });
        if (!_o) {
            _o = helper_1.readToken(pw, id);
            var key;
            for (key in _o) {
                if (this.readonlyKeys.indexOf(key) === -1) {
                    _token['provider_' + key] = _o[key];
                }
            }
        }
        const qEditAdd = this.q(pw, id).editAdd;
        return inquirer.prompt(qEditAdd).then((eO) => {
            if (eO.providerAddAnother === this.msg('yes')) {
                _token['provider_' + eO.providerAddKey] = eO.providerAddValue;
                this.editAdd(o, id, pw, _token);
            }
            else {
                _token['provider_' + eO.providerAddKey] = eO.providerAddValue;
                helper_1.writeToken(_token, pw);
                this.start(o, false, true);
            }
        });
    }
    start(o, isNew = false, isRepeat = false) {
        if (!o.pw.password) {
            return false;
        }
        const pwBar = chalk_1.default.green('███') + chalk_1.default[(o.pw.score === 4) ? 'green' : 'red']('█');
        const pwStatus = [pwBar, this.msg('vPW'), this.msg('vSc'), (o.pw.score + '/4')].join(' ');
        if (isNew) {
            helper_1.doLog({ success: pwStatus });
            helper_1.doLog({ success: this.msg('cWorks') });
        }
        else {
            helper_1.doLog({ success: (isRepeat) ? 'OK!' : pwStatus });
        }
        const q = this.updateProviders(o.pw.password);
        if (this.providersOK.length > 0) {
            helper_1.doLog({ success: this.msg('cFoundCred') + ': \n' + this.providersOK.join(', ') });
        }
        helper_1.doLog((this.providersLeft.length > 0) ?
            { error: this.msg('cFoundNot') + ': \n' + this.providersLeft.join(', ') } :
            { success: this.msg('cFoundAll') });
        const rootPrompt = inquirer.prompt(q.actions);
        return rootPrompt.then((aO) => {
            if (aO.action !== 'quit') {
                return inquirer.prompt(q[aO.action]).then((rO) => {
                    if (!!(rO.providerEdit) && rO.providerEdit !== 'editShort') {
                        return this[rO.providerEdit](o, rO.providerID, o.pw.password);
                    }
                    else {
                        helper_1.writeToken(rO, o.pw.password);
                        return this.start(o, false, true);
                    }
                });
            }
            this.quitting = true;
            helper_1.doLog({
                out: [
                    this.msg('thanks'), this.msg('_and'),
                    ((this.providersLeft.length > 1) ? this.msg('comeback') : this.msg('bye'))
                ].join(' ')
            });
            console.log(chalk_1.default.reset(' '));
            if (!!(o.pw)) {
                delete o.pw;
            }
            if (!!(o.pwConfirmed)) {
                delete o.pwConfirmed;
            }
            process.exit(1);
        });
    }
}
exports.CLI = CLI;
//# sourceMappingURL=main.js.map
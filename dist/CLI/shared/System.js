"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const fs = require("fs");
const os = require("os");
const path = require("path");
const child_process_1 = require("child_process");
const has_1 = require("@dojo/framework/core/has");
const slug_1 = require("../../framework/String/slug");
const webtoken_1 = require("../../framework/JSON/webtoken");
const uuid_1 = require("../../framework/uuid");
const _NODE = has_1.default('host-node');
function onlyNODE() {
    if (!(_NODE)) {
        throw new Error('requires node.js');
    }
}
exports.onlyNODE = onlyNODE;
exports.BULLET = (os.platform() === 'win32') ? '*' : '●';
class System {
    constructor() {
        this._rootDir = path.resolve(__dirname, '../../..');
        this._credDir = path.join(os.homedir(), `.${slug_1.default(this.brand, '_')}`);
        this._config = path.join(this._credDir, 'index.json');
        this._id = uuid_1.default(this._rootDir);
        onlyNODE();
        this._rootDir = fs.existsSync(this._rootDir) ? this._rootDir : process.cwd();
        !fs.existsSync(this._credDir) && fs.mkdirSync(this._credDir);
    }
    static kickstart() {
        if (!System.instance) {
            System.instance = new System();
            System.commands = System.getRequiredCommands();
        }
        return System.instance;
    }
    static getRequiredCommands() {
        const commandDir = path.resolve(__dirname, '../commands/');
        return fs.readdirSync(commandDir)
            .map((name) => [commandDir, name])
            .filter((p) => fs.lstatSync(p.join('/')).isDirectory())
            .reduce((o, p) => {
            const MODUL = require(p.join('/'));
            const CLASS = MODUL.default || MODUL[p[1]];
            o[p[1]] = new CLASS();
            return o;
        }, {});
    }
    get platform() {
        if (this._platform) {
            return this._platform;
        }
        const platform = os.platform();
        this._platform = {
            linux: platform === 'linux',
            macos: platform === 'darwin',
            darwin: platform === 'darwin',
            windows: platform === 'win32',
            win32: platform === 'win32'
        };
        return this._platform;
    }
    get userName() { return os.userInfo().username; }
    get rootDir() { return this._rootDir; }
    get id() { return this._id; }
    get brand() { return this._packageJSON.name; }
    get version() { return this._packageJSON.version; }
    get configs() {
        return {
            CLI: this._packageJSON.config,
            global: this._globalConfig
        };
    }
    get status() {
        return {
            name: 'redaktor',
            desc: '',
            root: this.rootDir,
            user: path.basename(os.homedir() || './'),
            install: Date.now(),
            setup: 0,
            firstLogin: 0
        };
    }
    get modules() {
        if (this._modules) {
            return this._modules;
        }
        const NM = 'node_modules';
        const winLike = os.type() === 'msys' || os.type() === 'cygwin';
        const osPrefix = this.platform.windows || winLike ? '' : 'lib/';
        const m = { local: path.join(this._rootDir, NM), npm: false, yarn: false };
        const o = { stdio: 'pipe', encoding: 'utf8' };
        try {
            m.npm = child_process_1.execSync('npm prefix -g', o).toString().trim();
        }
        catch (e) { }
        try {
            m.yarn = child_process_1.execSync('yarn global dir', o).toString().trim();
        }
        catch (e) { }
        for (const k in m) {
            if (!m[k]) {
                continue;
            }
            const globalPath = path.resolve(m[k], `${osPrefix}${NM}`);
            if (fs.existsSync(m[k])) {
                m[k] = globalPath;
            }
        }
        this._modules = m;
        return this._modules;
    }
    async read(pw, fileName = `${this.id}.jwt`) {
        return new Promise((resolve) => {
            try {
                let res = fs.readFileSync(path.resolve(this._credDir, fileName), 'utf8');
                res = pw ? (webtoken_1.default.decode(res, pw) || {}) : JSON.parse(res);
                resolve(res);
            }
            catch (e) {
                if (fileName === `${this.id}.jwt`) {
                }
                resolve({});
            }
        });
    }
    async write(o, pw, fileName = `${this.id}.jwt`) {
        const cDate = new Date();
        const uDate = null;
        return new Promise((resolve, reject) => {
            try {
                let res = Object.assign({ statusCode: 200, iat: cDate, uat: uDate }, o);
                res = pw ? webtoken_1.default.encode(res, pw, 'sha256') : JSON.stringify(res);
                fs.writeFileSync(path.resolve(this._credDir, fileName), res, 'utf8');
                resolve(res);
            }
            catch (e) {
                reject(e);
            }
        });
    }
    async readConfig(pw) {
        return await this.read(pw);
    }
    async mixinConfig(o, pw) {
        const token = await this.read(pw);
        const newToken = Object.assign(Object.assign({}, token), o);
        return this.write(newToken, pw);
    }
    async mixinStatus(_status) {
        if (!_status) {
            _status = this.status;
        }
        const newStatus = Object.assign(Object.assign({}, this.status), _status);
        const newConfig = Object.assign(Object.assign({}, this._globalConfig), { [this.id]: newStatus });
        return this.write(newConfig, void 0, this._config);
    }
    get _globalConfig() {
        const _file = path.join(this._credDir, 'index.json');
        const newConfig = { [this.id]: this.status };
        try {
            if (!fs.existsSync(_file)) {
                fs.writeFileSync(_file, JSON.stringify(newConfig, null, 2));
                return newConfig;
            }
            return JSON.parse(fs.readFileSync(_file, 'utf8'));
        }
        catch (e) {
            return newConfig;
        }
    }
    get _packageJSON() {
        const { name = 'redaktor', version = '0.0.0', config } = require(path.join(this.rootDir, 'package.json'));
        return { name, version, config };
    }
}
exports.default = System;
System.commands = {};
//# sourceMappingURL=System.js.map
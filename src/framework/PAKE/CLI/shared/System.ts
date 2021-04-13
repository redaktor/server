import * as fs from 'fs';
import * as os from 'os';
import * as path from 'path';
import { execSync } from 'child_process';
import has from '@dojo/framework/core/has';
import slug from '../../framework/String/slug';
import jwt from  '../../framework/JSON/webtoken';
import uuid from '../../framework/uuid';

export interface Platform {
  linux: boolean;
  macos: boolean;
  darwin: boolean;
  windows: boolean;
  win32: boolean;
}
export interface Status {
  name: string;
  desc: string;
  root: string;
  user: string;
  install?: number;
  setup?: number;
  firstLogin?: number;
}
export interface Command {

}
interface GlobalConfig {
  [uuid: string]: Status;
}

const _NODE = has('host-node');
export function onlyNODE() {
  if (!(_NODE)) { throw new Error('requires node.js'); }
}
export const BULLET = (os.platform() === 'win32') ? '*' : '●';

export default class System {
  private static instance: System;
  static commands = {};
  static kickstart() {
    if (!System.instance) {
      System.instance = new System();
      // ... any one time initialization goes here ...
      System.commands = System.getRequiredCommands();
      // EMIT kickstart
    }
    return System.instance;
  }
  static getRequiredCommands() {
    const commandDir = path.resolve(__dirname, '../commands/');
    return fs.readdirSync(commandDir)
      .map((name: string) => [commandDir, name])
      .filter((p: string[]) => fs.lstatSync(p.join('/')).isDirectory())
      .reduce((o: any, p: string[]) => {
        const MODUL = require(p.join('/'));
        const CLASS = MODUL.default || MODUL[p[1]]
        o[p[1]] = new CLASS();
        return o
      }, {});
      // EMIT defaultPluginsLoaded
  }

  private readonly _rootDir = path.resolve(__dirname,'../../..');
  private readonly _credDir = path.join(os.homedir(), `.${slug(this.brand, '_')}`);
  private readonly _config = path.join(this._credDir, 'index.json');
  private readonly _id = uuid(this._rootDir);
  private _modules: { npm: string|false; yarn: string|false; };
  private _platform: Platform;

  private constructor() {
    onlyNODE();
    this._rootDir = fs.existsSync(this._rootDir) ? this._rootDir : process.cwd();
    !fs.existsSync(this._credDir) && fs.mkdirSync(this._credDir);
    // TODO built in for  _commands
    /*
    const { lstatSync, readdirSync } = require('fs')
    const { join } = require('path')

    const isDirectory = source => fs.lstatSync(source).isDirectory()
    const getDirectories = source =>
      fs.readdirSync(source).map(name => join(source, name)).filter(isDirectory)
    */
    // MOVE log fns in framework and Auth in server
  }

  get platform() {
    if (this._platform) { return this._platform }
    const platform = os.platform();
    this._platform = {
      linux: platform === 'linux',
      macos: platform === 'darwin',
      darwin: platform === 'darwin',
      windows: platform === 'win32',
      win32: platform === 'win32'
    }
    return this._platform;
  }
  /*
  get operatingSystem() {
    if (!this._operatingSystem) {
      const getOS = require('./utils/get-os');
      this._operatingSystem = getOS(this.platform);
      return this._operatingSystem;
    }
    return this._operatingSystem;
  }
  setEnvironment(isDevMode, setNodeEnv) {
    this.environment = isDevMode ? 'development' : 'production';
    this.development = isDevMode;
    this.production = !isDevMode;

    if (setNodeEnv) {
      process.env.NODE_ENV = this.environment;
    }
  }
  */
  get userName() { return os.userInfo().username }

  get rootDir() { return this._rootDir }
  get id() { return this._id }
  get brand() { return this._packageJSON.name }
  get version() { return this._packageJSON.version }
  get configs() {
    return {
      CLI: this._packageJSON.config,
      global: this._globalConfig
    }
  }
  get status(): Status {
    return {
      name: 'redaktor',
      desc: '',
      root: this.rootDir,
      user: path.basename(os.homedir()||'./'),
      install: Date.now(),
      setup: 0,
      firstLogin: 0
    }
  }
  get modules() {
    // TODO which npm OR which yarn
    if (this._modules) { return this._modules }
    const NM = 'node_modules';
    const winLike = os.type() === 'msys' || os.type() === 'cygwin';
    const osPrefix = this.platform.windows || winLike ? '' : 'lib/';
    const m: any = { local:path.join(this._rootDir, NM), npm:false, yarn:false };
    const o: any = { stdio: 'pipe', encoding: 'utf8' };
    try { m.npm = execSync('npm prefix -g', o).toString().trim() } catch(e) {}
    try { m.yarn = execSync('yarn global dir', o).toString().trim() } catch(e) {}
    for (const k in m) {
      if (!m[k]) { continue }
      const globalPath = path.resolve(m[k], `${osPrefix}${NM}`);
      if (fs.existsSync(m[k])) {
        m[k] = globalPath;
      }
    }
    this._modules = m;
    return this._modules
  }

  async read(pw?: string, fileName: string = `${this.id}.jwt`) {
    return new Promise<any>((resolve) => {
      try {
        let res = fs.readFileSync(path.resolve(this._credDir, fileName), 'utf8');
        res = pw ? (jwt.decode(res, pw)||{}) : JSON.parse(res);
        resolve(res);
      } catch(e) {
        if (fileName === `${this.id}.jwt`) {
          /* TODO FIXME password recovery ? */
          /* NO password token, delete folder ??? - unexpected error */
        }
        resolve({});
      }
    })
  }
  async write(o: any, pw?: string, fileName: string = `${this.id}.jwt`) {
    const cDate = new Date();
    const uDate = null;
    return new Promise<any>((resolve, reject) => {
      try {
        let res = {...{statusCode: 200, iat: cDate, uat: uDate}, ...o};
        res = pw ? jwt.encode(res, pw, 'sha256') : JSON.stringify(res);
        fs.writeFileSync(path.resolve(this._credDir, fileName), res, 'utf8');
        resolve(res)
      } catch(e) {
        reject(e);
      }
    })
  }
  async readConfig(pw: string) {
    return await this.read(pw);
  }
  async mixinConfig(o: any, pw: string) {
    const token = await this.read(pw);
    const newToken = {...token, ...o};
    return this.write(newToken, pw);
  }
  async mixinStatus(_status: Status) {
    if (!_status) { _status = this.status }
    const newStatus = {...this.status, ..._status};
    const newConfig: GlobalConfig = {
      ...this._globalConfig,
      ...{ [this.id]: newStatus }
    };
    return this.write(newConfig, void 0, this._config);
  }

  private get _globalConfig(): GlobalConfig {
    const _file = path.join(this._credDir, 'index.json');
    const newConfig: GlobalConfig = { [this.id]: this.status }
    try {
      if (!fs.existsSync(_file)) {
        fs.writeFileSync(_file, JSON.stringify(newConfig, null, 2));
        return newConfig
      }
      return JSON.parse(fs.readFileSync(_file, 'utf8'))
    } catch (e) {
      return newConfig
    }
  }
  private get _packageJSON() {
    const {
      name = 'redaktor',
      version = '0.0.0',
      config
    } = require(path.join(this.rootDir, 'package.json'));
    return { name, version, config }
  }


}

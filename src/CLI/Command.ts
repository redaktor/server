// IMPORT
import {Command as BaseCommand, flags as BaseFlags} from '@oclif/command';
import * as Config from '@oclif/config';
import * as fs from 'fs';
import * as os from 'os';
import * as path from 'path';
import * as inquirer from 'inquirer';
import i18n from '@dojo/framework/i18n/main';
import { Bundle, Messages } from '@dojo/framework/i18n/main';
import { BULLET } from './shared/constants';
import { _, log, reset, message, success, warning, error, list, input, output,
info, neutral, muted } from '../framework/String/tag/log';
import uuid from '../framework/uuid';
import jwt from  '../framework/JSON/webtoken';

export * from '../framework/String/tag/log';
export type Question = inquirer.Question;
export type LogFn = (strings: string|TemplateStringsArray, ...values: any[]) => string;
export const flags = BaseFlags;

export interface RedaktorConfig {
  id: string;
  version: string;
  userName: string;
  brand: string;
  debug: boolean;
  configDir: string;
  home: string;
  root: string;
  arch: string;
  platform: string;
  windows: boolean;
  pjson: any;
}

export class Command extends BaseCommand {
  private configName = '';
  protected prompt = inquirer.prompt;
  protected messages: Messages = {};
  protected quitting = false;
  protected passwordField = { type: 'password', mask: BULLET };
  protected redaktor: RedaktorConfig;

  constructor(public argv: string[], public config: Config.IConfig) {
    super(argv, config);
    const stats = fs.statSync(__filename);
    const id = uuid(`${stats.ino}@${stats.dev}`);
    const { home, root, arch, platform, windows, debug, name, version, pjson } = this.config;
    this.redaktor = {
      id,
      version,
      userName: os.userInfo().username,
      brand: name || '',
      debug: !!debug,
      configDir: path.dirname(this.config.configDir) || './',
      home, root, arch, platform, windows, pjson
    }
    this.configName = path.resolve(this.redaktor.configDir, `redaktor_${this.redaktor.id}.jwt`);
    console.log(this.configName)
  }

  run() { return Promise.resolve() }
  /*
  protected exit() {
    process.exit();
    return true
  }
  */
  protected async i18n(bundle: Bundle<any>) {
    this.messages = await i18n(bundle, i18n.locale);
    this.reset();
    return this.messages
  }

  msg(_id = 'unknown', el?: any, fallback = '') {
    var m = (!!(this.messages) && this.messages[_id]);
    if (!m) { m = _id; }
    if (!!el && typeof el === 'object') {
      const rawData = !!(el.dataset) ? el.dataset : el;
      (m.match(/[_]\{([^}]+)\}/gi)||[]).map((tplStr: string) => {
        const pointer = tplStr.slice(2, -1);
        var data = rawData[pointer];
        if (typeof data !== 'string' && tplStr.slice(2, 3) === '/') { data = m; }
        m = m.replace(tplStr, (typeof data === 'string') ? data : fallback);
      });
    }
    return m;
  }
  choices(...ids: string[]) {
    return ids.map((key) => ({name: this.msg(key), value: key}))
  }

  // Logging functions
  protected reset() { reset` ` }
  protected logFn(fn: Function, strings: string|TemplateStringsArray, ...values: any[]) {
    if (typeof strings === 'string') {
      return fn`${this.msg(strings)} ${values.map((v) => this.msg(v)).join(' ')}`
    }
    return fn(strings, ...values)
  }
  protected rLog: LogFn = (s, ...values) => this.logFn(log, s, ...values);
  protected message: LogFn = (s, ...values) => this.logFn(message, s, ...values);
  protected success: LogFn = (s, ...values) => this.logFn(success, s, ...values);
  protected warning: LogFn = (s, ...values) => this.logFn(warning, s, ...values);
  protected warningError: LogFn = (s, ...values) => this.logFn(error, s, ...values);
  protected list: LogFn = (s, ...values) => this.logFn(list, s, ...values);
  protected input: LogFn = (s, ...values) => this.logFn(input, s, ...values);
  protected output: LogFn = (s, ...values) => this.logFn(output, s, ...values);
  protected neutral: LogFn = (s, ...values) => this.logFn(neutral, s, ...values);
  protected muted: LogFn = (s, ...values) => this.logFn(muted, s, ...values);
  protected info: Function = info;

  protected async read(pw?: string, fileName: string = this.configName) {
    return new Promise<any>((resolve) => {
      try {
        let res = fs.readFileSync(fileName, 'utf8');
        res = pw ? (jwt.decode(res, pw)||{}) : JSON.parse(res);
        resolve(res);
      } catch(e) {
        if (fileName === this.configName) {
          /* TODO FIXME password recovery ? */
          /* NO password token, deleted user folder - unexpected error */
        }
        resolve({});
      }
    })
  }
  protected async write(o: any, pw?: string, fileName: string = this.configName, updatedAt: Date = null) {
    const cDate = new Date();
    const uDate = updatedAt || '';
    return new Promise<any>((resolve, reject) => {
      try {
        let res = {...{statusCode: 200, iat: cDate, uat: uDate}, ...o};
        res = pw ? jwt.encode(res, pw, 'sha256') : JSON.stringify(res);
        fs.writeFileSync(fileName, res, 'utf8');
        resolve(res)
      } catch(e) {
        reject(e);
      }
    })
  }
  protected hasConfig() {
    return fs.existsSync(this.configName)
  }
  protected async readConfig(pw: string) {
    return await this.read(pw);
  }
  protected async mixinConfig(o: any, pw: string) {
    const token = await this.read(pw);
    const newToken = {...token, ...o};
    return this.write(newToken, pw);
  }
}

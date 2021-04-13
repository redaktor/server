// IMPORT
//const opn: any = require('opn');
//import * as path from 'path';
import * as fs from 'fs';
import * as inquirer from 'inquirer';
import { createConnection } from "typeorm";
import uuid, { nonce } from '../framework/uuid';
import { strength } from '../framework/crypto/password';
import { _, log } from '../CLI';
import bundle from '../nls/CLI';
import Command from './Command';
import System, { BULLET } from './shared/System';
import getDBprompts from './shared/db.install';
type specialServer = false | 'localhost' | 'U6' | 'U7';

export * from '../framework/String/tag/log';
export type Question = inquirer.Question;
export type LogFn = (strings: string|TemplateStringsArray, ...values: any[]) => string;

export default class CLI extends Command {
  protected system = System.kickstart();

  constructor() {
    super();
    //console.log(System.commands);
    this.startCLI()
  }

/* TODO multiple redaktors at one machine need unique credDir */

  private async startCLI() {

    //console.log(await this.checkSpecialServer(), this.system.status.setup);

    await this.i18n(bundle);
    const hi = `Hi ${this.system.userName}.`;
    this.error('warn');
    if (!this.system.status.setup) {
      // NEW SETUP !
      this.info(_`G${hi} ${this.msg('welcome')} ${this.msg('name')}\n`[0]);
      await this.setup();
      this.startCLI();
    } else {
      this.success`${hi}`;
      if (!!(process.env.PW) && this.checkPW(process.env.PW||'')) {
        // check password ENV var
        this.startServer(process.env.PW);
      } else {
        // check password input
        this.startServer();
      }
    }
  }

  private async startServer(PW?: string) {
    if (!PW) { PW = await this.askPW() }
    console.log('START SERVER w.', PW)
    // TODO FIXME start w. process.env.PW = PW
  }

  private async setup(saltMin: number = 100, saltMax: number = 260){
    const { userName } = this.system;
    this.success('installed', ':');
    log`${this.msg('credDir')}\n`;

    // SET PASSWORD
    let pw = await this.setPassword();
    // if (!pw) { }
    /* e.g. used for session secret ... */
    this.system.write({secret: nonce(64, 128), salt: nonce(saltMin, saltMax), kid: uuid()}, pw);
    // should not happen: we could not write in our self created credDir ...
    if (!this.checkPW(pw)) {
      this.error('writeErr');
      log`${this.msg('writeHint', {userName})}`;
      return this.setPassword();
    }

    // SET DATABASE
    const db = await this.setDB();
    const token = this.system.read(pw);
    this.system.write({...token, db}, pw);

    // SET SERVER - port, url, document.root


    // USE or SET SSL



/* TODO ONLY for debug */
    const finalToken = this.system.read(pw); console.log(finalToken);
/* <-- */
    pw = '';
    this.quitting = true;
    this.output('thanks', '_and', 'comeback');
    this.reset();
    return this.exit()
  }

  private async setPassword(): Promise<string> {
    const pwMin = 4; //this.config.passwordMinStrength;
    const MIN = Math.max(2, Math.min(5, pwMin));
    const ERR = Math.max(2, Math.min(5, Math.round(pwMin / 2)));
    // Password rules
    log`${this.msg('pwFlow1')}\n  ${this.msg('pwFlow2')}\n`;
    // Should we mask passwords ?
    const { pwType }: any = await this.prompt([{
      type: 'list', name: 'pwType', message: this.msg('pwType'),
      choices: [
        {name: this.msg('pwMask'), value: this.passwordField},
        {name: this.msg('pwShow'), value: {type: 'input'}}
      ]
    }]);
    this.passwordField = pwType;
    // Enter PW
    log`\n> G${this.msg('pwFlow3')}`;
    this.warning('pwRule','\n ','pwHint','\n ','pwScore',`${pwMin}\n`);
    let pwBar = '';
    let { pw }: any = await this.prompt([{
      ...this.passwordField, name: 'pw', message: this.msg('qPw'),
      filter: strength,
      validate: (strength: any): boolean|string => {
        let { warning, suggestions, score, bar, message } = strength;
        bar = bar.map((s: string, i: number) => !i ? _`G${s}` : _`R${s}`).join('');
        if (score >= MIN) {
          pwBar = `${bar} ${message}`;
          return true
        }
        const errMsg = this.msg(score < ERR ? 'pwErr1' : 'pwErr2');
        warning = `${errMsg}${warning.length ? `\n${warning}` : ''}`;
        suggestions = [this.messages.pwRule, this.messages.pwHint].concat(suggestions);
        message += !suggestions.length ? `\n${warning}` :
          `:\n${warning}\n${BULLET} ${suggestions.join(`\n${BULLET} `)}`;
        return `${bar} ${score === 3 ? _`Y${message}` : _`R${message}`}`;
      },
      transformer: (s: string) => (typeof s === 'string' ? s : '')
    }]);
    pw = pw.zxcvbn.password;


    // Confirm PW - TODO FIXME if > 2 times wrong --> resume choice
    await this.prompt([{
      ...this.passwordField, name: 'pwConfirmed', message: `${pwBar}\n${this.msg('pwConfirm')}`,
      filter: strength,
      validate: (strength: any): boolean|string => {
        return (strength.zxcvbn.password !== pw ? this.msg('pwCErr') : true)
      },
      transformer: (s: string) => (typeof s === 'string' ? s : '')
    }]);

    if (!!this.quitting) { throw new Error('quitting') }
    return pw
  }

  private async setDB(preferences?: any): Promise<any> {
    const dbPrompts = getDBprompts(this.system.userName, preferences).map((o) => {
      if (typeof o.message === 'string') { o.message = this.msg(o.message) }
      return o
    });
    !preferences && log`> G${this.msg('dbFlow1')}\n\n  ${this.msg('dbFlow2')}`;
    this.warning('dbFlow3','\n'); // see also docs
    let { type }: any = await this.prompt([{
      type: 'list', name: 'type', message: this.msg('dbType'),
      choices: Object.keys(dbPrompts).map((k: string) => ({name: k}))
    }]);
    // TODO
    // MongoDB package has not been found installed. Try to install it: npm install mongodb --save
    const settings: any = await this.prompt(dbPrompts[type]);
    return this.checkDB({type, ...settings});
  }

  private async setExtendedDB(preferences?: any): Promise<any> {
    console.log(preferences || 'extend DB');
    /* TODO EXTENDED
    postgres
    ssl {
      rejectUnauthorized : false,
      ca   : fs.readFileSync("/path/to/server-certificates/root.crt").toString(),
      key  : fs.readFileSync("/path/to/client-key/postgresql.key").toString(),
      cert : fs.readFileSync("/path/to/cl-certificates/postgresql.crt").toString(),
    }

    mysql / mariadb
    + ...
    + ssl

    mssql

    mongodb
    */

    //return this.checkDB(settings, false);
  }

  private async checkDB(db: any, basicSettings = true) {
    try {
      await createConnection(db);
      return db
    } catch(e) {
      this.error`${this.msg(basicSettings ? 'dbErr1' : 'dbErr2')}`;
      this.warning`[details] ${typeof e === 'object' && e.message ? e.message : e}\n`
      // whatToDo dbDetails again dbErr2
      let { toDo }: any = await this.prompt([{
        type: 'list', name: 'toDo', message: this.msg('whatToDo'),
        choices: this.choices('again', 'dbExtra')
      }]);
      return toDo === 'again' ? this.setDB(db) : this.setExtendedDB();
    }
  }
  private async checkSpecialServer() {
    return new Promise<specialServer>((resolve) => {
      fs.readFile('~/.my.cnf', 'utf8', (err, data) => {
        if (err) { resolve(false) }
        if (/uberspace\.de\/dokuwiki/g.test(data)) {
          resolve('U6')
        } else if (/manual\.uberspace\.de/g.test(data)) {
          resolve('U7')
        }
      })
    });
  }




  protected async askPW(): Promise<string> {
    const o: any = await inquirer.prompt({
      ...this.passwordField,
      name: 'PW',
      message: this.msg('qPw'),
      validate: async (pw: any) => {
        const o = await this.checkPW(pw);
        return !o ? this.msg('vWrongPw') : true;
      }
    });
    return o.PW
  }

  protected async checkPW(pw: string): Promise<boolean> {
    if (!pw || typeof pw !== 'string') { return Promise.reject(false) }
    const config = await this.system.read(pw);
    return new Promise<boolean>((resolve, reject) => {
      if (typeof config !== 'object' || !(config.salt) || config.statusCode !== 200) {
        reject(false)
      }
      resolve(true);
    })
  }

  protected async listCommands() {
    // emit CLI_listCommands
  }
  protected async runCommands() {

  }
}

new CLI()

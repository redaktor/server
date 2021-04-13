import * as util from 'util';
import * as path from 'path';
import { inquirerNLS } from './prompts';
import { Command } from './Command';
import bundle from './nls/';
import uuid, { nonce } from '../../uuid';
import { strength } from '../../crypto/password';
import { _, log } from '../../String/tag/log';

import { Server } from '../../PAKE/SRP';
import { Client } from '../../PAKE/SRP/Client';
interface Config {
  [k: string]: string;

}

// TODO PW more 5x wrong
// Port
// ? username
export class Setup extends Command {
  static description = 'describe the command here'

  static examples = [
    `$ redaktor setup
... TODO
`
  ];

  static args = [{name: 'file'}]

  protected inquirer: any;
  private env: string;
  private pwConfirmedCount = 0;
  private setConfig(config: Config) {
    for (let key in config) { process.env[`SRP_${key}`] = config[key] }

  }
  async run(appEnv?: string) {
    if (!!appEnv) { this.env = appEnv }
    await this.i18n(bundle);
    this.inquirer = inquirerNLS(this.messages);
    this.prompt = this.inquirer.prompt;
    const { userName } = this.settings;
    const hi = `Hi ${userName}.`;
    try {
      if (!this.hasConfig()) { throw('No credential file yet.') } // starts setup
      this.success`${hi}`;
      log`${this.msg('startServer')}`;
      this.setConfig(await this.askPW());
    } catch (e) {
      // NEW SETUP !
      this.info(_`G${hi} ${this.msg('welcome')} ${this.msg('name')}\n`[0]);
      this.setConfig(await this.setup());
    }
    return true
  }

  private async getKeys() { return util.promisify(Server.getKeys)(null) };
  private async setup(saltMin: number = 100, saltMax: number = 260): Promise<Config> {
    const { id, userName } = this.settings;
    this.success('installed', ':');

    /* PASSWORD */
    /* Should we mask passwords ? */
    const { pwType }: any = await this.prompt([{
      type: 'list', name: 'pwType', message: this.msg('pwType'),
      choices: [
        {name: this.msg('pwMask'), value: this.passwordField},
        {name: this.msg('pwShow'), value: { type: 'input' }}
      ]
    }]);
    this.passwordField = pwType;
    /* Set Owner Password */
    let pw = await this.setPassword();
    log`\n`;
    const { port }: any = await this.prompt([{
      type: 'input', name: 'port', message: this.msg('port'), default: '8080',
      validate: (port) => {
        const portInt = parseInt(port, 10);
        return (typeof portInt === 'number' && !isNaN(portInt) &&
          portInt >= 0 && portInt < 65536)
      }
    }]);
    log`\n`;
    const PEMS = await this.getKeys();
    const keys = Server.initKeys(PEMS.server);
    try {
      await this.write({
        pwType,
        settings: ''
      }, null, path.resolve(__dirname, `../settings.json`)); // TODO use pwType later
      /* Write credentials e.g. used for session secret ... */
      let servers = !!process.env.SRP_servers ? JSON.parse(process.env.SRP_servers) : {};
      servers = JSON.stringify({...servers, [port]: this.env});
      await this.write({
        type: 'SRP_CREDENTIALS',
        keys: JSON.stringify(PEMS),
        secret: Server.randomByteHex(128),
        sessionsecret: Server.randomByteHex(128),
        signature: Server.randomByteHex(64),
        salt: nonce(saltMin, saltMax),
        kid: uuid(),
        env: this.env,
        port,
        servers,
        ...(new Client()).register(id, pw, keys.public)
      }, Server.forge.pbkdf2(pw, id, 8, 32, 'sha256'));
      /* Should not happen: we could not write in our self created credDir ... */
      if (!(await this.checkPW(pw))) {
        log`${this.msg('writeHint', {userName})}`;
        throw(this.warningError('writeErr'))
      }
    } catch(e) {
      return <any>this.run();
    }

    log`${this.msg('credDir1')}`;
    log`${this.msg('credDir2')}`;
    log`${this.configName}\n`


    /* SET SERVER - port, url, document.root */
    /* USE or SET SSL */
/*
    const finalToken = await this.read(pw);
    if (const finalToken.statusCode === 200) {
      console.log('WROTE OK!');
      log`finalToken`;
      // START SERVER
    }
*/

/* <-- */
    const config = await this.askPW(pw);
    //pw = '';
    this.quitting = true;
    this.output('thanks', '_and', 'comeback');
    this.reset();
    return config
  }

  private async setPassword(): Promise<string> {
    this.pwConfirmedCount = 0;
    const pwMin = 4; //this.config.passwordMinStrength;
    const MIN = Math.max(2, Math.min(5, pwMin));
    const ERR = Math.max(2, Math.min(5, Math.round(pwMin / 2)));
    // Password rules
    log`\n\n${this.msg('pwFlow1')}`;
    // Enter PW
    this.success(this.msg('pwFlow2'));
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
          `:\n${warning}\n${Command.BULLET} ${suggestions.join(`\n${Command.BULLET} `)}`;
        return `${bar} ${score === 3 ? _`Y${message}` : _`R${message}`}`;
      },
      transformer: (s: string) => (typeof s === 'string' ? s : '')
    }]);
    pw = pw.zxcvbn.password;


    // Confirm PW - if > 2 times wrong --> resume choice
    let { pwConfirmed }: any = await this.prompt([{
      ...this.passwordField, name: 'pwConfirmed', message: `${pwBar}\n\n${this.msg('pwConfirm')}`,
      filter: strength,
      validate: (strength: any): boolean|string|Promise<string> => {
        this.pwConfirmedCount++;
        return strength.zxcvbn.password === pw || this.pwConfirmedCount === 3 ? true :
          this.msg('pwCErr');
      },
      transformer: (s: string) => (typeof s === 'string' ? s : '')
    }]);

    if (pwConfirmed.zxcvbn.password !== pw) {
      this.warning(' --> restart');
      console.log(' ');
      return this.setPassword()
    }
    //return this.pwConfirmedCount < 3 ? this.msg('pwCErr') : ;
    if (!!this.quitting) { throw new Error('quitting') }
    return pw
  }
  protected async validatePW(pw?: string): Promise<boolean> {
    const config = await this.checkPW(pw);
    if (!config) { log`this.msg('vWrongPw')` }
    return !!config
  }
  protected async askPW(pw?: string): Promise<Config> {
    let config: Config = !!pw ? await this.checkPW(pw) : {};
    if (!!pw) { return config }
    await this.inquirer.prompt({
      ...this.passwordField,
      name: 'PW',
      message: this.msg('qPw'),
      validate: async (pw: any) => {
        config = await this.checkPW(pw);
        return !config ? this.msg('vWrongPw') : true;
      }
    });
    return config
  }

  protected async checkPW(pw: string): Promise<Config> {
    if (!pw || typeof pw !== 'string') { return Promise.reject(false) }
    const config = await this.read(Server.forge.pbkdf2(pw, this.settings.id, 8, 32, 'sha256'));
    return new Promise<Config>((resolve, reject) => {
      if (typeof config !== 'object' || !(config.salt) || config.statusCode !== 200) {
        reject(false)
      }
      resolve(config);
    })
  }

  /* TODO FIXME !!!

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

  */
}

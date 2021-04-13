import * as inquirer from 'inquirer';
import { createConnection } from "typeorm";
import { Command, flags } from '../Command';
import { BULLET } from '../shared/constants';
import getDBprompts from '../shared/db.install';
import bundle from '../../nls/CLI';
import uuid, { nonce } from '../../framework/uuid';
import { strength } from '../../framework/crypto/password';
import { _, log } from '../../framework/String/tag/log';

type specialServer = false | 'localhost' | 'U6' | 'U7';

/* TODO split and seed ../nls/CLI to commands and
link the docs for DB in nls ...
*/
export default class Setup extends Command {
  static description = 'describe the command here'

  static examples = [
    `$ redaktor setup
... TODO
`,
  ]

  static flags = {
    help: flags.help({char: 'h'}),
    // flag with a value (-n, --name=VALUE)
    name: flags.string({char: 'n', description: 'name to print'}),
    // flag with no value (-f, --force)
    force: flags.boolean({char: 'f'}),
  }

  static args = [{name: 'file'}]

  private pwConfirmedCount = 0;
  async run() {
    const { args, flags } = this.parse(Setup);
    await this.i18n(bundle);
    
    const hi = `Hi ${this.redaktor.userName}.`;
    try {
      if (!this.hasConfig()) {
        throw('No credential file yet.')
        // starts setup
      }
      this.success`${hi}`;

      /*
      if (!!(process.env.PW) && this.checkPW(process.env.PW||'')) {
        // check password ENV var
        this.startServer(process.env.PW);
      } else {
        // check password input
        this.startServer();
      }
      */
    } catch (e) {
      // NEW SETUP !
      this.info(_`G${hi} ${this.msg('welcome')} ${this.msg('name')}\n`[0]);
      await this.setup();
    }

    /* TODO FLAGS / ARGS for setup
    const name = flags.name || 'world';
    this.log(`BYE ${name}`, this.config);

    if (args.file && flags.force) {
      this.log(`you input --force and --file: ${args.file}`)
    }
    */


  }

  private async setup(saltMin: number = 100, saltMax: number = 260){
    const { userName } = this.redaktor;
    this.success('installed', ':');
    log`${this.msg('credDir')}\n`;

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
    /* Write credentials e.g. used for session secret ... */
    this.write({secret: nonce(64, 128), salt: nonce(saltMin, saltMax), kid: uuid()}, pw);
    /* Should not happen: we could not write in our self created credDir ... */
    if (!this.checkPW(pw)) {
      this.warningError('writeErr');
      log`${this.msg('writeHint', {userName})}`;
      return this.setPassword();
    }

    /* Set Database */
    const db = await this.setDB();
    let token = await this.read(pw);
    await this.write({...token, db}, pw);

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
    pw = '';
    this.quitting = true;
    this.output('thanks', '_and', 'comeback');
    this.reset();
    return this.exit()
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
          `:\n${warning}\n${BULLET} ${suggestions.join(`\n${BULLET} `)}`;
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
      this.log(' ');
      return this.setPassword()
    }
    //return this.pwConfirmedCount < 3 ? this.msg('pwCErr') : ;
    if (!!this.quitting) { throw new Error('quitting') }
    return pw
  }

  private async setDB(preferences?: any): Promise<any> {

    const dbPrompts = getDBprompts(this.redaktor, preferences);
    !preferences && this.success`${this.msg('prima')}!\n\n`;
    !preferences && this.log(this.msg('dbFlow1'));
    this.warning('dbFlow2','\n'); // see also docs
    let { type }: any = await this.prompt([{
      type: 'list', name: 'type', message: this.msg('dbType'),
      choices: Object.keys(dbPrompts).map((k: string) => ({name: k}))
    }]);
    // TODO
    // MongoDB package has not been found installed. Try to install it: npm install mongodb --save
    // or install according
    const settings: any = await this.prompt(dbPrompts[type].map((o) => {
      if (typeof o.message === 'string') { o.message = this.msg(o.message) }
      return o
    }));
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
      this.success`${this.msg('prima')}!\n`;
      return db
    } catch(e) {
      this.warningError`${this.msg(basicSettings ? 'dbErr1' : 'dbErr2')}`;
      this.warning`[details] ${typeof e === 'object' && e.message ? e.message : e}\n`
      // whatToDo dbDetails again dbErr2
      let { toDo }: any = await this.prompt([{
        type: 'list', name: 'toDo', message: this.msg('whatToDo'),
        choices: this.choices('again', 'dbExtra')
      }]);
      return toDo === 'again' ? this.setDB(db) : this.setExtendedDB();
    }
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
    const config = await this.read(pw);
    return new Promise<boolean>((resolve, reject) => {
      if (typeof config !== 'object' || !(config.salt) || config.statusCode !== 200) {
        reject(false)
      }
      resolve(true);
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

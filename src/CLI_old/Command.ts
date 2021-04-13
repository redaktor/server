// IMPORT
import * as inquirer from 'inquirer';
import i18n from '@dojo/framework/i18n/main';
import { Bundle, Messages } from '@dojo/framework/i18n/main';
import { onlyNODE, BULLET } from './shared/System';
import { _, log, reset, message, success, warning, error, list, input, output,
info, neutral, muted } from '../framework/String/tag/log';

export * from '../framework/String/tag/log';
export type Question = inquirer.Question;
export type LogFn = (strings: string|TemplateStringsArray, ...values: any[]) => string;
export default class Command {
  protected prompt = inquirer.prompt;
  protected messages: Messages = {};
  protected quitting = false;
  protected passwordField = { type: 'password', mask: BULLET };

  constructor() {
    onlyNODE();
  }
  protected exit() {
    process.exit();
    return true
  }
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
  protected log: LogFn = (s, ...values) => this.logFn(log, s, ...values);
  protected message: LogFn = (s, ...values) => this.logFn(message, s, ...values);
  protected success: LogFn = (s, ...values) => this.logFn(success, s, ...values);
  protected warning: LogFn = (s, ...values) => this.logFn(warning, s, ...values);
  protected error: LogFn = (s, ...values) => this.logFn(error, s, ...values);
  protected list: LogFn = (s, ...values) => this.logFn(list, s, ...values);
  protected input: LogFn = (s, ...values) => this.logFn(input, s, ...values);
  protected output: LogFn = (s, ...values) => this.logFn(output, s, ...values);
  protected neutral: LogFn = (s, ...values) => this.logFn(neutral, s, ...values);
  protected muted: LogFn = (s, ...values) => this.logFn(muted, s, ...values);
  protected info: Function = info;
}

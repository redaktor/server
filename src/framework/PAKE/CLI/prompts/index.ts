import * as _inquirer from 'inquirer';
import { ListPrompt } from './list';
type InquirerNLS = typeof _inquirer & {bundle?: any};
_inquirer.registerPrompt('list', <any>ListPrompt);
export function inquirerNLS(bundle: any) {
  Object.defineProperty(_inquirer, 'bundle', {
    enumerable: false,
    configurable: false,
    writable: false,
    value: bundle
  });
  return _inquirer
}
export const inquirer: InquirerNLS = _inquirer;

import Chain from './base';
import { TYPE_KEY } from '../constants';
export default class Empty extends Chain<any> {
  [TYPE_KEY] = {enum: ['', null]};
  optional = true
}
export class Optional extends Chain<any> {
  [TYPE_KEY] = {};
  optional = true
}

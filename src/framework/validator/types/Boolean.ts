import Chain from './base';
import { TYPE_KEY } from '../constants';
class Boolean extends Chain<Boolean> {
  [TYPE_KEY] = {type: 'boolean'}
}
export default new Boolean();

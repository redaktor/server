import Chain from './base';
import { TYPE_KEY } from '../constants';
declare class Boolean extends Chain<Boolean> {
    [TYPE_KEY]: {
        type: string;
    };
}
declare const _default: Boolean;
export default _default;

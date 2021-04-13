import Chain from './base';
import { TYPE_KEY } from '../constants';
export default class Empty extends Chain<any> {
    [TYPE_KEY]: {
        enum: string[];
    };
    optional: boolean;
}
export declare class Optional extends Chain<any> {
    [TYPE_KEY]: {};
    optional: boolean;
}

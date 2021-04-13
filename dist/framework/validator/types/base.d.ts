import { TYPE_KEY, MAIN_KEY, VALUE_KEY } from '../constants';
export default class Chain<Type> {
    [TYPE_KEY]: {
        type: string;
    };
    [MAIN_KEY]: boolean;
    [VALUE_KEY]: any[];
    type: Type;
    get isMain(): boolean;
    get value(): any[];
    protected or<T, K extends T>(next: T | K): T | K;
    protected _(schema: any): this;
    protected T(o: {}): this;
}

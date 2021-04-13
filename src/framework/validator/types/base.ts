import { TYPE_KEY, MAIN_KEY, VALUE_KEY } from '../constants';
export default class Chain<Type> {
  [TYPE_KEY] = {type: 'object'};
  [MAIN_KEY] = true;
  [VALUE_KEY]: any[] = [];
  type: Type;

  get isMain() {
    const v = this[MAIN_KEY];
    this[MAIN_KEY] = true;
    return v
  }
  get value() {
    const v = this[VALUE_KEY];
    this[VALUE_KEY] = [];
    return v
  }

  protected or<T, K extends T>(next: T|K): T|K  {
    return <any>this
  }

  protected _(schema: any) {
    this[MAIN_KEY] = false;
    this[VALUE_KEY].push(schema);
    return this
  }

  protected T(o: {}) { return this._({ ...this[TYPE_KEY], ...o }) }
}

import A from './Array';
import B from './Boolean';
import N from './Number';
import O from './Object';
import S from './String';
import Empty, { Optional } from './Empty';

export const PRIMITIVES: any = {
  array: A, boolean: B, number: N, object: O, string: S,
  Array: A, Boolean: B, Number: N, Object: O, String: S
};
export const UNSPECIFIEDS = {
  empty: new Empty(),
  optional: new Optional()
}

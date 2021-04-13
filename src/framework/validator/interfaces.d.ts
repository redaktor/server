import { PRIMITIVES, UNSPECIFIEDS } from './types';
type S = typeof PRIMITIVES.String;
type N = typeof PRIMITIVES.Number;
type A = typeof PRIMITIVES.Array;
type OPTIONAL = typeof UNSPECIFIEDS.optional;
type EMPTY = typeof UNSPECIFIEDS.empty;

export type CL = {[key: string]: any, constructor: Function};
export type CONST = {[key: string]: any, const: any};
export type ENUM = {[key: string]: any, enum: any[]};
export type Without<T, U> = { [P in Exclude<keyof T, keyof U>]?: never };
export type XOR<T, U> = (T | U) extends object ? (Without<T, U> & U) | (Without<U, T> & T) : T | U;
export type Exclusive = (XOR<S, N>[] & XOR<S, A>[]) | (XOR<A, N>[] & XOR<A, S>[]) |
  (XOR<N, A>[] & XOR<N, S>[]);
export type ValidatorDecoName = 'anyOf' | 'allOf' | 'oneOf' | 'not';
export type Validator = S | N | A | EMPTY | CONST | ENUM | CL// | keyof SFormat;
export type Validators = Validator[];
export type ExclusiveValidators = Exclusive | CONST[] | ENUM[] | CL[];

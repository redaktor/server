import { Strategy } from './interfaces';
export default class QueuingStrategy<T> implements Strategy<T> {
    highWaterMark: number;
    constructor(kwArgs: KwArgs);
}
export interface KwArgs {
    highWaterMark: number;
}

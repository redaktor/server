import QueuingStrategy from './QueuingStrategy';
export default class ByteLengthQueuingStrategy<T> extends QueuingStrategy<T> {
    size(chunk?: T | null): number;
}

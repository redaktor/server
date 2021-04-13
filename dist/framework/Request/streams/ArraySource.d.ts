import { Source } from './ReadableStream';
import ReadableStreamController from './ReadableStreamController';
export default class ArraySource<T> implements Source<T> {
    currentPosition: number;
    data: Array<T>;
    constructor(data: Array<T>);
    seek(controller: ReadableStreamController<T>, position: number): Promise<number>;
    start(controller: ReadableStreamController<T>): Promise<void>;
    pull(controller: ReadableStreamController<T>): Promise<void>;
    cancel(reason?: any): Promise<void>;
}

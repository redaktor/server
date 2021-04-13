import { Strategy } from './interfaces';
import ReadableStream from './ReadableStream';
import WritableStream from './WritableStream';
export interface Transform<R, W> {
    transform(chunk: W | undefined, enqueueInReadable: (chunk: R) => void, transformDone: () => void): void;
    flush(enqueue: Function, close: Function): void;
    readableStrategy: Strategy<R>;
    writableStrategy: Strategy<W>;
}
export default class TransformStream<R, W> {
    readonly readable: ReadableStream<R>;
    readonly writable: WritableStream<W>;
    constructor(transformer: Transform<R, W>);
}

import { Strategy } from './interfaces';
import ReadableStream, { Source } from './ReadableStream';
import SeekableStreamReader from './SeekableStreamReader';
export default class SeekableStream<T> extends ReadableStream<T> {
    preventClose: boolean;
    reader: SeekableStreamReader<T>;
    constructor(underlyingSource: Source<T>, strategy?: Strategy<T>, preventClose?: boolean);
    getReader(): SeekableStreamReader<T>;
    requestClose(): void;
    seek(position: number): Promise<number>;
    get strategy(): Strategy<T>;
}

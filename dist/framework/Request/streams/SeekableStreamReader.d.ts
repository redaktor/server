import ReadableStreamReader, { ReadResult } from './ReadableStreamReader';
import SeekableStream from './SeekableStream';
export default class SeekableStreamReader<T> extends ReadableStreamReader<T> {
    protected _currentPosition: number;
    protected _ownerReadableStream: SeekableStream<T>;
    get currentPosition(): number;
    read(): Promise<ReadResult<T>>;
    seek(position: number): Promise<number>;
}

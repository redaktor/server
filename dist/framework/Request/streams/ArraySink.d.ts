import { Sink } from './WritableStream';
export default class ArraySink<T> implements Sink<T> {
    chunks: T[];
    abort(reason: any): Promise<void>;
    close(): Promise<void>;
    start(error: (error: Error) => void): Promise<void>;
    write(chunk: T): Promise<void>;
}

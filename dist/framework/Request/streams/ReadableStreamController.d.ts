import ReadableStream from './ReadableStream';
export declare function isReadableStreamController(x: any): boolean;
export default class ReadableStreamController<T> {
    private readonly _controlledReadableStream;
    get desiredSize(): number;
    constructor(stream: ReadableStream<T>);
    close(): void;
    enqueue(chunk: T): void;
    error(error: Error): void;
}

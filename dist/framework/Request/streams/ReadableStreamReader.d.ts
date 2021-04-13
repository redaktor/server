import ReadableStream, { State } from './ReadableStream';
export interface ReadResult<T> {
    value: T | undefined;
    done: boolean;
}
export default class ReadableStreamReader<T> {
    get closed(): Promise<void>;
    private _closedPromise;
    private _storedError;
    private _readRequests;
    private _resolveClosedPromise;
    private _rejectClosedPromise;
    protected _ownerReadableStream: ReadableStream<T> | undefined;
    state: State;
    constructor(stream: ReadableStream<T>);
    cancel(reason: string): Promise<void>;
    read(): Promise<ReadResult<T>>;
    releaseLock(): void;
    release(): void;
    resolveReadRequest(chunk: T): boolean;
}

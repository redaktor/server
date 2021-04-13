import { Strategy } from './interfaces';
import ReadableStreamController from './ReadableStreamController';
import ReadableStreamReader from './ReadableStreamReader';
import SizeQueue from './SizeQueue';
import TransformStream from './TransformStream';
import WritableStream from './WritableStream';
export interface PipeOptions {
    preventAbort?: boolean;
    preventCancel?: boolean;
    preventClose?: boolean;
}
export interface Source<T> {
    start?(controller: ReadableStreamController<T>): Promise<void>;
    pull?(controller: ReadableStreamController<T>): Promise<void>;
    seek?(controller: ReadableStreamController<T>, position: number): Promise<number>;
    cancel?(reason?: any): Promise<void>;
}
export declare enum State {
    Readable = 0,
    Closed = 1,
    Errored = 2
}
export default class ReadableStream<T> {
    protected get _allowPull(): boolean;
    get desiredSize(): number;
    get hasSource(): boolean;
    get locked(): boolean;
    get readable(): boolean;
    get started(): Promise<void>;
    get queueSize(): number;
    protected _pullingPromise: Promise<void> | undefined;
    protected _started: boolean;
    protected readonly _startedPromise: Promise<void>;
    protected readonly _strategy: Strategy<T>;
    protected _underlyingSource: Source<T>;
    closeRequested: boolean;
    controller: ReadableStreamController<T>;
    pullScheduled: boolean;
    readonly queue: SizeQueue<T>;
    reader: ReadableStreamReader<T> | undefined;
    state: State;
    storedError: Error;
    constructor(underlyingSource: Source<T>, strategy?: Strategy<T>);
    protected _cancel(reason?: any): Promise<void>;
    protected _shouldApplyBackPressure(): boolean;
    cancel(reason?: any): Promise<void>;
    close(): void;
    enqueue(chunk: T): void;
    error(error: Error): void;
    getReader(): ReadableStreamReader<T>;
    pipeThrough(transformStream: TransformStream<T, any>, options?: PipeOptions): ReadableStream<T>;
    pipeTo(dest: WritableStream<T>, options?: PipeOptions): Promise<void>;
    pull(): void;
    requestClose(): void;
    tee(): [ReadableStream<T>, ReadableStream<T>];
}

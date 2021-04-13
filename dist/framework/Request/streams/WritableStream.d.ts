import { Strategy } from './interfaces';
import SizeQueue from './SizeQueue';
export interface Record<T> {
    readonly close?: boolean;
    readonly chunk?: T;
    readonly reject?: (error: Error) => void;
    readonly resolve?: () => void;
}
export declare enum State {
    Closed = 0,
    Closing = 1,
    Errored = 2,
    Waiting = 3,
    Writable = 4
}
export interface Sink<T> {
    abort?(reason?: any): Promise<void>;
    close?(): Promise<void>;
    start?(error: (error: Error) => void): Promise<void>;
    write?(chunk: T): Promise<void>;
}
export default class WritableStream<T> {
    get closed(): Promise<void>;
    get ready(): Promise<void>;
    get state(): State;
    protected _advancing: boolean;
    protected _closedPromise: Promise<void>;
    protected _readyPromise: Promise<void>;
    protected _rejectClosedPromise: (error: Error) => void;
    protected _rejectReadyPromise: (error: Error) => void;
    protected _resolveClosedPromise: () => void;
    protected _resolveReadyPromise: () => void;
    protected _started: boolean;
    protected _startedPromise: Promise<any> | undefined;
    protected _state: State;
    protected _storedError: Error;
    protected readonly _strategy: Strategy<T>;
    protected _underlyingSink: Sink<T> | undefined;
    protected readonly _queue: SizeQueue<Record<T>>;
    protected _writing: boolean;
    constructor(underlyingSink?: Sink<T>, strategy?: Strategy<T>);
    protected _advanceQueue(): void;
    protected _close(): void;
    protected _error(error: Error): void;
    protected _syncStateWithQueue(): void;
    abort(reason: any): Promise<void>;
    close(): Promise<void>;
    write(chunk: T): Promise<void>;
}

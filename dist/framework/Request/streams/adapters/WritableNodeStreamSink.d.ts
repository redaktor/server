/// <reference types="node" />
import { Sink } from '../WritableStream';
export declare type NodeSourceType = Buffer | string;
export default class WritableNodeStreamSink implements Sink<NodeSourceType> {
    protected _encoding: string;
    protected _isClosed: boolean;
    protected _nodeStream: NodeJS.WritableStream;
    protected _onError: (error: Error) => void;
    protected _rejectWritePromise: Function | undefined;
    constructor(nodeStream: NodeJS.WritableStream, encoding?: string);
    protected _handleError(error: Error): void;
    protected _removeListeners(): void;
    abort(reason: any): Promise<void>;
    close(): Promise<void>;
    start(): Promise<void>;
    write(chunk: string): Promise<void>;
}

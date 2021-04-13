/// <reference types="node" />
import { Source } from '../ReadableStream';
import ReadableStreamController from '../ReadableStreamController';
import { Readable } from 'stream';
export declare type NodeSourceType = Buffer | string;
export default class ReadableNodeStreamSource implements Source<NodeSourceType> {
    protected _controller: ReadableStreamController<NodeSourceType>;
    protected _isClosed: boolean;
    protected _onClose: () => void;
    protected _onError: (error: Error) => void;
    protected _nodeStream: Readable;
    protected _shouldResume: boolean;
    constructor(nodeStream: Readable);
    protected _close(): void;
    protected _handleClose(): void;
    protected _handleError(error: Error): void;
    protected _removeListeners(): void;
    cancel(reason?: any): Promise<void>;
    pull(controller: ReadableStreamController<NodeSourceType>): Promise<void>;
    start(controller: ReadableStreamController<NodeSourceType>): Promise<void>;
}

import Promise from '@dojo/framework/shim/Promise';
import { Strategy } from './interfaces';
import ReadableStreamController from './ReadableStreamController';
import ReadableStreamReader from './ReadableStreamReader';
import SizeQueue from './SizeQueue';
import TransformStream from './TransformStream';
import * as util from './util';
import WritableStream, { State as WriteableState } from './WritableStream';

/**
 * Options used when piping a readable stream to a writable stream.
 */
export interface PipeOptions {
	/**
	 * Prevents the writable stream from erroring if the readable stream encounters an error.
	 */
	preventAbort?: boolean;

	/**
	 *  Prevents the readable stream from erroring if the writable stream encounters an error.
	 */
	preventCancel?: boolean;

	/**
	 * Prevents the writable stream from closing when the pipe operation completes.
	 */
	preventClose?: boolean;
}

/**
 * The Source interface defines the methods a module can implement to create a source for a {@link ReadableStream}.
 *
 * The Stream API provides a consistent stream API while {@link ReadableStream.Source} and {@link WritableStream.Sink}
 * implementations provide the logic to connect a stream to specific data sources & sinks.
 */
export interface Source<T> {

	/**
	 * Tells the source to prepare for providing chunks to the stream.  While the source may enqueue chunks at this
	 * point, it is not required.
	 *
	 * @param controller The source can use the controller to enqueue chunks, close the stream or report an error.
	 * @returns A promise that resolves when the source's start operation has finished.  If the promise rejects,
	 * 		the stream will be errored.
	 */
	start?(controller: ReadableStreamController<T>): Promise<void>;

	/**
	 * Requests that source enqueue chunks.  Use the controller to close the stream when no more chunks can
	 * be provided.
	 *
	 * @param controller The source can use the controller to enqueue chunks, close the stream or report an error.
	 * @returns A promise that resolves when the source's pull operation has finished.  If the promise rejects,
	 * 		the stream will be errored.
	 */
	pull?(controller: ReadableStreamController<T>): Promise<void>;

	/**
	 * Optional method implemented by seekable sources to set the seek position. Use the controller to report an error.
	 * @param controller The source can use the controller to report an error.
	 * @param position The position in the stream to seek to.
	 * @returns A promise that resolves to the new seek position when the source's seek operation has finished.  If the
	 *  	promise rejects, the stream will be errored.
	 */
	seek?(controller: ReadableStreamController<T>, position: number): Promise<number>;

	/**
	 * Indicates the stream is prematurely closing and allows the source to do any necessary clean up.
	 *
	 * @param reason The reason why the stream is closing.
	 * @returns A promise that resolves when the source's pull operation has finished.  If the promise rejects,
	 * 		the stream will be errored.
	 */
	cancel?(reason?: any): Promise<void>;
}

/**
 * `ReadableStream`'s possible states
 */
export enum State { Readable, Closed, Errored }

/**
 * Implementation of a readable stream.
 */
export default class ReadableStream<T> {

	// ShouldReadableStreamPull
	protected get _allowPull(): boolean {
		return !this.pullScheduled &&
			!this.closeRequested &&
			this._started &&
			this.state !== State.Closed &&
			this.state !== State.Errored &&
			!this._shouldApplyBackPressure();
	}

	/**
	 * Returns a number indicating how much additional data can be pushed by the source to the stream's queue before it
	 * exceeds its `highWaterMark`. An underlying source should use this information to determine when and how to apply
	 * backpressure.
	 *
	 * @returns The stream's strategy's `highWaterMark` value minus the queue size
	 */
	// 3.5.7. GetReadableStreamDesiredSize ( stream )
	get desiredSize(): number {
		return this._strategy.highWaterMark! - this.queueSize;
	}

	get hasSource(): boolean {
		return this._underlyingSource != null;
	}

	/**
	 * A stream can only have one reader at a time. This value indicates if a stream already has a reader, and hence
	 * cannot be read from other than by that reader. When a consumer is done with a reader they can dissociate it
	 * by calling {@link ReadableStreamReader#releaseLock}.
	 *
	 * @returns True if the stream has a reader associated with it
	 */
	// IsReadableStreamLocked
	get locked(): boolean {
		return this.hasSource && !!this.reader;
	}

	get readable(): boolean {
		return this.hasSource && this.state === State.Readable;
	}

	/**
	 * This promise will resolve when the stream's underlying source has started and is ready to provide data. If
	 * the {@link ReadableStreamReader#read} method is called before the stream has started it will not do anything.
	 * Wait for this promise to resolve to ensure that your `read` calls are responded to as promptly as possible.
	 *
	 * @returns A promise that resolves when the stream is ready to be read from.
	 */
	get started(): Promise<void> {
		return this._startedPromise;
	}

	get queueSize(): number {
		return this.queue.totalSize;
	}

	protected _pullingPromise: Promise<void> | undefined;
	protected _started: boolean;
	protected readonly _startedPromise: Promise<void>;
	protected readonly _strategy: Strategy<T>;
	protected _underlyingSource: Source<T>;

	closeRequested = false;
	controller: ReadableStreamController<T>;
	pullScheduled: boolean;
	readonly queue: SizeQueue<T>;
	reader: ReadableStreamReader<T> | undefined;
	state: State;
	storedError: Error;

	/**
	 * A `ReadableStream` requires an underlying source to supply data. The source interacts with the stream through
	 * a {@link ReadableStreamController} that is associated with the stream, and provided to the source.
	 *
	 * @constructor
	 * @param underlyingSource The source object that supplies data to the stream by interacting with its controller.
	 * @param strategy The strategy for this stream.
	 */
	constructor(underlyingSource: Source<T>, strategy: Strategy<T> = {}) {
		if (!underlyingSource) {
			throw new Error('An ReadableStream Source must be provided.');
		}
		this.state = State.Readable;
		this._underlyingSource = underlyingSource;
		this.controller = new ReadableStreamController(this);
		this._strategy = util.normalizeStrategy(strategy);
		this.queue = new SizeQueue<T>();
		this._startedPromise = new Promise<void>((resolveStarted) => {
			const startResult = util.promiseInvokeOrNoop(this._underlyingSource, 'start', [ this.controller ]);
			startResult.then(() => {
				this._started = true;
				resolveStarted();
				this.pull();
			}, (error: Error) => {
				this.error(error);
			});
		});
	}

	protected _cancel(reason?: any): Promise<void> {
		// 3.2.4.1-3: return cancelReadableStream(this, reason);
		if (this.state === State.Closed) {
			return Promise.resolve();
		}

		if (this.state === State.Errored) {
			return Promise.reject(new TypeError('3.5.3-2: State is errored'));
		}

		this.queue.empty();
		this.close();
		return util.promiseInvokeOrNoop(this._underlyingSource, 'cancel', [ reason ]).then(function () {});
	}

	// shouldReadableStreamApplyBackPressure
	protected _shouldApplyBackPressure(): boolean {
		const queueSize = this.queue.totalSize;

		return queueSize > this._strategy.highWaterMark!;
	}

	/**
	 *
	 * @param reason A description of the reason the stream is being canceled.
	 * @returns A promise that resolves when the stream has closed and the call to the underlying source's `cancel`
	 * method has completed.
	 */
	cancel(reason?: any): Promise<void> {
		if (!this.hasSource) {
			return Promise.reject(new TypeError('3.2.4.1-1: Must be a ReadableStream'));
		}

		return this._cancel(reason);
	}

	/**
	 * Closes the stream without regard to the status of the queue.  Use {@link requestClose} to close the
	 * stream and allow the queue to flush.
	 *
	 */
	// 3.5.4. FinishClosingReadableStream ( stream )
	close(): void {
		if (this.state !== State.Readable) {
			return;
		}

		this.state = State.Closed;

		if (this.locked && this.reader) {
			this.reader.release();
		}
	}

	// EnqueueInReadableStream
	enqueue(chunk: T): void {
		const size = this._strategy.size;

		if (!this.readable || this.closeRequested) {
			throw new Error('3.5.6-1,2: Stream._state should be Readable and stream.closeRequested should be true');
		}

		if (!this.locked || (this.reader && !this.reader.resolveReadRequest(chunk))) {

			try {
				let chunkSize = 1;
				if (size) {
					chunkSize = size(chunk);
				}
				this.queue.enqueue(chunk, chunkSize);
			}
			catch (error) {
				this.error(error);
				throw error;
			}
		}

		this.pull();
	}

	error(error: Error): void {
		if (this.state === State.Errored) {
			return;
		}
		else if (this.state !== State.Readable) {
			throw new Error('3.5.7-1: State must be Readable');
		}

		this.queue.empty();
		this.storedError = error;
		this.state = State.Errored;

		if (this.locked && this.reader) {
			this.reader.release();
		}
	}

	/**
	 * create a new {@link ReadableStreamReader} and lock the stream to the new reader
	 */
	// AcquireReadableStreamReader
	getReader(): ReadableStreamReader<T> {
		if (!this.readable) {
			throw new TypeError('3.2.4.2-1: must be a ReadableStream instance');
		}

		return new ReadableStreamReader(this);
	}

	pipeThrough(transformStream: TransformStream<T, any>, options?: PipeOptions): ReadableStream<T> {
		this.pipeTo(transformStream.writable, options);
		return transformStream.readable;
	}

	pipeTo(dest: WritableStream<T>, options: PipeOptions = {}): Promise<void> {
		let resolvePipeToPromise: () => void;
		let rejectPipeToPromise: (error: Error) => void;
		let closedPurposefully = false;
		let lastRead: any;
		let reader: ReadableStreamReader<T>;

		function doPipe(): void {
			lastRead = reader.read();
			Promise.all([ lastRead, dest.ready ]).then(function (result) {
				const readResult = result ?  result[0] : null;
				if (readResult.done) {
					closeDest();
				}
				else if (dest.state === WriteableState.Writable ) {
					dest.write(readResult.value).then(
						() => {
							doPipe();
						},
						() => {
						}
					);

				}
			}, () => {
			});
		}

		function cancelSource(reason: any): void {
			if (!options.preventCancel) {
				reader.cancel(reason).catch(() => {});
				rejectPipeToPromise(reason);
			}
			else {
				lastRead.then(function () {
					reader.releaseLock();
					rejectPipeToPromise(reason);
				});
			}
		}

		function closeDest(): void {
			const destState = dest.state;
			if (!options.preventClose &&
				(destState === WriteableState.Waiting || destState === WriteableState.Writable)) {

				closedPurposefully = true;
				dest.close().then(resolvePipeToPromise, rejectPipeToPromise);
			}
			else {
				resolvePipeToPromise();
			}
		}

		return new Promise<void>((resolve, reject) => {
			resolvePipeToPromise = resolve;
			rejectPipeToPromise = reject;

			reader = this.getReader();
			reader.closed.catch((reason: any) => {
				// abortDest
				if (!options.preventAbort) {
					dest.abort(reason);
				}
				rejectPipeToPromise(reason);
			});

			dest.closed.then(
				function () {
					if (!closedPurposefully) {
						cancelSource(new TypeError('destination is closing or closed and cannot be piped to anymore'));
					}
				},
				cancelSource
			);
			doPipe();
		});
	}

	// RequestReadableStreamPull
	pull(): void {
		if (!this._allowPull) {
			return;
		}

		if (this._pullingPromise) {
			this.pullScheduled = true;
			this._pullingPromise.then(() => {
				this.pullScheduled = false;
				this.pull();
			});

			return;
		}

		this._pullingPromise = util.promiseInvokeOrNoop(this._underlyingSource, 'pull', [ this.controller ]);
		this._pullingPromise.then(() => {
			this._pullingPromise = undefined;
		}, (error: Error) => {
			this.error(error);
		});
	}

	/**
	 * Requests the stream be closed.  This method allows the queue to be emptied before the stream closes.
	 *
	 */
	// 3.5.3. CloseReadableStream ( stream )
	requestClose(): void {
		if (this.closeRequested || this.state !== State.Readable) {
			return;
		}

		this.closeRequested = true;

		if (this.queue.length === 0) {
			this.close();
		}
	}

	/**
	 * Tee a readable stream, returning a two-element array containing
	 * the two resulting ReadableStream instances
	 */
	// TeeReadableStream
	tee(): [ ReadableStream<T>, ReadableStream<T> ] {
		if (!this.readable) {
			throw new TypeError('3.2.4.5-1: must be a ReadableSream');
		}

		let branch1: ReadableStream<T>;
		let branch2: ReadableStream<T>;

		const reader = this.getReader();
		const teeState: any = {
			closedOrErrored: false,
			canceled1: false,
			canceled2: false,
			reason1: undefined,
			reason2: undefined
		};
		teeState.promise = new Promise(function (resolve) {
			teeState._resolve = resolve;
		});

		const createCancelFunction = (branch: number) => {
			return (reason?: any): Promise<void> => {
				teeState['canceled' + branch] = true;
				teeState['reason' + branch] = reason;
				if (teeState['canceled' + (branch === 1 ? 2 : 1)]) {
					const cancelResult = this._cancel([teeState.reason1, teeState.reason2]);
					teeState._resolve(cancelResult);
				}
				return teeState.promise;
			};
		};

		const pull = function (controller: ReadableStreamController<T>) {
			return reader.read().then(function (result: any) {
				const value = result.value;
				const done = result.done;

				if (done && !teeState.closedOrErrored) {
					branch1.requestClose();
					branch2.requestClose();

					teeState.closedOrErrored = true;
				}

				if (teeState.closedOrErrored) {
					return;
				}

				if (!teeState.canceled1) {
					branch1.enqueue(value);
				}

				if (!teeState.canceled2) {
					branch2.enqueue(value);
				}
			});
		};

		const cancel1 = createCancelFunction(1);
		const cancel2 = createCancelFunction(2);
		const underlyingSource1: Source<T> = <Source<T>> {
			pull: pull,
			cancel: cancel1
		};
		branch1 = new ReadableStream(underlyingSource1);

		const underlyingSource2: Source<T> = <Source<T>> {
			pull: pull,
			cancel: cancel2
		};
		branch2 = new ReadableStream(underlyingSource2);

		reader.closed.catch(function (r: any) {
			if (teeState.closedOrErrored) {
				return;
			}

			branch1.error(r);
			branch2.error(r);
			teeState.closedOrErrored = true;
		});

		return [ branch1, branch2 ];
	}
}

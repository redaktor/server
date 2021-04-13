"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const Promise_1 = require("@dojo/framework/shim/Promise");
const SizeQueue_1 = require("./SizeQueue");
const util = require("./util");
var State;
(function (State) {
    State[State["Closed"] = 0] = "Closed";
    State[State["Closing"] = 1] = "Closing";
    State[State["Errored"] = 2] = "Errored";
    State[State["Waiting"] = 3] = "Waiting";
    State[State["Writable"] = 4] = "Writable";
})(State = exports.State || (exports.State = {}));
function isWritableStream(x) {
    return Object.prototype.hasOwnProperty.call(x, '_underlyingSink');
}
class WritableStream {
    constructor(underlyingSink = {}, strategy = {}) {
        this._underlyingSink = underlyingSink;
        this._closedPromise = new Promise_1.default((resolve, reject) => {
            this._resolveClosedPromise = resolve;
            this._rejectClosedPromise = reject;
        });
        this._closedPromise.catch(() => { });
        this._advancing = false;
        this._readyPromise = Promise_1.default.resolve();
        this._queue = new SizeQueue_1.default();
        this._state = State.Writable;
        this._started = false;
        this._writing = false;
        this._strategy = util.normalizeStrategy(strategy);
        this._syncStateWithQueue();
        this._startedPromise = Promise_1.default.resolve(util.invokeOrNoop(this._underlyingSink, 'start', [this._error.bind(this)])).then(() => {
            this._started = true;
            this._startedPromise = undefined;
        }, (error) => {
            this._error(error);
        });
    }
    get closed() {
        return this._closedPromise;
    }
    get ready() {
        return this._readyPromise;
    }
    get state() {
        return this._state;
    }
    _advanceQueue() {
        if (!this._started) {
            if (!this._advancing && this._startedPromise) {
                this._advancing = true;
                this._startedPromise.then(() => {
                    this._advanceQueue();
                });
            }
            return;
        }
        if (!this._queue || this._writing) {
            return;
        }
        if (this._queue.length === 0) {
            return;
        }
        else {
            const writeRecord = this._queue.peek();
            if (writeRecord && writeRecord.close) {
                if (this.state !== State.Closing) {
                    throw new Error('Invalid record');
                }
                this._queue.dequeue();
                this._close();
                return;
            }
            this._writing = true;
            const chunk = writeRecord ? writeRecord.chunk : undefined;
            util.promiseInvokeOrNoop(this._underlyingSink, 'write', [chunk]).then(() => {
                if (this.state !== State.Errored) {
                    this._writing = false;
                    if (writeRecord && writeRecord.resolve) {
                        writeRecord.resolve();
                    }
                    this._queue.dequeue();
                    this._syncStateWithQueue();
                    this._advanceQueue();
                }
            }, (error) => {
                this._error(error);
            });
        }
    }
    _close() {
        if (this.state !== State.Closing) {
            throw new Error('WritableStream#_close called while state is not "Closing"');
        }
        util.promiseInvokeOrNoop(this._underlyingSink, 'close').then(() => {
            if (this.state !== State.Errored) {
                this._resolveClosedPromise();
                this._state = State.Closed;
                this._underlyingSink = undefined;
            }
        }, (error) => {
            this._error(error);
        });
    }
    _error(error) {
        if (this.state === State.Closed || this.state === State.Errored) {
            return;
        }
        let writeRecord;
        while (this._queue.length) {
            writeRecord = this._queue.dequeue();
            if (writeRecord && writeRecord.reject && !writeRecord.close) {
                writeRecord.reject(error);
            }
        }
        this._storedError = error;
        if (this.state === State.Waiting) {
            this._resolveReadyPromise();
        }
        this._rejectClosedPromise(error);
        this._state = State.Errored;
    }
    _syncStateWithQueue() {
        if (this.state === State.Closing) {
            return;
        }
        const queueSize = this._queue.totalSize;
        const shouldApplyBackPressure = queueSize > this._strategy.highWaterMark;
        if (shouldApplyBackPressure && this.state === State.Writable) {
            this._state = State.Waiting;
            this._readyPromise = new Promise_1.default((resolve, reject) => {
                this._resolveReadyPromise = resolve;
                this._rejectReadyPromise = reject;
            });
        }
        if (shouldApplyBackPressure === false && this.state === State.Waiting) {
            this._state = State.Writable;
            this._resolveReadyPromise();
        }
    }
    abort(reason) {
        if (!isWritableStream(this)) {
            return Promise_1.default.reject(new Error('WritableStream method called in context of object that is not a WritableStream instance'));
        }
        if (this.state === State.Closed) {
            return Promise_1.default.resolve();
        }
        if (this.state === State.Errored) {
            return Promise_1.default.reject(this._storedError);
        }
        const error = reason instanceof Error ? reason : new Error(reason);
        this._error(error);
        return util.promiseInvokeOrFallbackOrNoop(this._underlyingSink, 'abort', [reason], 'close')
            .then(function () {
            return;
        });
    }
    close() {
        if (!isWritableStream(this)) {
            return Promise_1.default.reject(new Error('WritableStream method called in context of object that is not a WritableStream instance'));
        }
        if (this.state === State.Closed) {
            return Promise_1.default.reject(new TypeError('Stream is already closed'));
        }
        if (this.state === State.Closing) {
            return Promise_1.default.reject(new TypeError('Stream is already closing'));
        }
        if (this.state === State.Errored) {
            return Promise_1.default.reject(this._storedError);
        }
        if (this.state === State.Waiting) {
            this._resolveReadyPromise();
        }
        this._state = State.Closing;
        this._queue.enqueue({ close: true }, 0);
        this._advanceQueue();
        return this._closedPromise;
    }
    write(chunk) {
        if (!isWritableStream(this)) {
            return Promise_1.default.reject(new Error('WritableStream method called in context of object that is not a WritableStream instance'));
        }
        if (this.state === State.Closed) {
            return Promise_1.default.reject(new TypeError('Stream is closed'));
        }
        if (this.state === State.Closing) {
            return Promise_1.default.reject(new TypeError('Stream is closing'));
        }
        if (this.state === State.Errored) {
            return Promise_1.default.reject(this._storedError);
        }
        let chunkSize = 1;
        let writeRecord;
        let promise = new Promise_1.default(function (resolve, reject) {
            writeRecord = {
                chunk: chunk,
                reject: reject,
                resolve: resolve
            };
        });
        promise.catch(() => { });
        try {
            if (this._strategy && this._strategy.size) {
                chunkSize = this._strategy.size(chunk);
            }
            this._queue.enqueue(writeRecord, chunkSize);
            this._syncStateWithQueue();
        }
        catch (error) {
            this._error(error);
            return Promise_1.default.reject(error);
        }
        this._advanceQueue();
        return promise;
    }
}
exports.default = WritableStream;
//# sourceMappingURL=WritableStream.js.map
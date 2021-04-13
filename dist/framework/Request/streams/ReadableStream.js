"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const Promise_1 = require("@dojo/framework/shim/Promise");
const ReadableStreamController_1 = require("./ReadableStreamController");
const ReadableStreamReader_1 = require("./ReadableStreamReader");
const SizeQueue_1 = require("./SizeQueue");
const util = require("./util");
const WritableStream_1 = require("./WritableStream");
var State;
(function (State) {
    State[State["Readable"] = 0] = "Readable";
    State[State["Closed"] = 1] = "Closed";
    State[State["Errored"] = 2] = "Errored";
})(State = exports.State || (exports.State = {}));
class ReadableStream {
    constructor(underlyingSource, strategy = {}) {
        this.closeRequested = false;
        if (!underlyingSource) {
            throw new Error('An ReadableStream Source must be provided.');
        }
        this.state = State.Readable;
        this._underlyingSource = underlyingSource;
        this.controller = new ReadableStreamController_1.default(this);
        this._strategy = util.normalizeStrategy(strategy);
        this.queue = new SizeQueue_1.default();
        this._startedPromise = new Promise_1.default((resolveStarted) => {
            const startResult = util.promiseInvokeOrNoop(this._underlyingSource, 'start', [this.controller]);
            startResult.then(() => {
                this._started = true;
                resolveStarted();
                this.pull();
            }, (error) => {
                this.error(error);
            });
        });
    }
    get _allowPull() {
        return !this.pullScheduled &&
            !this.closeRequested &&
            this._started &&
            this.state !== State.Closed &&
            this.state !== State.Errored &&
            !this._shouldApplyBackPressure();
    }
    get desiredSize() {
        return this._strategy.highWaterMark - this.queueSize;
    }
    get hasSource() {
        return this._underlyingSource != null;
    }
    get locked() {
        return this.hasSource && !!this.reader;
    }
    get readable() {
        return this.hasSource && this.state === State.Readable;
    }
    get started() {
        return this._startedPromise;
    }
    get queueSize() {
        return this.queue.totalSize;
    }
    _cancel(reason) {
        if (this.state === State.Closed) {
            return Promise_1.default.resolve();
        }
        if (this.state === State.Errored) {
            return Promise_1.default.reject(new TypeError('3.5.3-2: State is errored'));
        }
        this.queue.empty();
        this.close();
        return util.promiseInvokeOrNoop(this._underlyingSource, 'cancel', [reason]).then(function () { });
    }
    _shouldApplyBackPressure() {
        const queueSize = this.queue.totalSize;
        return queueSize > this._strategy.highWaterMark;
    }
    cancel(reason) {
        if (!this.hasSource) {
            return Promise_1.default.reject(new TypeError('3.2.4.1-1: Must be a ReadableStream'));
        }
        return this._cancel(reason);
    }
    close() {
        if (this.state !== State.Readable) {
            return;
        }
        this.state = State.Closed;
        if (this.locked && this.reader) {
            this.reader.release();
        }
    }
    enqueue(chunk) {
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
    error(error) {
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
    getReader() {
        if (!this.readable) {
            throw new TypeError('3.2.4.2-1: must be a ReadableStream instance');
        }
        return new ReadableStreamReader_1.default(this);
    }
    pipeThrough(transformStream, options) {
        this.pipeTo(transformStream.writable, options);
        return transformStream.readable;
    }
    pipeTo(dest, options = {}) {
        let resolvePipeToPromise;
        let rejectPipeToPromise;
        let closedPurposefully = false;
        let lastRead;
        let reader;
        function doPipe() {
            lastRead = reader.read();
            Promise_1.default.all([lastRead, dest.ready]).then(function (result) {
                const readResult = result ? result[0] : null;
                if (readResult.done) {
                    closeDest();
                }
                else if (dest.state === WritableStream_1.State.Writable) {
                    dest.write(readResult.value).then(() => {
                        doPipe();
                    }, () => {
                    });
                }
            }, () => {
            });
        }
        function cancelSource(reason) {
            if (!options.preventCancel) {
                reader.cancel(reason).catch(() => { });
                rejectPipeToPromise(reason);
            }
            else {
                lastRead.then(function () {
                    reader.releaseLock();
                    rejectPipeToPromise(reason);
                });
            }
        }
        function closeDest() {
            const destState = dest.state;
            if (!options.preventClose &&
                (destState === WritableStream_1.State.Waiting || destState === WritableStream_1.State.Writable)) {
                closedPurposefully = true;
                dest.close().then(resolvePipeToPromise, rejectPipeToPromise);
            }
            else {
                resolvePipeToPromise();
            }
        }
        return new Promise_1.default((resolve, reject) => {
            resolvePipeToPromise = resolve;
            rejectPipeToPromise = reject;
            reader = this.getReader();
            reader.closed.catch((reason) => {
                if (!options.preventAbort) {
                    dest.abort(reason);
                }
                rejectPipeToPromise(reason);
            });
            dest.closed.then(function () {
                if (!closedPurposefully) {
                    cancelSource(new TypeError('destination is closing or closed and cannot be piped to anymore'));
                }
            }, cancelSource);
            doPipe();
        });
    }
    pull() {
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
        this._pullingPromise = util.promiseInvokeOrNoop(this._underlyingSource, 'pull', [this.controller]);
        this._pullingPromise.then(() => {
            this._pullingPromise = undefined;
        }, (error) => {
            this.error(error);
        });
    }
    requestClose() {
        if (this.closeRequested || this.state !== State.Readable) {
            return;
        }
        this.closeRequested = true;
        if (this.queue.length === 0) {
            this.close();
        }
    }
    tee() {
        if (!this.readable) {
            throw new TypeError('3.2.4.5-1: must be a ReadableSream');
        }
        let branch1;
        let branch2;
        const reader = this.getReader();
        const teeState = {
            closedOrErrored: false,
            canceled1: false,
            canceled2: false,
            reason1: undefined,
            reason2: undefined
        };
        teeState.promise = new Promise_1.default(function (resolve) {
            teeState._resolve = resolve;
        });
        const createCancelFunction = (branch) => {
            return (reason) => {
                teeState['canceled' + branch] = true;
                teeState['reason' + branch] = reason;
                if (teeState['canceled' + (branch === 1 ? 2 : 1)]) {
                    const cancelResult = this._cancel([teeState.reason1, teeState.reason2]);
                    teeState._resolve(cancelResult);
                }
                return teeState.promise;
            };
        };
        const pull = function (controller) {
            return reader.read().then(function (result) {
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
        const underlyingSource1 = {
            pull: pull,
            cancel: cancel1
        };
        branch1 = new ReadableStream(underlyingSource1);
        const underlyingSource2 = {
            pull: pull,
            cancel: cancel2
        };
        branch2 = new ReadableStream(underlyingSource2);
        reader.closed.catch(function (r) {
            if (teeState.closedOrErrored) {
                return;
            }
            branch1.error(r);
            branch2.error(r);
            teeState.closedOrErrored = true;
        });
        return [branch1, branch2];
    }
}
exports.default = ReadableStream;
//# sourceMappingURL=ReadableStream.js.map
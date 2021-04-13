"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const Promise_1 = require("@dojo/framework/shim/Promise");
const ReadableStream_1 = require("./ReadableStream");
function isReadableStreamReader(readableStreamReader) {
    return Object.prototype.hasOwnProperty.call(readableStreamReader, '_ownerReadableStream');
}
class ReadableStreamReader {
    constructor(stream) {
        if (!stream.readable) {
            throw new TypeError('3.4.3-1: stream must be a ReadableStream');
        }
        if (stream.locked) {
            throw new TypeError('3.4.3-2: stream cannot be locked');
        }
        stream.reader = this;
        this._ownerReadableStream = stream;
        this.state = ReadableStream_1.State.Readable;
        this._storedError = undefined;
        this._readRequests = [];
        this._closedPromise = new Promise_1.default((resolve, reject) => {
            this._resolveClosedPromise = resolve;
            this._rejectClosedPromise = reject;
        });
        this._closedPromise.catch(() => {
        });
    }
    get closed() {
        return this._closedPromise;
    }
    cancel(reason) {
        if (!isReadableStreamReader(this)) {
            return Promise_1.default.reject(new TypeError('3.4.4.2-1: Must be a ReadableStreamReader instance'));
        }
        if (this.state === ReadableStream_1.State.Closed) {
            return Promise_1.default.resolve();
        }
        const storedError = this._storedError;
        if (this.state === ReadableStream_1.State.Errored) {
            return Promise_1.default.reject(storedError);
        }
        if (this._ownerReadableStream && this._ownerReadableStream.state === ReadableStream_1.State.Readable) {
            return this._ownerReadableStream.cancel(reason);
        }
        return Promise_1.default.reject(new TypeError('3.4.4.2-4,5: Cannot cancel ReadableStreamReader'));
    }
    read() {
        if (!isReadableStreamReader(this)) {
            return Promise_1.default.reject(new TypeError('3.4.4.3-1: Must be a ReadableStreamReader instance'));
        }
        if (this.state === ReadableStream_1.State.Closed) {
            return Promise_1.default.resolve({
                value: undefined,
                done: true
            });
        }
        if (this.state === ReadableStream_1.State.Errored) {
            return Promise_1.default.reject(new TypeError('3.5.12-2: reader state is Errored'));
        }
        const stream = this._ownerReadableStream;
        if (!stream || stream.state !== ReadableStream_1.State.Readable) {
            throw new TypeError('3.5.12-3,4: Stream must exist and be readable');
        }
        const queue = stream.queue;
        if (queue.length > 0) {
            const chunk = queue.dequeue();
            if (stream.closeRequested && !queue.length) {
                stream.close();
            }
            else {
                stream.pull();
            }
            return Promise_1.default.resolve({
                value: chunk,
                done: false
            });
        }
        else {
            let readResolve = () => {
            };
            let readReject = () => {
            };
            let readPromise = new Promise_1.default((resolve, reject) => {
                readResolve = resolve;
                readReject = reject;
            });
            this._readRequests.push({
                promise: readPromise,
                resolve: readResolve,
                reject: readReject
            });
            stream.pull();
            return readPromise;
        }
    }
    releaseLock() {
        if (!isReadableStreamReader(this)) {
            throw new TypeError('3.4.4.4-1: Must be a ReadableStreamReader isntance');
        }
        if (!this._ownerReadableStream) {
            return;
        }
        if (this._readRequests.length) {
            throw new TypeError('3.4.4.4-3: Tried to release a reader lock when that reader has pending read calls un-settled');
        }
        this.release();
    }
    release() {
        let request;
        if (this._ownerReadableStream && this._ownerReadableStream.state === ReadableStream_1.State.Errored) {
            this.state = ReadableStream_1.State.Errored;
            const e = this._ownerReadableStream.storedError;
            this._storedError = e;
            this._rejectClosedPromise(e);
            for (request of this._readRequests) {
                request.reject(e);
            }
        }
        else {
            this.state = ReadableStream_1.State.Closed;
            this._resolveClosedPromise();
            for (request of this._readRequests) {
                request.resolve({
                    value: undefined,
                    done: true
                });
            }
        }
        this._readRequests = [];
        if (this._ownerReadableStream) {
            this._ownerReadableStream.reader = undefined;
        }
        this._ownerReadableStream = undefined;
    }
    resolveReadRequest(chunk) {
        if (this._readRequests.length > 0) {
            const readRequest = this._readRequests.shift();
            if (readRequest) {
                readRequest.resolve({
                    value: chunk,
                    done: false
                });
                return true;
            }
        }
        return false;
    }
}
exports.default = ReadableStreamReader;
//# sourceMappingURL=ReadableStreamReader.js.map
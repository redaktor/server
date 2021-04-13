"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const Promise_1 = require("@dojo/framework/shim/Promise");
const ReadableStreamReader_1 = require("./ReadableStreamReader");
class SeekableStreamReader extends ReadableStreamReader_1.default {
    constructor() {
        super(...arguments);
        this._currentPosition = 0;
    }
    get currentPosition() {
        return this._currentPosition;
    }
    read() {
        return super.read().then((result) => {
            if (!result.done) {
                let chunkSize = 1;
                try {
                    if (this._ownerReadableStream.strategy && this._ownerReadableStream.strategy.size) {
                        chunkSize = this._ownerReadableStream.strategy.size(result.value);
                    }
                }
                catch (error) {
                    this._ownerReadableStream.error(error);
                    return Promise_1.default.reject(error);
                }
                this._currentPosition += chunkSize;
            }
            return Promise_1.default.resolve(result);
        }, function (error) {
            return Promise_1.default.reject(error);
        });
    }
    seek(position) {
        if (position === this._currentPosition) {
            return Promise_1.default.resolve(this._currentPosition);
        }
        if (position < this._currentPosition) {
            this._ownerReadableStream.queue.empty();
        }
        while (position > this._currentPosition && this._ownerReadableStream.queue.length) {
            let chunkSize = 1;
            let chunk = this._ownerReadableStream.queue.dequeue();
            if (this._ownerReadableStream.strategy && this._ownerReadableStream.strategy.size) {
                try {
                    chunkSize = this._ownerReadableStream.strategy.size(chunk);
                }
                catch (error) {
                    return Promise_1.default.reject(error);
                }
            }
            this._currentPosition += chunkSize;
        }
        if (this._ownerReadableStream.queue.length) {
            return Promise_1.default.resolve(this._currentPosition);
        }
        return this._ownerReadableStream.seek(position).then((position) => {
            this._currentPosition = position;
            return Promise_1.default.resolve(position);
        }, (error) => {
            return Promise_1.default.reject(error);
        });
    }
}
exports.default = SeekableStreamReader;
//# sourceMappingURL=SeekableStreamReader.js.map
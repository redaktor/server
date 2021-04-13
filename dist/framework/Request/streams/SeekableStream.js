"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const Promise_1 = require("@dojo/framework/shim/Promise");
const ReadableStream_1 = require("./ReadableStream");
const SeekableStreamReader_1 = require("./SeekableStreamReader");
class SeekableStream extends ReadableStream_1.default {
    constructor(underlyingSource, strategy = {}, preventClose = true) {
        super(underlyingSource, strategy);
        this.preventClose = preventClose;
    }
    getReader() {
        if (!this.readable || !this.seek) {
            throw new TypeError('Must be a SeekableStream instance');
        }
        return new SeekableStreamReader_1.default(this);
    }
    requestClose() {
        if (!this.preventClose) {
            super.requestClose();
        }
    }
    seek(position) {
        if (this._underlyingSource.seek) {
            return this._underlyingSource.seek(this.controller, position);
        }
        else {
            if (this.reader && position < this.reader.currentPosition) {
                return Promise_1.default.reject(new Error('Stream source is not seekable; cannot seek backwards'));
            }
            else {
                let discardNext = () => {
                    return this.reader.read().then((result) => {
                        if (result.done || this.reader.currentPosition === position) {
                            return Promise_1.default.resolve(this.reader.currentPosition);
                        }
                        else {
                            return discardNext();
                        }
                    });
                };
                return discardNext();
            }
        }
    }
    get strategy() {
        return this._strategy;
    }
}
exports.default = SeekableStream;
//# sourceMappingURL=SeekableStream.js.map
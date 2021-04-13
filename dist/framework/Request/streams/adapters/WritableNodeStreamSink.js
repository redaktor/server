"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const Promise_1 = require("@dojo/framework/shim/Promise");
class WritableNodeStreamSink {
    constructor(nodeStream, encoding = '') {
        this._isClosed = false;
        this._encoding = encoding;
        this._nodeStream = nodeStream;
        this._onError = this._handleError.bind(this);
        this._nodeStream.on('error', this._onError);
    }
    _handleError(error) {
        this._isClosed = true;
        this._removeListeners();
        if (this._rejectWritePromise) {
            this._rejectWritePromise(error);
            this._rejectWritePromise = undefined;
        }
        throw error;
    }
    _removeListeners() {
        this._nodeStream.removeListener('error', this._onError);
    }
    abort(reason) {
        return this.close();
    }
    close() {
        this._isClosed = true;
        this._removeListeners();
        return new Promise_1.default((resolve, reject) => {
            this._nodeStream.end('', undefined, (error) => {
                if (error) {
                    reject(error);
                }
                else {
                    resolve();
                }
            });
        });
    }
    start() {
        if (this._isClosed) {
            return Promise_1.default.reject(new Error('Stream is closed'));
        }
        return Promise_1.default.resolve();
    }
    write(chunk) {
        if (this._isClosed) {
            return Promise_1.default.reject(new Error('Stream is closed'));
        }
        return new Promise_1.default((resolve, reject) => {
            this._rejectWritePromise = reject;
            this._nodeStream.write(chunk, this._encoding, (error) => {
                if (error) {
                    this._handleError(error);
                }
                else {
                    this._rejectWritePromise = undefined;
                    resolve();
                }
            });
        });
    }
}
exports.default = WritableNodeStreamSink;
//# sourceMappingURL=WritableNodeStreamSink.js.map
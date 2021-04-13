"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const Promise_1 = require("@dojo/framework/shim/Promise");
class ReadableNodeStreamSource {
    constructor(nodeStream) {
        ;
        this._isClosed = false;
        this._nodeStream = nodeStream;
        this._shouldResume = !this._nodeStream.isPaused();
        if (this._shouldResume) {
            this._nodeStream.pause();
        }
    }
    _close() {
        this._isClosed = true;
        this._removeListeners();
        this._nodeStream.unpipe();
        if (this._shouldResume) {
            this._nodeStream.resume();
        }
    }
    _handleClose() {
        this._close();
        this._controller.close();
    }
    _handleError(error) {
        this._close();
        this._controller.error(error);
    }
    _removeListeners() {
        this._nodeStream.removeListener('close', this._onClose);
        this._nodeStream.removeListener('end', this._onClose);
        this._nodeStream.removeListener('error', this._onError);
    }
    cancel(reason) {
        this._handleClose();
        return Promise_1.default.resolve();
    }
    pull(controller) {
        if (this._isClosed) {
            return Promise_1.default.reject(new Error('Stream is closed'));
        }
        const chunk = this._nodeStream.read();
        if (chunk === null) {
            this._handleClose();
        }
        else {
            controller.enqueue(chunk);
        }
        return Promise_1.default.resolve();
    }
    start(controller) {
        this._controller = controller;
        this._onClose = this._handleClose.bind(this);
        this._onError = this._handleError.bind(this);
        this._nodeStream.on('close', this._onClose);
        this._nodeStream.on('end', this._onClose);
        this._nodeStream.on('error', this._onError);
        return Promise_1.default.resolve();
    }
}
exports.default = ReadableNodeStreamSource;
//# sourceMappingURL=ReadableNodeStreamSource.js.map
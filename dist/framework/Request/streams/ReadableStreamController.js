"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const ReadableStream_1 = require("./ReadableStream");
function isReadableStreamController(x) {
    return Object.prototype.hasOwnProperty.call(x, '_controlledReadableStream');
}
exports.isReadableStreamController = isReadableStreamController;
class ReadableStreamController {
    constructor(stream) {
        if (!stream.readable) {
            throw new TypeError('3.3.3-1: ReadableStreamController can only be constructed with a ReadableStream instance');
        }
        if (stream.controller !== undefined) {
            throw new TypeError('ReadableStreamController instances can only be created by the ReadableStream constructor');
        }
        this._controlledReadableStream = stream;
    }
    get desiredSize() {
        return this._controlledReadableStream.desiredSize;
    }
    close() {
        if (!isReadableStreamController(this)) {
            throw new TypeError('3.3.4.2-1: ReadableStreamController#close can only be used on a ReadableStreamController');
        }
        const stream = this._controlledReadableStream;
        if (stream.closeRequested) {
            throw new TypeError('3.3.4.2-3: The stream has already been closed; do not close it again!');
        }
        if (stream.state === ReadableStream_1.State.Errored) {
            throw new TypeError('3.3.4.2-4: The stream is in an errored state and cannot be closed');
        }
        return stream.requestClose();
    }
    enqueue(chunk) {
        if (!isReadableStreamController(this)) {
            throw new TypeError('3.3.4.3-1: ReadableStreamController#enqueue can only be used on a ReadableStreamController');
        }
        const stream = this._controlledReadableStream;
        if (stream.state === ReadableStream_1.State.Errored) {
            throw stream.storedError;
        }
        if (stream.closeRequested) {
            throw new TypeError('3.3.4.3-4: stream is draining');
        }
        stream.enqueue(chunk);
    }
    error(error) {
        if (!isReadableStreamController(this)) {
            throw new TypeError('3.3.4.3-1: ReadableStreamController#enqueue can only be used on a ReadableStreamController');
        }
        if (this._controlledReadableStream.state !== ReadableStream_1.State.Readable) {
            throw new TypeError(`3.3.4.3-2: the stream is ${this._controlledReadableStream.state} and so cannot be errored`);
        }
        this._controlledReadableStream.error(error);
    }
}
exports.default = ReadableStreamController;
//# sourceMappingURL=ReadableStreamController.js.map
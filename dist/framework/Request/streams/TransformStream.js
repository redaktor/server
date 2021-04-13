"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const Promise_1 = require("@dojo/framework/shim/Promise");
const ReadableStream_1 = require("./ReadableStream");
const WritableStream_1 = require("./WritableStream");
class TransformStream {
    constructor(transformer) {
        let writeChunk;
        let writeDone;
        let errorWritable;
        let transforming = false;
        let chunkWrittenButNotYetTransformed = false;
        let enqueueInReadable;
        let closeReadable;
        let errorReadable;
        function maybeDoTransform() {
            if (!transforming) {
                transforming = true;
                try {
                    transformer.transform(writeChunk, enqueueInReadable, transformDone);
                    writeChunk = undefined;
                    chunkWrittenButNotYetTransformed = false;
                }
                catch (e) {
                    transforming = false;
                    errorWritable(e);
                    errorReadable(e);
                }
            }
        }
        function transformDone() {
            transforming = false;
            writeDone();
        }
        this.writable = new WritableStream_1.default({
            abort() {
                return Promise_1.default.resolve();
            },
            start(error) {
                errorWritable = error;
                return Promise_1.default.resolve();
            },
            write(chunk) {
                writeChunk = chunk;
                chunkWrittenButNotYetTransformed = true;
                const promise = new Promise_1.default(function (resolve) {
                    writeDone = resolve;
                });
                maybeDoTransform();
                return promise;
            },
            close() {
                try {
                    transformer.flush(enqueueInReadable, closeReadable);
                    return Promise_1.default.resolve();
                }
                catch (e) {
                    errorWritable(e);
                    errorReadable(e);
                    return Promise_1.default.reject(e);
                }
            }
        }, transformer.writableStrategy);
        this.readable = new ReadableStream_1.default({
            start(controller) {
                enqueueInReadable = controller.enqueue.bind(controller);
                closeReadable = controller.close.bind(controller);
                errorReadable = controller.error.bind(controller);
                return Promise_1.default.resolve();
            },
            pull(controller) {
                if (chunkWrittenButNotYetTransformed) {
                    maybeDoTransform();
                }
                return Promise_1.default.resolve();
            },
            cancel() {
                return Promise_1.default.resolve();
            }
        }, transformer.readableStrategy);
    }
}
exports.default = TransformStream;
//# sourceMappingURL=TransformStream.js.map
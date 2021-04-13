"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const Promise_1 = require("@dojo/framework/shim/Promise");
const resolved = Promise_1.default.resolve();
class ArraySource {
    constructor(data) {
        this.currentPosition = 0;
        this.data = [];
        if (data && data.length) {
            this.data = this.data.concat(data);
        }
    }
    seek(controller, position) {
        if (position >= this.data.length || position < 0) {
            let error = new Error('Invalid seek position: ' + position);
            controller.error(error);
            return Promise_1.default.reject(error);
        }
        this.currentPosition = position;
        return Promise_1.default.resolve(this.currentPosition);
    }
    start(controller) {
        return resolved;
    }
    pull(controller) {
        if (this.currentPosition >= this.data.length) {
            controller.close();
        }
        else {
            this.currentPosition += 1;
            controller.enqueue(this.data[this.currentPosition - 1]);
        }
        return resolved;
    }
    cancel(reason) {
        return resolved;
    }
}
exports.default = ArraySource;
//# sourceMappingURL=ArraySource.js.map
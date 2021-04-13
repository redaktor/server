"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const Promise_1 = require("@dojo/framework/shim/Promise");
let resolved = Promise_1.default.resolve();
class ArraySink {
    abort(reason) {
        return resolved;
    }
    close() {
        return Promise_1.default.resolve();
    }
    start(error) {
        this.chunks = [];
        return resolved;
    }
    write(chunk) {
        if (chunk) {
            this.chunks.push(chunk);
        }
        return resolved;
    }
}
exports.default = ArraySink;
//# sourceMappingURL=ArraySink.js.map
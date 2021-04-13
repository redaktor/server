"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
class SizeQueue {
    constructor() {
        this._queue = [];
    }
    get totalSize() {
        let totalSize = 0;
        this._queue.forEach(function (pair) {
            totalSize += pair.size;
        });
        return totalSize;
    }
    get length() {
        return this._queue.length;
    }
    empty() {
        this._queue = [];
    }
    enqueue(value, size) {
        this._queue.push({ value: value, size: size });
    }
    dequeue() {
        const pair = this._queue.shift();
        return pair ? pair.value : null;
    }
    peek() {
        const pair = this._queue[0];
        return pair ? pair.value : null;
    }
}
exports.default = SizeQueue;
//# sourceMappingURL=SizeQueue.js.map
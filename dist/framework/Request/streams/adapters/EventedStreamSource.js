"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const Promise_1 = require("@dojo/framework/shim/Promise");
const on_1 = require("../../on");
class EventedStreamSource {
    constructor(target, type) {
        this._target = target;
        if (Array.isArray(type)) {
            this._events = type;
        }
        else {
            this._events = [type];
        }
        this._handles = [];
    }
    start(controller) {
        this._controller = controller;
        this._events.forEach((eventName) => {
            this._handles.push(on_1.default(this._target, eventName, this._handleEvent.bind(this)));
        });
        return Promise_1.default.resolve();
    }
    cancel(reason) {
        while (this._handles.length) {
            const handle = this._handles.shift();
            if (handle) {
                handle.destroy();
            }
        }
        return Promise_1.default.resolve();
    }
    _handleEvent(event) {
        this._controller.enqueue(event);
    }
}
exports.default = EventedStreamSource;
//# sourceMappingURL=EventedStreamSource.js.map
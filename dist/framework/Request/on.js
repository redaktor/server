"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const util_1 = require("./util");
function emit(target, event) {
    if (target.dispatchEvent &&
        ((target.ownerDocument && target.ownerDocument.createEvent) ||
            (target.document && target.document.createEvent) ||
            target.createEvent)) {
        const nativeEvent = (target.ownerDocument || target.document || target).createEvent('HTMLEvents');
        nativeEvent.initEvent(event.type, Boolean(event.bubbles), Boolean(event.cancelable));
        for (let key in event) {
            if (!(key in nativeEvent)) {
                nativeEvent[key] = event[key];
            }
        }
        return target.dispatchEvent(nativeEvent);
    }
    if (target.emit) {
        if (target.removeListener) {
            target.emit(event.type, event);
            return false;
        }
        else if (target.on) {
            target.emit(event);
            return false;
        }
    }
    throw new Error('Target must be an event emitter');
}
exports.emit = emit;
function on(target, type, listener, capture) {
    if (Array.isArray(type)) {
        let handles = type.map(function (type) {
            return on(target, type, listener, capture);
        });
        return util_1.createCompositeHandle(...handles);
    }
    const callback = function () {
        listener.apply(this, arguments);
    };
    if (target.addEventListener && target.removeEventListener) {
        target.addEventListener(type, callback, capture);
        return util_1.createHandle(function () {
            target.removeEventListener(type, callback, capture);
        });
    }
    if (target.on) {
        if (target.removeListener) {
            target.on(type, callback);
            return util_1.createHandle(function () {
                target.removeListener(type, callback);
            });
        }
        else if (target.emit) {
            return target.on(type, listener);
        }
    }
    throw new TypeError('Unknown event emitter object');
}
exports.default = on;
function once(target, type, listener, capture) {
    var handle = on(target, type, function () {
        handle.destroy();
        return listener.apply(this, arguments);
    }, capture);
    return handle;
}
exports.once = once;
function pausable(target, type, listener, capture) {
    let paused;
    const handle = on(target, type, function () {
        if (!paused) {
            return listener.apply(this, arguments);
        }
    }, capture);
    handle.pause = function () {
        paused = true;
    };
    handle.resume = function () {
        paused = false;
    };
    return handle;
}
exports.pausable = pausable;
//# sourceMappingURL=on.js.map
"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.aes = (function webpackUniversalModuleDefinition(root, factory) {
    if (typeof exports === 'object' && typeof module === 'object')
        module.exports = factory();
    else if (typeof define === 'function' && define.amd)
        define([], factory);
    else if (typeof exports === 'object')
        exports["forge"] = factory();
    else
        root["forge"] = factory();
})(typeof self !== 'undefined' ? self : this, function () {
    return (function (modules) {
        var installedModules = {};
        function __webpack_require__(moduleId) {
            if (installedModules[moduleId]) {
                return installedModules[moduleId].exports;
            }
            var module = installedModules[moduleId] = {
                i: moduleId,
                l: false,
                exports: {}
            };
            modules[moduleId].call(module.exports, module, module.exports, __webpack_require__);
            module.l = true;
            return module.exports;
        }
        __webpack_require__.m = modules;
        __webpack_require__.c = installedModules;
        __webpack_require__.d = function (exports, name, getter) {
            if (!__webpack_require__.o(exports, name)) {
                Object.defineProperty(exports, name, {
                    configurable: false,
                    enumerable: true,
                    get: getter
                });
            }
        };
        __webpack_require__.n = function (module) {
            var getter = module && module.__esModule ?
                function getDefault() { return module['default']; } :
                function getModuleExports() { return module; };
            __webpack_require__.d(getter, 'a', getter);
            return getter;
        };
        __webpack_require__.o = function (object, property) { return Object.prototype.hasOwnProperty.call(object, property); };
        __webpack_require__.p = "";
        return __webpack_require__(__webpack_require__.s = 4);
    })([
        (function (module, exports) {
            module.exports = {
                options: {
                    usePureJavaScript: false
                }
            };
        }),
        (function (module, exports, __webpack_require__) {
            (function (global) {
                var forge = __webpack_require__(0);
                var baseN = __webpack_require__(7);
                var util = module.exports = forge.util = forge.util || {};
                (function () {
                    if (typeof process !== 'undefined' && process.nextTick && !process.browser) {
                        util.nextTick = process.nextTick;
                        if (typeof setImmediate === 'function') {
                            util.setImmediate = setImmediate;
                        }
                        else {
                            util.setImmediate = util.nextTick;
                        }
                        return;
                    }
                    if (typeof setImmediate === 'function') {
                        util.setImmediate = function () { return setImmediate.apply(undefined, arguments); };
                        util.nextTick = function (callback) {
                            return setImmediate(callback);
                        };
                        return;
                    }
                    util.setImmediate = function (callback) {
                        setTimeout(callback, 0);
                    };
                    if (typeof window !== 'undefined' &&
                        typeof window.postMessage === 'function') {
                        var msg = 'forge.setImmediate';
                        var callbacks = [];
                        util.setImmediate = function (callback) {
                            callbacks.push(callback);
                            if (callbacks.length === 1) {
                                window.postMessage(msg, '*');
                            }
                        };
                        function handler(event) {
                            if (event.source === window && event.data === msg) {
                                event.stopPropagation();
                                var copy = callbacks.slice();
                                callbacks.length = 0;
                                copy.forEach(function (callback) {
                                    callback();
                                });
                            }
                        }
                        window.addEventListener('message', handler, true);
                    }
                    if (typeof MutationObserver !== 'undefined') {
                        var now = Date.now();
                        var attr = true;
                        var div = document.createElement('div');
                        var callbacks = [];
                        new MutationObserver(function () {
                            var copy = callbacks.slice();
                            callbacks.length = 0;
                            copy.forEach(function (callback) {
                                callback();
                            });
                        }).observe(div, { attributes: true });
                        var oldSetImmediate = util.setImmediate;
                        util.setImmediate = function (callback) {
                            if (Date.now() - now > 15) {
                                now = Date.now();
                                oldSetImmediate(callback);
                            }
                            else {
                                callbacks.push(callback);
                                if (callbacks.length === 1) {
                                    div.setAttribute('a', attr = (!attr));
                                }
                            }
                        };
                    }
                    util.nextTick = util.setImmediate;
                })();
                util.isNodejs =
                    typeof process !== 'undefined' && process.versions && process.versions.node;
                util.globalScope = (function () {
                    if (util.isNodejs) {
                        return global;
                    }
                    return typeof self === 'undefined' ? window : self;
                })();
                util.isArray = Array.isArray || function (x) {
                    return Object.prototype.toString.call(x) === '[object Array]';
                };
                util.isArrayBuffer = function (x) {
                    return typeof ArrayBuffer !== 'undefined' && x instanceof ArrayBuffer;
                };
                util.isArrayBufferView = function (x) {
                    return x && util.isArrayBuffer(x.buffer) && x.byteLength !== undefined;
                };
                function _checkBitsParam(n) {
                    if (!(n === 8 || n === 16 || n === 24 || n === 32)) {
                        throw new Error('Only 8, 16, 24, or 32 bits supported: ' + n);
                    }
                }
                util.ByteBuffer = ByteStringBuffer;
                function ByteStringBuffer(b) {
                    this.data = '';
                    this.read = 0;
                    if (typeof b === 'string') {
                        this.data = b;
                    }
                    else if (util.isArrayBuffer(b) || util.isArrayBufferView(b)) {
                        if (typeof Buffer !== 'undefined' && b instanceof Buffer) {
                            this.data = b.toString('binary');
                        }
                        else {
                            var arr = new Uint8Array(b);
                            try {
                                this.data = String.fromCharCode.apply(null, arr);
                            }
                            catch (e) {
                                for (var i = 0; i < arr.length; ++i) {
                                    this.putByte(arr[i]);
                                }
                            }
                        }
                    }
                    else if (b instanceof ByteStringBuffer ||
                        (typeof b === 'object' && typeof b.data === 'string' &&
                            typeof b.read === 'number')) {
                        this.data = b.data;
                        this.read = b.read;
                    }
                    this._constructedStringLength = 0;
                }
                util.ByteStringBuffer = ByteStringBuffer;
                var _MAX_CONSTRUCTED_STRING_LENGTH = 4096;
                util.ByteStringBuffer.prototype._optimizeConstructedString = function (x) {
                    this._constructedStringLength += x;
                    if (this._constructedStringLength > _MAX_CONSTRUCTED_STRING_LENGTH) {
                        this.data.substr(0, 1);
                        this._constructedStringLength = 0;
                    }
                };
                util.ByteStringBuffer.prototype.length = function () {
                    return this.data.length - this.read;
                };
                util.ByteStringBuffer.prototype.isEmpty = function () {
                    return this.length() <= 0;
                };
                util.ByteStringBuffer.prototype.putByte = function (b) {
                    return this.putBytes(String.fromCharCode(b));
                };
                util.ByteStringBuffer.prototype.fillWithByte = function (b, n) {
                    b = String.fromCharCode(b);
                    var d = this.data;
                    while (n > 0) {
                        if (n & 1) {
                            d += b;
                        }
                        n >>>= 1;
                        if (n > 0) {
                            b += b;
                        }
                    }
                    this.data = d;
                    this._optimizeConstructedString(n);
                    return this;
                };
                util.ByteStringBuffer.prototype.putBytes = function (bytes) {
                    this.data += bytes;
                    this._optimizeConstructedString(bytes.length);
                    return this;
                };
                util.ByteStringBuffer.prototype.putString = function (str) {
                    return this.putBytes(util.encodeUtf8(str));
                };
                util.ByteStringBuffer.prototype.putInt16 = function (i) {
                    return this.putBytes(String.fromCharCode(i >> 8 & 0xFF) +
                        String.fromCharCode(i & 0xFF));
                };
                util.ByteStringBuffer.prototype.putInt24 = function (i) {
                    return this.putBytes(String.fromCharCode(i >> 16 & 0xFF) +
                        String.fromCharCode(i >> 8 & 0xFF) +
                        String.fromCharCode(i & 0xFF));
                };
                util.ByteStringBuffer.prototype.putInt32 = function (i) {
                    return this.putBytes(String.fromCharCode(i >> 24 & 0xFF) +
                        String.fromCharCode(i >> 16 & 0xFF) +
                        String.fromCharCode(i >> 8 & 0xFF) +
                        String.fromCharCode(i & 0xFF));
                };
                util.ByteStringBuffer.prototype.putInt16Le = function (i) {
                    return this.putBytes(String.fromCharCode(i & 0xFF) +
                        String.fromCharCode(i >> 8 & 0xFF));
                };
                util.ByteStringBuffer.prototype.putInt24Le = function (i) {
                    return this.putBytes(String.fromCharCode(i & 0xFF) +
                        String.fromCharCode(i >> 8 & 0xFF) +
                        String.fromCharCode(i >> 16 & 0xFF));
                };
                util.ByteStringBuffer.prototype.putInt32Le = function (i) {
                    return this.putBytes(String.fromCharCode(i & 0xFF) +
                        String.fromCharCode(i >> 8 & 0xFF) +
                        String.fromCharCode(i >> 16 & 0xFF) +
                        String.fromCharCode(i >> 24 & 0xFF));
                };
                util.ByteStringBuffer.prototype.putInt = function (i, n) {
                    _checkBitsParam(n);
                    var bytes = '';
                    do {
                        n -= 8;
                        bytes += String.fromCharCode((i >> n) & 0xFF);
                    } while (n > 0);
                    return this.putBytes(bytes);
                };
                util.ByteStringBuffer.prototype.putSignedInt = function (i, n) {
                    if (i < 0) {
                        i += 2 << (n - 1);
                    }
                    return this.putInt(i, n);
                };
                util.ByteStringBuffer.prototype.putBuffer = function (buffer) {
                    return this.putBytes(buffer.getBytes());
                };
                util.ByteStringBuffer.prototype.getByte = function () {
                    return this.data.charCodeAt(this.read++);
                };
                util.ByteStringBuffer.prototype.getInt16 = function () {
                    var rval = (this.data.charCodeAt(this.read) << 8 ^
                        this.data.charCodeAt(this.read + 1));
                    this.read += 2;
                    return rval;
                };
                util.ByteStringBuffer.prototype.getInt24 = function () {
                    var rval = (this.data.charCodeAt(this.read) << 16 ^
                        this.data.charCodeAt(this.read + 1) << 8 ^
                        this.data.charCodeAt(this.read + 2));
                    this.read += 3;
                    return rval;
                };
                util.ByteStringBuffer.prototype.getInt32 = function () {
                    var rval = (this.data.charCodeAt(this.read) << 24 ^
                        this.data.charCodeAt(this.read + 1) << 16 ^
                        this.data.charCodeAt(this.read + 2) << 8 ^
                        this.data.charCodeAt(this.read + 3));
                    this.read += 4;
                    return rval;
                };
                util.ByteStringBuffer.prototype.getInt16Le = function () {
                    var rval = (this.data.charCodeAt(this.read) ^
                        this.data.charCodeAt(this.read + 1) << 8);
                    this.read += 2;
                    return rval;
                };
                util.ByteStringBuffer.prototype.getInt24Le = function () {
                    var rval = (this.data.charCodeAt(this.read) ^
                        this.data.charCodeAt(this.read + 1) << 8 ^
                        this.data.charCodeAt(this.read + 2) << 16);
                    this.read += 3;
                    return rval;
                };
                util.ByteStringBuffer.prototype.getInt32Le = function () {
                    var rval = (this.data.charCodeAt(this.read) ^
                        this.data.charCodeAt(this.read + 1) << 8 ^
                        this.data.charCodeAt(this.read + 2) << 16 ^
                        this.data.charCodeAt(this.read + 3) << 24);
                    this.read += 4;
                    return rval;
                };
                util.ByteStringBuffer.prototype.getInt = function (n) {
                    _checkBitsParam(n);
                    var rval = 0;
                    do {
                        rval = (rval << 8) + this.data.charCodeAt(this.read++);
                        n -= 8;
                    } while (n > 0);
                    return rval;
                };
                util.ByteStringBuffer.prototype.getSignedInt = function (n) {
                    var x = this.getInt(n);
                    var max = 2 << (n - 2);
                    if (x >= max) {
                        x -= max << 1;
                    }
                    return x;
                };
                util.ByteStringBuffer.prototype.getBytes = function (count) {
                    var rval;
                    if (count) {
                        count = Math.min(this.length(), count);
                        rval = this.data.slice(this.read, this.read + count);
                        this.read += count;
                    }
                    else if (count === 0) {
                        rval = '';
                    }
                    else {
                        rval = (this.read === 0) ? this.data : this.data.slice(this.read);
                        this.clear();
                    }
                    return rval;
                };
                util.ByteStringBuffer.prototype.bytes = function (count) {
                    return (typeof (count) === 'undefined' ?
                        this.data.slice(this.read) :
                        this.data.slice(this.read, this.read + count));
                };
                util.ByteStringBuffer.prototype.at = function (i) {
                    return this.data.charCodeAt(this.read + i);
                };
                util.ByteStringBuffer.prototype.setAt = function (i, b) {
                    this.data = this.data.substr(0, this.read + i) +
                        String.fromCharCode(b) +
                        this.data.substr(this.read + i + 1);
                    return this;
                };
                util.ByteStringBuffer.prototype.last = function () {
                    return this.data.charCodeAt(this.data.length - 1);
                };
                util.ByteStringBuffer.prototype.copy = function () {
                    var c = util.createBuffer(this.data);
                    c.read = this.read;
                    return c;
                };
                util.ByteStringBuffer.prototype.compact = function () {
                    if (this.read > 0) {
                        this.data = this.data.slice(this.read);
                        this.read = 0;
                    }
                    return this;
                };
                util.ByteStringBuffer.prototype.clear = function () {
                    this.data = '';
                    this.read = 0;
                    return this;
                };
                util.ByteStringBuffer.prototype.truncate = function (count) {
                    var len = Math.max(0, this.length() - count);
                    this.data = this.data.substr(this.read, len);
                    this.read = 0;
                    return this;
                };
                util.ByteStringBuffer.prototype.toHex = function () {
                    var rval = '';
                    for (var i = this.read; i < this.data.length; ++i) {
                        var b = this.data.charCodeAt(i);
                        if (b < 16) {
                            rval += '0';
                        }
                        rval += b.toString(16);
                    }
                    return rval;
                };
                util.ByteStringBuffer.prototype.toString = function () {
                    return util.decodeUtf8(this.bytes());
                };
                function DataBuffer(b, options) {
                    options = options || {};
                    this.read = options.readOffset || 0;
                    this.growSize = options.growSize || 1024;
                    var isArrayBuffer = util.isArrayBuffer(b);
                    var isArrayBufferView = util.isArrayBufferView(b);
                    if (isArrayBuffer || isArrayBufferView) {
                        if (isArrayBuffer) {
                            this.data = new DataView(b);
                        }
                        else {
                            this.data = new DataView(b.buffer, b.byteOffset, b.byteLength);
                        }
                        this.write = ('writeOffset' in options ?
                            options.writeOffset : this.data.byteLength);
                        return;
                    }
                    this.data = new DataView(new ArrayBuffer(0));
                    this.write = 0;
                    if (b !== null && b !== undefined) {
                        this.putBytes(b);
                    }
                    if ('writeOffset' in options) {
                        this.write = options.writeOffset;
                    }
                }
                util.DataBuffer = DataBuffer;
                util.DataBuffer.prototype.length = function () {
                    return this.write - this.read;
                };
                util.DataBuffer.prototype.isEmpty = function () {
                    return this.length() <= 0;
                };
                util.DataBuffer.prototype.accommodate = function (amount, growSize) {
                    if (this.length() >= amount) {
                        return this;
                    }
                    growSize = Math.max(growSize || this.growSize, amount);
                    var src = new Uint8Array(this.data.buffer, this.data.byteOffset, this.data.byteLength);
                    var dst = new Uint8Array(this.length() + growSize);
                    dst.set(src);
                    this.data = new DataView(dst.buffer);
                    return this;
                };
                util.DataBuffer.prototype.putByte = function (b) {
                    this.accommodate(1);
                    this.data.setUint8(this.write++, b);
                    return this;
                };
                util.DataBuffer.prototype.fillWithByte = function (b, n) {
                    this.accommodate(n);
                    for (var i = 0; i < n; ++i) {
                        this.data.setUint8(b);
                    }
                    return this;
                };
                util.DataBuffer.prototype.putBytes = function (bytes, encoding) {
                    if (util.isArrayBufferView(bytes)) {
                        var src = new Uint8Array(bytes.buffer, bytes.byteOffset, bytes.byteLength);
                        var len = src.byteLength - src.byteOffset;
                        this.accommodate(len);
                        var dst = new Uint8Array(this.data.buffer, this.write);
                        dst.set(src);
                        this.write += len;
                        return this;
                    }
                    if (util.isArrayBuffer(bytes)) {
                        var src = new Uint8Array(bytes);
                        this.accommodate(src.byteLength);
                        var dst = new Uint8Array(this.data.buffer);
                        dst.set(src, this.write);
                        this.write += src.byteLength;
                        return this;
                    }
                    if (bytes instanceof util.DataBuffer ||
                        (typeof bytes === 'object' &&
                            typeof bytes.read === 'number' && typeof bytes.write === 'number' &&
                            util.isArrayBufferView(bytes.data))) {
                        var src = new Uint8Array(bytes.data.byteLength, bytes.read, bytes.length());
                        this.accommodate(src.byteLength);
                        var dst = new Uint8Array(bytes.data.byteLength, this.write);
                        dst.set(src);
                        this.write += src.byteLength;
                        return this;
                    }
                    if (bytes instanceof util.ByteStringBuffer) {
                        bytes = bytes.data;
                        encoding = 'binary';
                    }
                    encoding = encoding || 'binary';
                    if (typeof bytes === 'string') {
                        var view;
                        if (encoding === 'hex') {
                            this.accommodate(Math.ceil(bytes.length / 2));
                            view = new Uint8Array(this.data.buffer, this.write);
                            this.write += util.binary.hex.decode(bytes, view, this.write);
                            return this;
                        }
                        if (encoding === 'base64') {
                            this.accommodate(Math.ceil(bytes.length / 4) * 3);
                            view = new Uint8Array(this.data.buffer, this.write);
                            this.write += util.binary.base64.decode(bytes, view, this.write);
                            return this;
                        }
                        if (encoding === 'utf8') {
                            bytes = util.encodeUtf8(bytes);
                            encoding = 'binary';
                        }
                        if (encoding === 'binary' || encoding === 'raw') {
                            this.accommodate(bytes.length);
                            view = new Uint8Array(this.data.buffer, this.write);
                            this.write += util.binary.raw.decode(view);
                            return this;
                        }
                        if (encoding === 'utf16') {
                            this.accommodate(bytes.length * 2);
                            view = new Uint16Array(this.data.buffer, this.write);
                            this.write += util.text.utf16.encode(view);
                            return this;
                        }
                        throw new Error('Invalid encoding: ' + encoding);
                    }
                    throw Error('Invalid parameter: ' + bytes);
                };
                util.DataBuffer.prototype.putBuffer = function (buffer) {
                    this.putBytes(buffer);
                    buffer.clear();
                    return this;
                };
                util.DataBuffer.prototype.putString = function (str) {
                    return this.putBytes(str, 'utf16');
                };
                util.DataBuffer.prototype.putInt16 = function (i) {
                    this.accommodate(2);
                    this.data.setInt16(this.write, i);
                    this.write += 2;
                    return this;
                };
                util.DataBuffer.prototype.putInt24 = function (i) {
                    this.accommodate(3);
                    this.data.setInt16(this.write, i >> 8 & 0xFFFF);
                    this.data.setInt8(this.write, i >> 16 & 0xFF);
                    this.write += 3;
                    return this;
                };
                util.DataBuffer.prototype.putInt32 = function (i) {
                    this.accommodate(4);
                    this.data.setInt32(this.write, i);
                    this.write += 4;
                    return this;
                };
                util.DataBuffer.prototype.putInt16Le = function (i) {
                    this.accommodate(2);
                    this.data.setInt16(this.write, i, true);
                    this.write += 2;
                    return this;
                };
                util.DataBuffer.prototype.putInt24Le = function (i) {
                    this.accommodate(3);
                    this.data.setInt8(this.write, i >> 16 & 0xFF);
                    this.data.setInt16(this.write, i >> 8 & 0xFFFF, true);
                    this.write += 3;
                    return this;
                };
                util.DataBuffer.prototype.putInt32Le = function (i) {
                    this.accommodate(4);
                    this.data.setInt32(this.write, i, true);
                    this.write += 4;
                    return this;
                };
                util.DataBuffer.prototype.putInt = function (i, n) {
                    _checkBitsParam(n);
                    this.accommodate(n / 8);
                    do {
                        n -= 8;
                        this.data.setInt8(this.write++, (i >> n) & 0xFF);
                    } while (n > 0);
                    return this;
                };
                util.DataBuffer.prototype.putSignedInt = function (i, n) {
                    _checkBitsParam(n);
                    this.accommodate(n / 8);
                    if (i < 0) {
                        i += 2 << (n - 1);
                    }
                    return this.putInt(i, n);
                };
                util.DataBuffer.prototype.getByte = function () {
                    return this.data.getInt8(this.read++);
                };
                util.DataBuffer.prototype.getInt16 = function () {
                    var rval = this.data.getInt16(this.read);
                    this.read += 2;
                    return rval;
                };
                util.DataBuffer.prototype.getInt24 = function () {
                    var rval = (this.data.getInt16(this.read) << 8 ^
                        this.data.getInt8(this.read + 2));
                    this.read += 3;
                    return rval;
                };
                util.DataBuffer.prototype.getInt32 = function () {
                    var rval = this.data.getInt32(this.read);
                    this.read += 4;
                    return rval;
                };
                util.DataBuffer.prototype.getInt16Le = function () {
                    var rval = this.data.getInt16(this.read, true);
                    this.read += 2;
                    return rval;
                };
                util.DataBuffer.prototype.getInt24Le = function () {
                    var rval = (this.data.getInt8(this.read) ^
                        this.data.getInt16(this.read + 1, true) << 8);
                    this.read += 3;
                    return rval;
                };
                util.DataBuffer.prototype.getInt32Le = function () {
                    var rval = this.data.getInt32(this.read, true);
                    this.read += 4;
                    return rval;
                };
                util.DataBuffer.prototype.getInt = function (n) {
                    _checkBitsParam(n);
                    var rval = 0;
                    do {
                        rval = (rval << 8) + this.data.getInt8(this.read++);
                        n -= 8;
                    } while (n > 0);
                    return rval;
                };
                util.DataBuffer.prototype.getSignedInt = function (n) {
                    var x = this.getInt(n);
                    var max = 2 << (n - 2);
                    if (x >= max) {
                        x -= max << 1;
                    }
                    return x;
                };
                util.DataBuffer.prototype.getBytes = function (count) {
                    var rval;
                    if (count) {
                        count = Math.min(this.length(), count);
                        rval = this.data.slice(this.read, this.read + count);
                        this.read += count;
                    }
                    else if (count === 0) {
                        rval = '';
                    }
                    else {
                        rval = (this.read === 0) ? this.data : this.data.slice(this.read);
                        this.clear();
                    }
                    return rval;
                };
                util.DataBuffer.prototype.bytes = function (count) {
                    return (typeof (count) === 'undefined' ?
                        this.data.slice(this.read) :
                        this.data.slice(this.read, this.read + count));
                };
                util.DataBuffer.prototype.at = function (i) {
                    return this.data.getUint8(this.read + i);
                };
                util.DataBuffer.prototype.setAt = function (i, b) {
                    this.data.setUint8(i, b);
                    return this;
                };
                util.DataBuffer.prototype.last = function () {
                    return this.data.getUint8(this.write - 1);
                };
                util.DataBuffer.prototype.copy = function () {
                    return new util.DataBuffer(this);
                };
                util.DataBuffer.prototype.compact = function () {
                    if (this.read > 0) {
                        var src = new Uint8Array(this.data.buffer, this.read);
                        var dst = new Uint8Array(src.byteLength);
                        dst.set(src);
                        this.data = new DataView(dst);
                        this.write -= this.read;
                        this.read = 0;
                    }
                    return this;
                };
                util.DataBuffer.prototype.clear = function () {
                    this.data = new DataView(new ArrayBuffer(0));
                    this.read = this.write = 0;
                    return this;
                };
                util.DataBuffer.prototype.truncate = function (count) {
                    this.write = Math.max(0, this.length() - count);
                    this.read = Math.min(this.read, this.write);
                    return this;
                };
                util.DataBuffer.prototype.toHex = function () {
                    var rval = '';
                    for (var i = this.read; i < this.data.byteLength; ++i) {
                        var b = this.data.getUint8(i);
                        if (b < 16) {
                            rval += '0';
                        }
                        rval += b.toString(16);
                    }
                    return rval;
                };
                util.DataBuffer.prototype.toString = function (encoding) {
                    var view = new Uint8Array(this.data, this.read, this.length());
                    encoding = encoding || 'utf8';
                    if (encoding === 'binary' || encoding === 'raw') {
                        return util.binary.raw.encode(view);
                    }
                    if (encoding === 'hex') {
                        return util.binary.hex.encode(view);
                    }
                    if (encoding === 'base64') {
                        return util.binary.base64.encode(view);
                    }
                    if (encoding === 'utf8') {
                        return util.text.utf8.decode(view);
                    }
                    if (encoding === 'utf16') {
                        return util.text.utf16.decode(view);
                    }
                    throw new Error('Invalid encoding: ' + encoding);
                };
                util.createBuffer = function (input, encoding) {
                    encoding = encoding || 'raw';
                    if (input !== undefined && encoding === 'utf8') {
                        input = util.encodeUtf8(input);
                    }
                    return new util.ByteBuffer(input);
                };
                util.fillString = function (c, n) {
                    var s = '';
                    while (n > 0) {
                        if (n & 1) {
                            s += c;
                        }
                        n >>>= 1;
                        if (n > 0) {
                            c += c;
                        }
                    }
                    return s;
                };
                util.xorBytes = function (s1, s2, n) {
                    var s3 = '';
                    var b = '';
                    var t = '';
                    var i = 0;
                    var c = 0;
                    for (; n > 0; --n, ++i) {
                        b = s1.charCodeAt(i) ^ s2.charCodeAt(i);
                        if (c >= 10) {
                            s3 += t;
                            t = '';
                            c = 0;
                        }
                        t += String.fromCharCode(b);
                        ++c;
                    }
                    s3 += t;
                    return s3;
                };
                util.bytesToHex = function (bytes) {
                    return util.createBuffer(bytes).toHex();
                };
                util.int32ToBytes = function (i) {
                    return (String.fromCharCode(i >> 24 & 0xFF) +
                        String.fromCharCode(i >> 16 & 0xFF) +
                        String.fromCharCode(i >> 8 & 0xFF) +
                        String.fromCharCode(i & 0xFF));
                };
                var _base64 = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789+/=';
                var _base64Idx = [
                    62, -1, -1, -1, 63,
                    52, 53, 54, 55, 56, 57, 58, 59, 60, 61,
                    -1, -1, -1, 64, -1, -1, -1,
                    0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12,
                    13, 14, 15, 16, 17, 18, 19, 20, 21, 22, 23, 24, 25,
                    -1, -1, -1, -1, -1, -1,
                    26, 27, 28, 29, 30, 31, 32, 33, 34, 35, 36, 37, 38,
                    39, 40, 41, 42, 43, 44, 45, 46, 47, 48, 49, 50, 51
                ];
                var _base58 = '123456789ABCDEFGHJKLMNPQRSTUVWXYZabcdefghijkmnopqrstuvwxyz';
                util.encode64 = function (input, maxline) {
                    var line = '';
                    var output = '';
                    var chr1, chr2, chr3;
                    var i = 0;
                    while (i < input.length) {
                        chr1 = input.charCodeAt(i++);
                        chr2 = input.charCodeAt(i++);
                        chr3 = input.charCodeAt(i++);
                        line += _base64.charAt(chr1 >> 2);
                        line += _base64.charAt(((chr1 & 3) << 4) | (chr2 >> 4));
                        if (isNaN(chr2)) {
                            line += '==';
                        }
                        else {
                            line += _base64.charAt(((chr2 & 15) << 2) | (chr3 >> 6));
                            line += isNaN(chr3) ? '=' : _base64.charAt(chr3 & 63);
                        }
                        if (maxline && line.length > maxline) {
                            output += line.substr(0, maxline) + '\r\n';
                            line = line.substr(maxline);
                        }
                    }
                    output += line;
                    return output;
                };
                util.decode64 = function (input) {
                    input = input.replace(/[^A-Za-z0-9\+\/\=]/g, '');
                    var output = '';
                    var enc1, enc2, enc3, enc4;
                    var i = 0;
                    while (i < input.length) {
                        enc1 = _base64Idx[input.charCodeAt(i++) - 43];
                        enc2 = _base64Idx[input.charCodeAt(i++) - 43];
                        enc3 = _base64Idx[input.charCodeAt(i++) - 43];
                        enc4 = _base64Idx[input.charCodeAt(i++) - 43];
                        output += String.fromCharCode((enc1 << 2) | (enc2 >> 4));
                        if (enc3 !== 64) {
                            output += String.fromCharCode(((enc2 & 15) << 4) | (enc3 >> 2));
                            if (enc4 !== 64) {
                                output += String.fromCharCode(((enc3 & 3) << 6) | enc4);
                            }
                        }
                    }
                    return output;
                };
                util.encodeUtf8 = function (str) {
                    return unescape(encodeURIComponent(str));
                };
                util.decodeUtf8 = function (str) {
                    return decodeURIComponent(escape(str));
                };
                util.binary = {
                    raw: {},
                    hex: {},
                    base64: {},
                    base58: {},
                    baseN: {
                        encode: baseN.encode,
                        decode: baseN.decode
                    }
                };
                util.binary.raw.encode = function (bytes) {
                    return String.fromCharCode.apply(null, bytes);
                };
                util.binary.raw.decode = function (str, output, offset) {
                    var out = output;
                    if (!out) {
                        out = new Uint8Array(str.length);
                    }
                    offset = offset || 0;
                    var j = offset;
                    for (var i = 0; i < str.length; ++i) {
                        out[j++] = str.charCodeAt(i);
                    }
                    return output ? (j - offset) : out;
                };
                util.binary.hex.encode = util.bytesToHex;
                util.binary.hex.decode = function (hex, output, offset) {
                    var out = output;
                    if (!out) {
                        out = new Uint8Array(Math.ceil(hex.length / 2));
                    }
                    offset = offset || 0;
                    var i = 0, j = offset;
                    if (hex.length & 1) {
                        i = 1;
                        out[j++] = parseInt(hex[0], 16);
                    }
                    for (; i < hex.length; i += 2) {
                        out[j++] = parseInt(hex.substr(i, 2), 16);
                    }
                    return output ? (j - offset) : out;
                };
                util.binary.base64.encode = function (input, maxline) {
                    var line = '';
                    var output = '';
                    var chr1, chr2, chr3;
                    var i = 0;
                    while (i < input.byteLength) {
                        chr1 = input[i++];
                        chr2 = input[i++];
                        chr3 = input[i++];
                        line += _base64.charAt(chr1 >> 2);
                        line += _base64.charAt(((chr1 & 3) << 4) | (chr2 >> 4));
                        if (isNaN(chr2)) {
                            line += '==';
                        }
                        else {
                            line += _base64.charAt(((chr2 & 15) << 2) | (chr3 >> 6));
                            line += isNaN(chr3) ? '=' : _base64.charAt(chr3 & 63);
                        }
                        if (maxline && line.length > maxline) {
                            output += line.substr(0, maxline) + '\r\n';
                            line = line.substr(maxline);
                        }
                    }
                    output += line;
                    return output;
                };
                util.binary.base64.decode = function (input, output, offset) {
                    var out = output;
                    if (!out) {
                        out = new Uint8Array(Math.ceil(input.length / 4) * 3);
                    }
                    input = input.replace(/[^A-Za-z0-9\+\/\=]/g, '');
                    offset = offset || 0;
                    var enc1, enc2, enc3, enc4;
                    var i = 0, j = offset;
                    while (i < input.length) {
                        enc1 = _base64Idx[input.charCodeAt(i++) - 43];
                        enc2 = _base64Idx[input.charCodeAt(i++) - 43];
                        enc3 = _base64Idx[input.charCodeAt(i++) - 43];
                        enc4 = _base64Idx[input.charCodeAt(i++) - 43];
                        out[j++] = (enc1 << 2) | (enc2 >> 4);
                        if (enc3 !== 64) {
                            out[j++] = ((enc2 & 15) << 4) | (enc3 >> 2);
                            if (enc4 !== 64) {
                                out[j++] = ((enc3 & 3) << 6) | enc4;
                            }
                        }
                    }
                    return output ? (j - offset) : out.subarray(0, j);
                };
                util.binary.base58.encode = function (input, maxline) {
                    return util.binary.baseN.encode(input, _base58, maxline);
                };
                util.binary.base58.decode = function (input, maxline) {
                    return util.binary.baseN.decode(input, _base58, maxline);
                };
                util.text = {
                    utf8: {},
                    utf16: {}
                };
                util.text.utf8.encode = function (str, output, offset) {
                    str = util.encodeUtf8(str);
                    var out = output;
                    if (!out) {
                        out = new Uint8Array(str.length);
                    }
                    offset = offset || 0;
                    var j = offset;
                    for (var i = 0; i < str.length; ++i) {
                        out[j++] = str.charCodeAt(i);
                    }
                    return output ? (j - offset) : out;
                };
                util.text.utf8.decode = function (bytes) {
                    return util.decodeUtf8(String.fromCharCode.apply(null, bytes));
                };
                util.text.utf16.encode = function (str, output, offset) {
                    var out = output;
                    if (!out) {
                        out = new Uint8Array(str.length * 2);
                    }
                    var view = new Uint16Array(out.buffer);
                    offset = offset || 0;
                    var j = offset;
                    var k = offset;
                    for (var i = 0; i < str.length; ++i) {
                        view[k++] = str.charCodeAt(i);
                        j += 2;
                    }
                    return output ? (j - offset) : out;
                };
                util.text.utf16.decode = function (bytes) {
                    return String.fromCharCode.apply(null, new Uint16Array(bytes.buffer));
                };
                util.deflate = function (api, bytes, raw) {
                    bytes = util.decode64(api.deflate(util.encode64(bytes)).rval);
                    if (raw) {
                        var start = 2;
                        var flg = bytes.charCodeAt(1);
                        if (flg & 0x20) {
                            start = 6;
                        }
                        bytes = bytes.substring(start, bytes.length - 4);
                    }
                    return bytes;
                };
                util.inflate = function (api, bytes, raw) {
                    var rval = api.inflate(util.encode64(bytes)).rval;
                    return (rval === null) ? null : util.decode64(rval);
                };
                var _setStorageObject = function (api, id, obj) {
                    if (!api) {
                        throw new Error('WebStorage not available.');
                    }
                    var rval;
                    if (obj === null) {
                        rval = api.removeItem(id);
                    }
                    else {
                        obj = util.encode64(JSON.stringify(obj));
                        rval = api.setItem(id, obj);
                    }
                    if (typeof (rval) !== 'undefined' && rval.rval !== true) {
                        var error = new Error(rval.error.message);
                        error.id = rval.error.id;
                        error.name = rval.error.name;
                        throw error;
                    }
                };
                var _getStorageObject = function (api, id) {
                    if (!api) {
                        throw new Error('WebStorage not available.');
                    }
                    var rval = api.getItem(id);
                    if (api.init) {
                        if (rval.rval === null) {
                            if (rval.error) {
                                var error = new Error(rval.error.message);
                                error.id = rval.error.id;
                                error.name = rval.error.name;
                                throw error;
                            }
                            rval = null;
                        }
                        else {
                            rval = rval.rval;
                        }
                    }
                    if (rval !== null) {
                        rval = JSON.parse(util.decode64(rval));
                    }
                    return rval;
                };
                var _setItem = function (api, id, key, data) {
                    var obj = _getStorageObject(api, id);
                    if (obj === null) {
                        obj = {};
                    }
                    obj[key] = data;
                    _setStorageObject(api, id, obj);
                };
                var _getItem = function (api, id, key) {
                    var rval = _getStorageObject(api, id);
                    if (rval !== null) {
                        rval = (key in rval) ? rval[key] : null;
                    }
                    return rval;
                };
                var _removeItem = function (api, id, key) {
                    var obj = _getStorageObject(api, id);
                    if (obj !== null && key in obj) {
                        delete obj[key];
                        var empty = true;
                        for (var prop in obj) {
                            empty = false;
                            break;
                        }
                        if (empty) {
                            obj = null;
                        }
                        _setStorageObject(api, id, obj);
                    }
                };
                var _clearItems = function (api, id) {
                    _setStorageObject(api, id, null);
                };
                var _callStorageFunction = function (func, args, location) {
                    var rval = null;
                    if (typeof (location) === 'undefined') {
                        location = ['web', 'flash'];
                    }
                    var type;
                    var done = false;
                    var exception = null;
                    for (var idx in location) {
                        type = location[idx];
                        try {
                            if (type === 'flash' || type === 'both') {
                                if (args[0] === null) {
                                    throw new Error('Flash local storage not available.');
                                }
                                rval = func.apply(this, args);
                                done = (type === 'flash');
                            }
                            if (type === 'web' || type === 'both') {
                                args[0] = localStorage;
                                rval = func.apply(this, args);
                                done = true;
                            }
                        }
                        catch (ex) {
                            exception = ex;
                        }
                        if (done) {
                            break;
                        }
                    }
                    if (!done) {
                        throw exception;
                    }
                    return rval;
                };
                util.setItem = function (api, id, key, data, location) {
                    _callStorageFunction(_setItem, arguments, location);
                };
                util.getItem = function (api, id, key, location) {
                    return _callStorageFunction(_getItem, arguments, location);
                };
                util.removeItem = function (api, id, key, location) {
                    _callStorageFunction(_removeItem, arguments, location);
                };
                util.clearItems = function (api, id, location) {
                    _callStorageFunction(_clearItems, arguments, location);
                };
                util.parseUrl = function (str) {
                    var regex = /^(https?):\/\/([^:&^\/]*):?(\d*)(.*)$/g;
                    regex.lastIndex = 0;
                    var m = regex.exec(str);
                    var url = (m === null) ? null : {
                        full: str,
                        scheme: m[1],
                        host: m[2],
                        port: m[3],
                        path: m[4]
                    };
                    if (url) {
                        url.fullHost = url.host;
                        if (url.port) {
                            if (url.port !== 80 && url.scheme === 'http') {
                                url.fullHost += ':' + url.port;
                            }
                            else if (url.port !== 443 && url.scheme === 'https') {
                                url.fullHost += ':' + url.port;
                            }
                        }
                        else if (url.scheme === 'http') {
                            url.port = 80;
                        }
                        else if (url.scheme === 'https') {
                            url.port = 443;
                        }
                        url.full = url.scheme + '://' + url.fullHost;
                    }
                    return url;
                };
                var _queryVariables = null;
                util.getQueryVariables = function (query) {
                    var parse = function (q) {
                        var rval = {};
                        var kvpairs = q.split('&');
                        for (var i = 0; i < kvpairs.length; i++) {
                            var pos = kvpairs[i].indexOf('=');
                            var key;
                            var val;
                            if (pos > 0) {
                                key = kvpairs[i].substring(0, pos);
                                val = kvpairs[i].substring(pos + 1);
                            }
                            else {
                                key = kvpairs[i];
                                val = null;
                            }
                            if (!(key in rval)) {
                                rval[key] = [];
                            }
                            if (!(key in Object.prototype) && val !== null) {
                                rval[key].push(unescape(val));
                            }
                        }
                        return rval;
                    };
                    var rval;
                    if (typeof (query) === 'undefined') {
                        if (_queryVariables === null) {
                            if (typeof (window) !== 'undefined' && window.location && window.location.search) {
                                _queryVariables = parse(window.location.search.substring(1));
                            }
                            else {
                                _queryVariables = {};
                            }
                        }
                        rval = _queryVariables;
                    }
                    else {
                        rval = parse(query);
                    }
                    return rval;
                };
                util.parseFragment = function (fragment) {
                    var fp = fragment;
                    var fq = '';
                    var pos = fragment.indexOf('?');
                    if (pos > 0) {
                        fp = fragment.substring(0, pos);
                        fq = fragment.substring(pos + 1);
                    }
                    var path = fp.split('/');
                    if (path.length > 0 && path[0] === '') {
                        path.shift();
                    }
                    var query = (fq === '') ? {} : util.getQueryVariables(fq);
                    return {
                        pathString: fp,
                        queryString: fq,
                        path: path,
                        query: query
                    };
                };
                util.makeRequest = function (reqString) {
                    var frag = util.parseFragment(reqString);
                    var req = {
                        path: frag.pathString,
                        query: frag.queryString,
                        getPath: function (i) {
                            return (typeof (i) === 'undefined') ? frag.path : frag.path[i];
                        },
                        getQuery: function (k, i) {
                            var rval;
                            if (typeof (k) === 'undefined') {
                                rval = frag.query;
                            }
                            else {
                                rval = frag.query[k];
                                if (rval && typeof (i) !== 'undefined') {
                                    rval = rval[i];
                                }
                            }
                            return rval;
                        },
                        getQueryLast: function (k, _default) {
                            var rval;
                            var vals = req.getQuery(k);
                            if (vals) {
                                rval = vals[vals.length - 1];
                            }
                            else {
                                rval = _default;
                            }
                            return rval;
                        }
                    };
                    return req;
                };
                util.setPath = function (object, keys, value) {
                    if (typeof (object) === 'object' && object !== null) {
                        var i = 0;
                        var len = keys.length;
                        while (i < len) {
                            var next = keys[i++];
                            if (i == len) {
                                object[next] = value;
                            }
                            else {
                                var hasNext = (next in object);
                                if (!hasNext ||
                                    (hasNext && typeof (object[next]) !== 'object') ||
                                    (hasNext && object[next] === null)) {
                                    object[next] = {};
                                }
                                object = object[next];
                            }
                        }
                    }
                };
                util.getPath = function (object, keys, _default) {
                    var i = 0;
                    var len = keys.length;
                    var hasNext = true;
                    while (hasNext && i < len &&
                        typeof (object) === 'object' && object !== null) {
                        var next = keys[i++];
                        hasNext = next in object;
                        if (hasNext) {
                            object = object[next];
                        }
                    }
                    return (hasNext ? object : _default);
                };
                util.deletePath = function (object, keys) {
                    if (typeof (object) === 'object' && object !== null) {
                        var i = 0;
                        var len = keys.length;
                        while (i < len) {
                            var next = keys[i++];
                            if (i == len) {
                                delete object[next];
                            }
                            else {
                                if (!(next in object) ||
                                    (typeof (object[next]) !== 'object') ||
                                    (object[next] === null)) {
                                    break;
                                }
                                object = object[next];
                            }
                        }
                    }
                };
                util.isEmpty = function (obj) {
                    for (var prop in obj) {
                        if (obj.hasOwnProperty(prop)) {
                            return false;
                        }
                    }
                    return true;
                };
                util.format = function (format) {
                    var re = /%./g;
                    var match;
                    var part;
                    var argi = 0;
                    var parts = [];
                    var last = 0;
                    while ((match = re.exec(format))) {
                        part = format.substring(last, re.lastIndex - 2);
                        if (part.length > 0) {
                            parts.push(part);
                        }
                        last = re.lastIndex;
                        var code = match[0][1];
                        switch (code) {
                            case 's':
                            case 'o':
                                if (argi < arguments.length) {
                                    parts.push(arguments[argi++ + 1]);
                                }
                                else {
                                    parts.push('<?>');
                                }
                                break;
                            case '%':
                                parts.push('%');
                                break;
                            default:
                                parts.push('<%' + code + '?>');
                        }
                    }
                    parts.push(format.substring(last));
                    return parts.join('');
                };
                util.formatNumber = function (number, decimals, dec_point, thousands_sep) {
                    var n = number, c = isNaN(decimals = Math.abs(decimals)) ? 2 : decimals;
                    var d = dec_point === undefined ? ',' : dec_point;
                    var t = thousands_sep === undefined ?
                        '.' : thousands_sep, s = n < 0 ? '-' : '';
                    var i = parseInt((n = Math.abs(+n || 0).toFixed(c)), 10) + '';
                    var j = (i.length > 3) ? i.length % 3 : 0;
                    return s + (j ? i.substr(0, j) + t : '') +
                        i.substr(j).replace(/(\d{3})(?=\d)/g, '$1' + t) +
                        (c ? d + Math.abs(n - i).toFixed(c).slice(2) : '');
                };
                util.formatSize = function (size) {
                    if (size >= 1073741824) {
                        size = util.formatNumber(size / 1073741824, 2, '.', '') + ' GiB';
                    }
                    else if (size >= 1048576) {
                        size = util.formatNumber(size / 1048576, 2, '.', '') + ' MiB';
                    }
                    else if (size >= 1024) {
                        size = util.formatNumber(size / 1024, 0) + ' KiB';
                    }
                    else {
                        size = util.formatNumber(size, 0) + ' bytes';
                    }
                    return size;
                };
                util.bytesFromIP = function (ip) {
                    if (ip.indexOf('.') !== -1) {
                        return util.bytesFromIPv4(ip);
                    }
                    if (ip.indexOf(':') !== -1) {
                        return util.bytesFromIPv6(ip);
                    }
                    return null;
                };
                util.bytesFromIPv4 = function (ip) {
                    ip = ip.split('.');
                    if (ip.length !== 4) {
                        return null;
                    }
                    var b = util.createBuffer();
                    for (var i = 0; i < ip.length; ++i) {
                        var num = parseInt(ip[i], 10);
                        if (isNaN(num)) {
                            return null;
                        }
                        b.putByte(num);
                    }
                    return b.getBytes();
                };
                util.bytesToIP = function (bytes) {
                    if (bytes.length === 4) {
                        return util.bytesToIPv4(bytes);
                    }
                    if (bytes.length === 16) {
                        return util.bytesToIPv6(bytes);
                    }
                    return null;
                };
                util.bytesToIPv4 = function (bytes) {
                    if (bytes.length !== 4) {
                        return null;
                    }
                    var ip = [];
                    for (var i = 0; i < bytes.length; ++i) {
                        ip.push(bytes.charCodeAt(i));
                    }
                    return ip.join('.');
                };
                util.bytesToIPv6 = function (bytes) {
                    if (bytes.length !== 16) {
                        return null;
                    }
                    var ip = [];
                    var zeroGroups = [];
                    var zeroMaxGroup = 0;
                    for (var i = 0; i < bytes.length; i += 2) {
                        var hex = util.bytesToHex(bytes[i] + bytes[i + 1]);
                        while (hex[0] === '0' && hex !== '0') {
                            hex = hex.substr(1);
                        }
                        if (hex === '0') {
                            var last = zeroGroups[zeroGroups.length - 1];
                            var idx = ip.length;
                            if (!last || idx !== last.end + 1) {
                                zeroGroups.push({ start: idx, end: idx });
                            }
                            else {
                                last.end = idx;
                                if ((last.end - last.start) >
                                    (zeroGroups[zeroMaxGroup].end - zeroGroups[zeroMaxGroup].start)) {
                                    zeroMaxGroup = zeroGroups.length - 1;
                                }
                            }
                        }
                        ip.push(hex);
                    }
                    if (zeroGroups.length > 0) {
                        var group = zeroGroups[zeroMaxGroup];
                        if (group.end - group.start > 0) {
                            ip.splice(group.start, group.end - group.start + 1, '');
                            if (group.start === 0) {
                                ip.unshift('');
                            }
                            if (group.end === 7) {
                                ip.push('');
                            }
                        }
                    }
                    return ip.join(':');
                };
                util.estimateCores = function (options, callback) {
                    if (typeof options === 'function') {
                        callback = options;
                        options = {};
                    }
                    options = options || {};
                    if ('cores' in util && !options.update) {
                        return callback(null, util.cores);
                    }
                    if (typeof navigator !== 'undefined' &&
                        'hardwareConcurrency' in navigator &&
                        navigator.hardwareConcurrency > 0) {
                        util.cores = navigator.hardwareConcurrency;
                        return callback(null, util.cores);
                    }
                    if (typeof Worker === 'undefined') {
                        util.cores = 1;
                        return callback(null, util.cores);
                    }
                    if (typeof Blob === 'undefined') {
                        util.cores = 2;
                        return callback(null, util.cores);
                    }
                    var blobUrl = URL.createObjectURL(new Blob(['(',
                        function () {
                            self.addEventListener('message', function (e) {
                                var st = Date.now();
                                var et = st + 4;
                                while (Date.now() < et)
                                    ;
                                self.postMessage({ st: st, et: et });
                            });
                        }.toString(),
                        ')()'], { type: 'application/javascript' }));
                    sample([], 5, 16);
                    function sample(max, samples, numWorkers) {
                        if (samples === 0) {
                            var avg = Math.floor(max.reduce(function (avg, x) {
                                return avg + x;
                            }, 0) / max.length);
                            util.cores = Math.max(1, avg);
                            URL.revokeObjectURL(blobUrl);
                            return callback(null, util.cores);
                        }
                        map(numWorkers, function (err, results) {
                            max.push(reduce(numWorkers, results));
                            sample(max, samples - 1, numWorkers);
                        });
                    }
                    function map(numWorkers, callback) {
                        var workers = [];
                        var results = [];
                        for (var i = 0; i < numWorkers; ++i) {
                            var worker = new Worker(blobUrl);
                            worker.addEventListener('message', function (e) {
                                results.push(e.data);
                                if (results.length === numWorkers) {
                                    for (var i = 0; i < numWorkers; ++i) {
                                        workers[i].terminate();
                                    }
                                    callback(null, results);
                                }
                            });
                            workers.push(worker);
                        }
                        for (var i = 0; i < numWorkers; ++i) {
                            workers[i].postMessage(i);
                        }
                    }
                    function reduce(numWorkers, results) {
                        var overlaps = [];
                        for (var n = 0; n < numWorkers; ++n) {
                            var r1 = results[n];
                            var overlap = overlaps[n] = [];
                            for (var i = 0; i < numWorkers; ++i) {
                                if (n === i) {
                                    continue;
                                }
                                var r2 = results[i];
                                if ((r1.st > r2.st && r1.st < r2.et) ||
                                    (r2.st > r1.st && r2.st < r1.et)) {
                                    overlap.push(i);
                                }
                            }
                        }
                        return overlaps.reduce(function (max, overlap) {
                            return Math.max(max, overlap.length);
                        }, 0);
                    }
                };
            }.call(exports, __webpack_require__(6)));
        }),
        (function (module, exports, __webpack_require__) {
            var forge = __webpack_require__(0);
            __webpack_require__(1);
            module.exports = forge.cipher = forge.cipher || {};
            forge.cipher.algorithms = forge.cipher.algorithms || {};
            forge.cipher.createCipher = function (algorithm, key) {
                var api = algorithm;
                if (typeof api === 'string') {
                    api = forge.cipher.getAlgorithm(api);
                    if (api) {
                        api = api();
                    }
                }
                if (!api) {
                    throw new Error('Unsupported algorithm: ' + algorithm);
                }
                return new forge.cipher.BlockCipher({
                    algorithm: api,
                    key: key,
                    decrypt: false
                });
            };
            forge.cipher.createDecipher = function (algorithm, key) {
                var api = algorithm;
                if (typeof api === 'string') {
                    api = forge.cipher.getAlgorithm(api);
                    if (api) {
                        api = api();
                    }
                }
                if (!api) {
                    throw new Error('Unsupported algorithm: ' + algorithm);
                }
                return new forge.cipher.BlockCipher({
                    algorithm: api,
                    key: key,
                    decrypt: true
                });
            };
            forge.cipher.registerAlgorithm = function (name, algorithm) {
                name = name.toUpperCase();
                forge.cipher.algorithms[name] = algorithm;
            };
            forge.cipher.getAlgorithm = function (name) {
                name = name.toUpperCase();
                if (name in forge.cipher.algorithms) {
                    return forge.cipher.algorithms[name];
                }
                return null;
            };
            var BlockCipher = forge.cipher.BlockCipher = function (options) {
                this.algorithm = options.algorithm;
                this.mode = this.algorithm.mode;
                this.blockSize = this.mode.blockSize;
                this._finish = false;
                this._input = null;
                this.output = null;
                this._op = options.decrypt ? this.mode.decrypt : this.mode.encrypt;
                this._decrypt = options.decrypt;
                this.algorithm.initialize(options);
            };
            BlockCipher.prototype.start = function (options) {
                options = options || {};
                var opts = {};
                for (var key in options) {
                    opts[key] = options[key];
                }
                opts.decrypt = this._decrypt;
                this._finish = false;
                this._input = forge.util.createBuffer();
                this.output = options.output || forge.util.createBuffer();
                this.mode.start(opts);
            };
            BlockCipher.prototype.update = function (input) {
                if (input) {
                    this._input.putBuffer(input);
                }
                while (!this._op.call(this.mode, this._input, this.output, this._finish) &&
                    !this._finish) { }
                this._input.compact();
            };
            BlockCipher.prototype.finish = function (pad) {
                if (pad && (this.mode.name === 'ECB' || this.mode.name === 'CBC')) {
                    this.mode.pad = function (input) {
                        return pad(this.blockSize, input, false);
                    };
                    this.mode.unpad = function (output) {
                        return pad(this.blockSize, output, true);
                    };
                }
                var options = {};
                options.decrypt = this._decrypt;
                options.overflow = this._input.length() % this.blockSize;
                if (!this._decrypt && this.mode.pad) {
                    if (!this.mode.pad(this._input, options)) {
                        return false;
                    }
                }
                this._finish = true;
                this.update();
                if (this._decrypt && this.mode.unpad) {
                    if (!this.mode.unpad(this.output, options)) {
                        return false;
                    }
                }
                if (this.mode.afterFinish) {
                    if (!this.mode.afterFinish(this.output, options)) {
                        return false;
                    }
                }
                return true;
            };
        }),
        (function (module, exports, __webpack_require__) {
            var forge = __webpack_require__(0);
            __webpack_require__(1);
            forge.cipher = forge.cipher || {};
            var modes = module.exports = forge.cipher.modes = forge.cipher.modes || {};
            modes.ecb = function (options) {
                options = options || {};
                this.name = 'ECB';
                this.cipher = options.cipher;
                this.blockSize = options.blockSize || 16;
                this._ints = this.blockSize / 4;
                this._inBlock = new Array(this._ints);
                this._outBlock = new Array(this._ints);
            };
            modes.ecb.prototype.start = function (options) { };
            modes.ecb.prototype.encrypt = function (input, output, finish) {
                if (input.length() < this.blockSize && !(finish && input.length() > 0)) {
                    return true;
                }
                for (var i = 0; i < this._ints; ++i) {
                    this._inBlock[i] = input.getInt32();
                }
                this.cipher.encrypt(this._inBlock, this._outBlock);
                for (var i = 0; i < this._ints; ++i) {
                    output.putInt32(this._outBlock[i]);
                }
            };
            modes.ecb.prototype.decrypt = function (input, output, finish) {
                if (input.length() < this.blockSize && !(finish && input.length() > 0)) {
                    return true;
                }
                for (var i = 0; i < this._ints; ++i) {
                    this._inBlock[i] = input.getInt32();
                }
                this.cipher.decrypt(this._inBlock, this._outBlock);
                for (var i = 0; i < this._ints; ++i) {
                    output.putInt32(this._outBlock[i]);
                }
            };
            modes.ecb.prototype.pad = function (input, options) {
                var padding = (input.length() === this.blockSize ?
                    this.blockSize : (this.blockSize - input.length()));
                input.fillWithByte(padding, padding);
                return true;
            };
            modes.ecb.prototype.unpad = function (output, options) {
                if (options.overflow > 0) {
                    return false;
                }
                var len = output.length();
                var count = output.at(len - 1);
                if (count > (this.blockSize << 2)) {
                    return false;
                }
                output.truncate(count);
                return true;
            };
            modes.cbc = function (options) {
                options = options || {};
                this.name = 'CBC';
                this.cipher = options.cipher;
                this.blockSize = options.blockSize || 16;
                this._ints = this.blockSize / 4;
                this._inBlock = new Array(this._ints);
                this._outBlock = new Array(this._ints);
            };
            modes.cbc.prototype.start = function (options) {
                if (options.iv === null) {
                    if (!this._prev) {
                        throw new Error('Invalid IV parameter.');
                    }
                    this._iv = this._prev.slice(0);
                }
                else if (!('iv' in options)) {
                    throw new Error('Invalid IV parameter.');
                }
                else {
                    this._iv = transformIV(options.iv, this.blockSize);
                    this._prev = this._iv.slice(0);
                }
            };
            modes.cbc.prototype.encrypt = function (input, output, finish) {
                if (input.length() < this.blockSize && !(finish && input.length() > 0)) {
                    return true;
                }
                for (var i = 0; i < this._ints; ++i) {
                    this._inBlock[i] = this._prev[i] ^ input.getInt32();
                }
                this.cipher.encrypt(this._inBlock, this._outBlock);
                for (var i = 0; i < this._ints; ++i) {
                    output.putInt32(this._outBlock[i]);
                }
                this._prev = this._outBlock;
            };
            modes.cbc.prototype.decrypt = function (input, output, finish) {
                if (input.length() < this.blockSize && !(finish && input.length() > 0)) {
                    return true;
                }
                for (var i = 0; i < this._ints; ++i) {
                    this._inBlock[i] = input.getInt32();
                }
                this.cipher.decrypt(this._inBlock, this._outBlock);
                for (var i = 0; i < this._ints; ++i) {
                    output.putInt32(this._prev[i] ^ this._outBlock[i]);
                }
                this._prev = this._inBlock.slice(0);
            };
            modes.cbc.prototype.pad = function (input, options) {
                var padding = (input.length() === this.blockSize ?
                    this.blockSize : (this.blockSize - input.length()));
                input.fillWithByte(padding, padding);
                return true;
            };
            modes.cbc.prototype.unpad = function (output, options) {
                if (options.overflow > 0) {
                    return false;
                }
                var len = output.length();
                var count = output.at(len - 1);
                if (count > (this.blockSize << 2)) {
                    return false;
                }
                output.truncate(count);
                return true;
            };
            modes.cfb = function (options) {
                options = options || {};
                this.name = 'CFB';
                this.cipher = options.cipher;
                this.blockSize = options.blockSize || 16;
                this._ints = this.blockSize / 4;
                this._inBlock = null;
                this._outBlock = new Array(this._ints);
                this._partialBlock = new Array(this._ints);
                this._partialOutput = forge.util.createBuffer();
                this._partialBytes = 0;
            };
            modes.cfb.prototype.start = function (options) {
                if (!('iv' in options)) {
                    throw new Error('Invalid IV parameter.');
                }
                this._iv = transformIV(options.iv, this.blockSize);
                this._inBlock = this._iv.slice(0);
                this._partialBytes = 0;
            };
            modes.cfb.prototype.encrypt = function (input, output, finish) {
                var inputLength = input.length();
                if (inputLength === 0) {
                    return true;
                }
                this.cipher.encrypt(this._inBlock, this._outBlock);
                if (this._partialBytes === 0 && inputLength >= this.blockSize) {
                    for (var i = 0; i < this._ints; ++i) {
                        this._inBlock[i] = input.getInt32() ^ this._outBlock[i];
                        output.putInt32(this._inBlock[i]);
                    }
                    return;
                }
                var partialBytes = (this.blockSize - inputLength) % this.blockSize;
                if (partialBytes > 0) {
                    partialBytes = this.blockSize - partialBytes;
                }
                this._partialOutput.clear();
                for (var i = 0; i < this._ints; ++i) {
                    this._partialBlock[i] = input.getInt32() ^ this._outBlock[i];
                    this._partialOutput.putInt32(this._partialBlock[i]);
                }
                if (partialBytes > 0) {
                    input.read -= this.blockSize;
                }
                else {
                    for (var i = 0; i < this._ints; ++i) {
                        this._inBlock[i] = this._partialBlock[i];
                    }
                }
                if (this._partialBytes > 0) {
                    this._partialOutput.getBytes(this._partialBytes);
                }
                if (partialBytes > 0 && !finish) {
                    output.putBytes(this._partialOutput.getBytes(partialBytes - this._partialBytes));
                    this._partialBytes = partialBytes;
                    return true;
                }
                output.putBytes(this._partialOutput.getBytes(inputLength - this._partialBytes));
                this._partialBytes = 0;
            };
            modes.cfb.prototype.decrypt = function (input, output, finish) {
                var inputLength = input.length();
                if (inputLength === 0) {
                    return true;
                }
                this.cipher.encrypt(this._inBlock, this._outBlock);
                if (this._partialBytes === 0 && inputLength >= this.blockSize) {
                    for (var i = 0; i < this._ints; ++i) {
                        this._inBlock[i] = input.getInt32();
                        output.putInt32(this._inBlock[i] ^ this._outBlock[i]);
                    }
                    return;
                }
                var partialBytes = (this.blockSize - inputLength) % this.blockSize;
                if (partialBytes > 0) {
                    partialBytes = this.blockSize - partialBytes;
                }
                this._partialOutput.clear();
                for (var i = 0; i < this._ints; ++i) {
                    this._partialBlock[i] = input.getInt32();
                    this._partialOutput.putInt32(this._partialBlock[i] ^ this._outBlock[i]);
                }
                if (partialBytes > 0) {
                    input.read -= this.blockSize;
                }
                else {
                    for (var i = 0; i < this._ints; ++i) {
                        this._inBlock[i] = this._partialBlock[i];
                    }
                }
                if (this._partialBytes > 0) {
                    this._partialOutput.getBytes(this._partialBytes);
                }
                if (partialBytes > 0 && !finish) {
                    output.putBytes(this._partialOutput.getBytes(partialBytes - this._partialBytes));
                    this._partialBytes = partialBytes;
                    return true;
                }
                output.putBytes(this._partialOutput.getBytes(inputLength - this._partialBytes));
                this._partialBytes = 0;
            };
            modes.ofb = function (options) {
                options = options || {};
                this.name = 'OFB';
                this.cipher = options.cipher;
                this.blockSize = options.blockSize || 16;
                this._ints = this.blockSize / 4;
                this._inBlock = null;
                this._outBlock = new Array(this._ints);
                this._partialOutput = forge.util.createBuffer();
                this._partialBytes = 0;
            };
            modes.ofb.prototype.start = function (options) {
                if (!('iv' in options)) {
                    throw new Error('Invalid IV parameter.');
                }
                this._iv = transformIV(options.iv, this.blockSize);
                this._inBlock = this._iv.slice(0);
                this._partialBytes = 0;
            };
            modes.ofb.prototype.encrypt = function (input, output, finish) {
                var inputLength = input.length();
                if (input.length() === 0) {
                    return true;
                }
                this.cipher.encrypt(this._inBlock, this._outBlock);
                if (this._partialBytes === 0 && inputLength >= this.blockSize) {
                    for (var i = 0; i < this._ints; ++i) {
                        output.putInt32(input.getInt32() ^ this._outBlock[i]);
                        this._inBlock[i] = this._outBlock[i];
                    }
                    return;
                }
                var partialBytes = (this.blockSize - inputLength) % this.blockSize;
                if (partialBytes > 0) {
                    partialBytes = this.blockSize - partialBytes;
                }
                this._partialOutput.clear();
                for (var i = 0; i < this._ints; ++i) {
                    this._partialOutput.putInt32(input.getInt32() ^ this._outBlock[i]);
                }
                if (partialBytes > 0) {
                    input.read -= this.blockSize;
                }
                else {
                    for (var i = 0; i < this._ints; ++i) {
                        this._inBlock[i] = this._outBlock[i];
                    }
                }
                if (this._partialBytes > 0) {
                    this._partialOutput.getBytes(this._partialBytes);
                }
                if (partialBytes > 0 && !finish) {
                    output.putBytes(this._partialOutput.getBytes(partialBytes - this._partialBytes));
                    this._partialBytes = partialBytes;
                    return true;
                }
                output.putBytes(this._partialOutput.getBytes(inputLength - this._partialBytes));
                this._partialBytes = 0;
            };
            modes.ofb.prototype.decrypt = modes.ofb.prototype.encrypt;
            modes.ctr = function (options) {
                options = options || {};
                this.name = 'CTR';
                this.cipher = options.cipher;
                this.blockSize = options.blockSize || 16;
                this._ints = this.blockSize / 4;
                this._inBlock = null;
                this._outBlock = new Array(this._ints);
                this._partialOutput = forge.util.createBuffer();
                this._partialBytes = 0;
            };
            modes.ctr.prototype.start = function (options) {
                if (!('iv' in options)) {
                    throw new Error('Invalid IV parameter.');
                }
                this._iv = transformIV(options.iv, this.blockSize);
                this._inBlock = this._iv.slice(0);
                this._partialBytes = 0;
            };
            modes.ctr.prototype.encrypt = function (input, output, finish) {
                var inputLength = input.length();
                if (inputLength === 0) {
                    return true;
                }
                this.cipher.encrypt(this._inBlock, this._outBlock);
                if (this._partialBytes === 0 && inputLength >= this.blockSize) {
                    for (var i = 0; i < this._ints; ++i) {
                        output.putInt32(input.getInt32() ^ this._outBlock[i]);
                    }
                }
                else {
                    var partialBytes = (this.blockSize - inputLength) % this.blockSize;
                    if (partialBytes > 0) {
                        partialBytes = this.blockSize - partialBytes;
                    }
                    this._partialOutput.clear();
                    for (var i = 0; i < this._ints; ++i) {
                        this._partialOutput.putInt32(input.getInt32() ^ this._outBlock[i]);
                    }
                    if (partialBytes > 0) {
                        input.read -= this.blockSize;
                    }
                    if (this._partialBytes > 0) {
                        this._partialOutput.getBytes(this._partialBytes);
                    }
                    if (partialBytes > 0 && !finish) {
                        output.putBytes(this._partialOutput.getBytes(partialBytes - this._partialBytes));
                        this._partialBytes = partialBytes;
                        return true;
                    }
                    output.putBytes(this._partialOutput.getBytes(inputLength - this._partialBytes));
                    this._partialBytes = 0;
                }
                inc32(this._inBlock);
            };
            modes.ctr.prototype.decrypt = modes.ctr.prototype.encrypt;
            modes.gcm = function (options) {
                options = options || {};
                this.name = 'GCM';
                this.cipher = options.cipher;
                this.blockSize = options.blockSize || 16;
                this._ints = this.blockSize / 4;
                this._inBlock = new Array(this._ints);
                this._outBlock = new Array(this._ints);
                this._partialOutput = forge.util.createBuffer();
                this._partialBytes = 0;
                this._R = 0xE1000000;
            };
            modes.gcm.prototype.start = function (options) {
                if (!('iv' in options)) {
                    throw new Error('Invalid IV parameter.');
                }
                var iv = forge.util.createBuffer(options.iv);
                this._cipherLength = 0;
                var additionalData;
                if ('additionalData' in options) {
                    additionalData = forge.util.createBuffer(options.additionalData);
                }
                else {
                    additionalData = forge.util.createBuffer();
                }
                if ('tagLength' in options) {
                    this._tagLength = options.tagLength;
                }
                else {
                    this._tagLength = 128;
                }
                this._tag = null;
                if (options.decrypt) {
                    this._tag = forge.util.createBuffer(options.tag).getBytes();
                    if (this._tag.length !== (this._tagLength / 8)) {
                        throw new Error('Authentication tag does not match tag length.');
                    }
                }
                this._hashBlock = new Array(this._ints);
                this.tag = null;
                this._hashSubkey = new Array(this._ints);
                this.cipher.encrypt([0, 0, 0, 0], this._hashSubkey);
                this.componentBits = 4;
                this._m = this.generateHashTable(this._hashSubkey, this.componentBits);
                var ivLength = iv.length();
                if (ivLength === 12) {
                    this._j0 = [iv.getInt32(), iv.getInt32(), iv.getInt32(), 1];
                }
                else {
                    this._j0 = [0, 0, 0, 0];
                    while (iv.length() > 0) {
                        this._j0 = this.ghash(this._hashSubkey, this._j0, [iv.getInt32(), iv.getInt32(), iv.getInt32(), iv.getInt32()]);
                    }
                    this._j0 = this.ghash(this._hashSubkey, this._j0, [0, 0].concat(from64To32(ivLength * 8)));
                }
                this._inBlock = this._j0.slice(0);
                inc32(this._inBlock);
                this._partialBytes = 0;
                additionalData = forge.util.createBuffer(additionalData);
                this._aDataLength = from64To32(additionalData.length() * 8);
                var overflow = additionalData.length() % this.blockSize;
                if (overflow) {
                    additionalData.fillWithByte(0, this.blockSize - overflow);
                }
                this._s = [0, 0, 0, 0];
                while (additionalData.length() > 0) {
                    this._s = this.ghash(this._hashSubkey, this._s, [
                        additionalData.getInt32(),
                        additionalData.getInt32(),
                        additionalData.getInt32(),
                        additionalData.getInt32()
                    ]);
                }
            };
            modes.gcm.prototype.encrypt = function (input, output, finish) {
                var inputLength = input.length();
                if (inputLength === 0) {
                    return true;
                }
                this.cipher.encrypt(this._inBlock, this._outBlock);
                if (this._partialBytes === 0 && inputLength >= this.blockSize) {
                    for (var i = 0; i < this._ints; ++i) {
                        output.putInt32(this._outBlock[i] ^= input.getInt32());
                    }
                    this._cipherLength += this.blockSize;
                }
                else {
                    var partialBytes = (this.blockSize - inputLength) % this.blockSize;
                    if (partialBytes > 0) {
                        partialBytes = this.blockSize - partialBytes;
                    }
                    this._partialOutput.clear();
                    for (var i = 0; i < this._ints; ++i) {
                        this._partialOutput.putInt32(input.getInt32() ^ this._outBlock[i]);
                    }
                    if (partialBytes <= 0 || finish) {
                        if (finish) {
                            var overflow = inputLength % this.blockSize;
                            this._cipherLength += overflow;
                            this._partialOutput.truncate(this.blockSize - overflow);
                        }
                        else {
                            this._cipherLength += this.blockSize;
                        }
                        for (var i = 0; i < this._ints; ++i) {
                            this._outBlock[i] = this._partialOutput.getInt32();
                        }
                        this._partialOutput.read -= this.blockSize;
                    }
                    if (this._partialBytes > 0) {
                        this._partialOutput.getBytes(this._partialBytes);
                    }
                    if (partialBytes > 0 && !finish) {
                        input.read -= this.blockSize;
                        output.putBytes(this._partialOutput.getBytes(partialBytes - this._partialBytes));
                        this._partialBytes = partialBytes;
                        return true;
                    }
                    output.putBytes(this._partialOutput.getBytes(inputLength - this._partialBytes));
                    this._partialBytes = 0;
                }
                this._s = this.ghash(this._hashSubkey, this._s, this._outBlock);
                inc32(this._inBlock);
            };
            modes.gcm.prototype.decrypt = function (input, output, finish) {
                var inputLength = input.length();
                if (inputLength < this.blockSize && !(finish && inputLength > 0)) {
                    return true;
                }
                this.cipher.encrypt(this._inBlock, this._outBlock);
                inc32(this._inBlock);
                this._hashBlock[0] = input.getInt32();
                this._hashBlock[1] = input.getInt32();
                this._hashBlock[2] = input.getInt32();
                this._hashBlock[3] = input.getInt32();
                this._s = this.ghash(this._hashSubkey, this._s, this._hashBlock);
                for (var i = 0; i < this._ints; ++i) {
                    output.putInt32(this._outBlock[i] ^ this._hashBlock[i]);
                }
                if (inputLength < this.blockSize) {
                    this._cipherLength += inputLength % this.blockSize;
                }
                else {
                    this._cipherLength += this.blockSize;
                }
            };
            modes.gcm.prototype.afterFinish = function (output, options) {
                var rval = true;
                if (options.decrypt && options.overflow) {
                    output.truncate(this.blockSize - options.overflow);
                }
                this.tag = forge.util.createBuffer();
                var lengths = this._aDataLength.concat(from64To32(this._cipherLength * 8));
                this._s = this.ghash(this._hashSubkey, this._s, lengths);
                var tag = [];
                this.cipher.encrypt(this._j0, tag);
                for (var i = 0; i < this._ints; ++i) {
                    this.tag.putInt32(this._s[i] ^ tag[i]);
                }
                this.tag.truncate(this.tag.length() % (this._tagLength / 8));
                if (options.decrypt && this.tag.bytes() !== this._tag) {
                    rval = false;
                }
                return rval;
            };
            modes.gcm.prototype.multiply = function (x, y) {
                var z_i = [0, 0, 0, 0];
                var v_i = y.slice(0);
                for (var i = 0; i < 128; ++i) {
                    var x_i = x[(i / 32) | 0] & (1 << (31 - i % 32));
                    if (x_i) {
                        z_i[0] ^= v_i[0];
                        z_i[1] ^= v_i[1];
                        z_i[2] ^= v_i[2];
                        z_i[3] ^= v_i[3];
                    }
                    this.pow(v_i, v_i);
                }
                return z_i;
            };
            modes.gcm.prototype.pow = function (x, out) {
                var lsb = x[3] & 1;
                for (var i = 3; i > 0; --i) {
                    out[i] = (x[i] >>> 1) | ((x[i - 1] & 1) << 31);
                }
                out[0] = x[0] >>> 1;
                if (lsb) {
                    out[0] ^= this._R;
                }
            };
            modes.gcm.prototype.tableMultiply = function (x) {
                var z = [0, 0, 0, 0];
                for (var i = 0; i < 32; ++i) {
                    var idx = (i / 8) | 0;
                    var x_i = (x[idx] >>> ((7 - (i % 8)) * 4)) & 0xF;
                    var ah = this._m[i][x_i];
                    z[0] ^= ah[0];
                    z[1] ^= ah[1];
                    z[2] ^= ah[2];
                    z[3] ^= ah[3];
                }
                return z;
            };
            modes.gcm.prototype.ghash = function (h, y, x) {
                y[0] ^= x[0];
                y[1] ^= x[1];
                y[2] ^= x[2];
                y[3] ^= x[3];
                return this.tableMultiply(y);
            };
            modes.gcm.prototype.generateHashTable = function (h, bits) {
                var multiplier = 8 / bits;
                var perInt = 4 * multiplier;
                var size = 16 * multiplier;
                var m = new Array(size);
                for (var i = 0; i < size; ++i) {
                    var tmp = [0, 0, 0, 0];
                    var idx = (i / perInt) | 0;
                    var shft = ((perInt - 1 - (i % perInt)) * bits);
                    tmp[idx] = (1 << (bits - 1)) << shft;
                    m[i] = this.generateSubHashTable(this.multiply(tmp, h), bits);
                }
                return m;
            };
            modes.gcm.prototype.generateSubHashTable = function (mid, bits) {
                var size = 1 << bits;
                var half = size >>> 1;
                var m = new Array(size);
                m[half] = mid.slice(0);
                var i = half >>> 1;
                while (i > 0) {
                    this.pow(m[2 * i], m[i] = []);
                    i >>= 1;
                }
                i = 2;
                while (i < half) {
                    for (var j = 1; j < i; ++j) {
                        var m_i = m[i];
                        var m_j = m[j];
                        m[i + j] = [
                            m_i[0] ^ m_j[0],
                            m_i[1] ^ m_j[1],
                            m_i[2] ^ m_j[2],
                            m_i[3] ^ m_j[3]
                        ];
                    }
                    i *= 2;
                }
                m[0] = [0, 0, 0, 0];
                for (i = half + 1; i < size; ++i) {
                    var c = m[i ^ half];
                    m[i] = [mid[0] ^ c[0], mid[1] ^ c[1], mid[2] ^ c[2], mid[3] ^ c[3]];
                }
                return m;
            };
            function transformIV(iv, blockSize) {
                if (typeof iv === 'string') {
                    iv = forge.util.createBuffer(iv);
                }
                if (forge.util.isArray(iv) && iv.length > 4) {
                    var tmp = iv;
                    iv = forge.util.createBuffer();
                    for (var i = 0; i < tmp.length; ++i) {
                        iv.putByte(tmp[i]);
                    }
                }
                if (iv.length() < blockSize) {
                    throw new Error('Invalid IV length; got ' + iv.length() +
                        ' bytes and expected ' + blockSize + ' bytes.');
                }
                if (!forge.util.isArray(iv)) {
                    var ints = [];
                    var blocks = blockSize / 4;
                    for (var i = 0; i < blocks; ++i) {
                        ints.push(iv.getInt32());
                    }
                    iv = ints;
                }
                return iv;
            }
            function inc32(block) {
                block[block.length - 1] = (block[block.length - 1] + 1) & 0xFFFFFFFF;
            }
            function from64To32(num) {
                return [(num / 0x100000000) | 0, num & 0xFFFFFFFF];
            }
        }),
        (function (module, exports, __webpack_require__) {
            __webpack_require__(5);
            __webpack_require__(1);
            __webpack_require__(3);
            __webpack_require__(2);
            module.exports = __webpack_require__(0);
        }),
        (function (module, exports, __webpack_require__) {
            var forge = __webpack_require__(0);
            __webpack_require__(2);
            __webpack_require__(3);
            __webpack_require__(1);
            module.exports = forge.aes = forge.aes || {};
            forge.aes.startEncrypting = function (key, iv, output, mode) {
                var cipher = _createCipher({
                    key: key,
                    output: output,
                    decrypt: false,
                    mode: mode
                });
                cipher.start(iv);
                return cipher;
            };
            forge.aes.createEncryptionCipher = function (key, mode) {
                return _createCipher({
                    key: key,
                    output: null,
                    decrypt: false,
                    mode: mode
                });
            };
            forge.aes.startDecrypting = function (key, iv, output, mode) {
                var cipher = _createCipher({
                    key: key,
                    output: output,
                    decrypt: true,
                    mode: mode
                });
                cipher.start(iv);
                return cipher;
            };
            forge.aes.createDecryptionCipher = function (key, mode) {
                return _createCipher({
                    key: key,
                    output: null,
                    decrypt: true,
                    mode: mode
                });
            };
            forge.aes.Algorithm = function (name, mode) {
                if (!init) {
                    initialize();
                }
                var self = this;
                self.name = name;
                self.mode = new mode({
                    blockSize: 16,
                    cipher: {
                        encrypt: function (inBlock, outBlock) {
                            return _updateBlock(self._w, inBlock, outBlock, false);
                        },
                        decrypt: function (inBlock, outBlock) {
                            return _updateBlock(self._w, inBlock, outBlock, true);
                        }
                    }
                });
                self._init = false;
            };
            forge.aes.Algorithm.prototype.initialize = function (options) {
                if (this._init) {
                    return;
                }
                var key = options.key;
                var tmp;
                if (typeof key === 'string' &&
                    (key.length === 16 || key.length === 24 || key.length === 32)) {
                    key = forge.util.createBuffer(key);
                }
                else if (forge.util.isArray(key) &&
                    (key.length === 16 || key.length === 24 || key.length === 32)) {
                    tmp = key;
                    key = forge.util.createBuffer();
                    for (var i = 0; i < tmp.length; ++i) {
                        key.putByte(tmp[i]);
                    }
                }
                if (!forge.util.isArray(key)) {
                    tmp = key;
                    key = [];
                    var len = tmp.length();
                    if (len === 16 || len === 24 || len === 32) {
                        len = len >>> 2;
                        for (var i = 0; i < len; ++i) {
                            key.push(tmp.getInt32());
                        }
                    }
                }
                if (!forge.util.isArray(key) ||
                    !(key.length === 4 || key.length === 6 || key.length === 8)) {
                    throw new Error('Invalid key parameter.');
                }
                var mode = this.mode.name;
                var encryptOp = (['CFB', 'OFB', 'CTR', 'GCM'].indexOf(mode) !== -1);
                this._w = _expandKey(key, options.decrypt && !encryptOp);
                this._init = true;
            };
            forge.aes._expandKey = function (key, decrypt) {
                if (!init) {
                    initialize();
                }
                return _expandKey(key, decrypt);
            };
            forge.aes._updateBlock = _updateBlock;
            registerAlgorithm('AES-ECB', forge.cipher.modes.ecb);
            registerAlgorithm('AES-CBC', forge.cipher.modes.cbc);
            registerAlgorithm('AES-CFB', forge.cipher.modes.cfb);
            registerAlgorithm('AES-OFB', forge.cipher.modes.ofb);
            registerAlgorithm('AES-CTR', forge.cipher.modes.ctr);
            registerAlgorithm('AES-GCM', forge.cipher.modes.gcm);
            function registerAlgorithm(name, mode) {
                var factory = function () {
                    return new forge.aes.Algorithm(name, mode);
                };
                forge.cipher.registerAlgorithm(name, factory);
            }
            var init = false;
            var Nb = 4;
            var sbox;
            var isbox;
            var rcon;
            var mix;
            var imix;
            function initialize() {
                init = true;
                rcon = [0x00, 0x01, 0x02, 0x04, 0x08, 0x10, 0x20, 0x40, 0x80, 0x1B, 0x36];
                var xtime = new Array(256);
                for (var i = 0; i < 128; ++i) {
                    xtime[i] = i << 1;
                    xtime[i + 128] = (i + 128) << 1 ^ 0x11B;
                }
                sbox = new Array(256);
                isbox = new Array(256);
                mix = new Array(4);
                imix = new Array(4);
                for (var i = 0; i < 4; ++i) {
                    mix[i] = new Array(256);
                    imix[i] = new Array(256);
                }
                var e = 0, ei = 0, e2, e4, e8, sx, sx2, me, ime;
                for (var i = 0; i < 256; ++i) {
                    sx = ei ^ (ei << 1) ^ (ei << 2) ^ (ei << 3) ^ (ei << 4);
                    sx = (sx >> 8) ^ (sx & 255) ^ 0x63;
                    sbox[e] = sx;
                    isbox[sx] = e;
                    sx2 = xtime[sx];
                    e2 = xtime[e];
                    e4 = xtime[e2];
                    e8 = xtime[e4];
                    me =
                        (sx2 << 24) ^
                            (sx << 16) ^
                            (sx << 8) ^
                            (sx ^ sx2);
                    ime =
                        (e2 ^ e4 ^ e8) << 24 ^
                            (e ^ e8) << 16 ^
                            (e ^ e4 ^ e8) << 8 ^
                            (e ^ e2 ^ e8);
                    for (var n = 0; n < 4; ++n) {
                        mix[n][e] = me;
                        imix[n][sx] = ime;
                        me = me << 24 | me >>> 8;
                        ime = ime << 24 | ime >>> 8;
                    }
                    if (e === 0) {
                        e = ei = 1;
                    }
                    else {
                        e = e2 ^ xtime[xtime[xtime[e2 ^ e8]]];
                        ei ^= xtime[xtime[ei]];
                    }
                }
            }
            function _expandKey(key, decrypt) {
                var w = key.slice(0);
                var temp, iNk = 1;
                var Nk = w.length;
                var Nr1 = Nk + 6 + 1;
                var end = Nb * Nr1;
                for (var i = Nk; i < end; ++i) {
                    temp = w[i - 1];
                    if (i % Nk === 0) {
                        temp =
                            sbox[temp >>> 16 & 255] << 24 ^
                                sbox[temp >>> 8 & 255] << 16 ^
                                sbox[temp & 255] << 8 ^
                                sbox[temp >>> 24] ^ (rcon[iNk] << 24);
                        iNk++;
                    }
                    else if (Nk > 6 && (i % Nk === 4)) {
                        temp =
                            sbox[temp >>> 24] << 24 ^
                                sbox[temp >>> 16 & 255] << 16 ^
                                sbox[temp >>> 8 & 255] << 8 ^
                                sbox[temp & 255];
                    }
                    w[i] = w[i - Nk] ^ temp;
                }
                if (decrypt) {
                    var tmp;
                    var m0 = imix[0];
                    var m1 = imix[1];
                    var m2 = imix[2];
                    var m3 = imix[3];
                    var wnew = w.slice(0);
                    end = w.length;
                    for (var i = 0, wi = end - Nb; i < end; i += Nb, wi -= Nb) {
                        if (i === 0 || i === (end - Nb)) {
                            wnew[i] = w[wi];
                            wnew[i + 1] = w[wi + 3];
                            wnew[i + 2] = w[wi + 2];
                            wnew[i + 3] = w[wi + 1];
                        }
                        else {
                            for (var n = 0; n < Nb; ++n) {
                                tmp = w[wi + n];
                                wnew[i + (3 & -n)] =
                                    m0[sbox[tmp >>> 24]] ^
                                        m1[sbox[tmp >>> 16 & 255]] ^
                                        m2[sbox[tmp >>> 8 & 255]] ^
                                        m3[sbox[tmp & 255]];
                            }
                        }
                    }
                    w = wnew;
                }
                return w;
            }
            function _updateBlock(w, input, output, decrypt) {
                var Nr = w.length / 4 - 1;
                var m0, m1, m2, m3, sub;
                if (decrypt) {
                    m0 = imix[0];
                    m1 = imix[1];
                    m2 = imix[2];
                    m3 = imix[3];
                    sub = isbox;
                }
                else {
                    m0 = mix[0];
                    m1 = mix[1];
                    m2 = mix[2];
                    m3 = mix[3];
                    sub = sbox;
                }
                var a, b, c, d, a2, b2, c2;
                a = input[0] ^ w[0];
                b = input[decrypt ? 3 : 1] ^ w[1];
                c = input[2] ^ w[2];
                d = input[decrypt ? 1 : 3] ^ w[3];
                var i = 3;
                for (var round = 1; round < Nr; ++round) {
                    a2 =
                        m0[a >>> 24] ^
                            m1[b >>> 16 & 255] ^
                            m2[c >>> 8 & 255] ^
                            m3[d & 255] ^ w[++i];
                    b2 =
                        m0[b >>> 24] ^
                            m1[c >>> 16 & 255] ^
                            m2[d >>> 8 & 255] ^
                            m3[a & 255] ^ w[++i];
                    c2 =
                        m0[c >>> 24] ^
                            m1[d >>> 16 & 255] ^
                            m2[a >>> 8 & 255] ^
                            m3[b & 255] ^ w[++i];
                    d =
                        m0[d >>> 24] ^
                            m1[a >>> 16 & 255] ^
                            m2[b >>> 8 & 255] ^
                            m3[c & 255] ^ w[++i];
                    a = a2;
                    b = b2;
                    c = c2;
                }
                output[0] =
                    (sub[a >>> 24] << 24) ^
                        (sub[b >>> 16 & 255] << 16) ^
                        (sub[c >>> 8 & 255] << 8) ^
                        (sub[d & 255]) ^ w[++i];
                output[decrypt ? 3 : 1] =
                    (sub[b >>> 24] << 24) ^
                        (sub[c >>> 16 & 255] << 16) ^
                        (sub[d >>> 8 & 255] << 8) ^
                        (sub[a & 255]) ^ w[++i];
                output[2] =
                    (sub[c >>> 24] << 24) ^
                        (sub[d >>> 16 & 255] << 16) ^
                        (sub[a >>> 8 & 255] << 8) ^
                        (sub[b & 255]) ^ w[++i];
                output[decrypt ? 1 : 3] =
                    (sub[d >>> 24] << 24) ^
                        (sub[a >>> 16 & 255] << 16) ^
                        (sub[b >>> 8 & 255] << 8) ^
                        (sub[c & 255]) ^ w[++i];
            }
            function _createCipher(options) {
                options = options || {};
                var mode = (options.mode || 'CBC').toUpperCase();
                var algorithm = 'AES-' + mode;
                var cipher;
                if (options.decrypt) {
                    cipher = forge.cipher.createDecipher(algorithm, options.key);
                }
                else {
                    cipher = forge.cipher.createCipher(algorithm, options.key);
                }
                var start = cipher.start;
                cipher.start = function (iv, options) {
                    var output = null;
                    if (options instanceof forge.util.ByteBuffer) {
                        output = options;
                        options = {};
                    }
                    options = options || {};
                    options.output = output;
                    options.iv = iv;
                    start.call(cipher, options);
                };
                return cipher;
            }
        }),
        (function (module, exports) {
            var g;
            g = (function () {
                return this;
            })();
            try {
                g = g || Function("return this")() || (1, eval)("this");
            }
            catch (e) {
                if (typeof window === "object")
                    g = window;
            }
            module.exports = g;
        }),
        (function (module, exports) {
            var api = {};
            module.exports = api;
            var _reverseAlphabets = {};
            api.encode = function (input, alphabet, maxline) {
                if (typeof alphabet !== 'string') {
                    throw new TypeError('"alphabet" must be a string.');
                }
                if (maxline !== undefined && typeof maxline !== 'number') {
                    throw new TypeError('"maxline" must be a number.');
                }
                var output = '';
                if (!(input instanceof Uint8Array)) {
                    output = _encodeWithByteBuffer(input, alphabet);
                }
                else {
                    var i = 0;
                    var base = alphabet.length;
                    var first = alphabet.charAt(0);
                    var digits = [0];
                    for (i = 0; i < input.length; ++i) {
                        for (var j = 0, carry = input[i]; j < digits.length; ++j) {
                            carry += digits[j] << 8;
                            digits[j] = carry % base;
                            carry = (carry / base) | 0;
                        }
                        while (carry > 0) {
                            digits.push(carry % base);
                            carry = (carry / base) | 0;
                        }
                    }
                    for (i = 0; input[i] === 0 && i < input.length - 1; ++i) {
                        output += first;
                    }
                    for (i = digits.length - 1; i >= 0; --i) {
                        output += alphabet[digits[i]];
                    }
                }
                if (maxline) {
                    var regex = new RegExp('.{1,' + maxline + '}', 'g');
                    output = output.match(regex).join('\r\n');
                }
                return output;
            };
            api.decode = function (input, alphabet) {
                if (typeof input !== 'string') {
                    throw new TypeError('"input" must be a string.');
                }
                if (typeof alphabet !== 'string') {
                    throw new TypeError('"alphabet" must be a string.');
                }
                var table = _reverseAlphabets[alphabet];
                if (!table) {
                    table = _reverseAlphabets[alphabet] = [];
                    for (var i = 0; i < alphabet.length; ++i) {
                        table[alphabet.charCodeAt(i)] = i;
                    }
                }
                input = input.replace(/\s/g, '');
                var base = alphabet.length;
                var first = alphabet.charAt(0);
                var bytes = [0];
                for (var i = 0; i < input.length; i++) {
                    var value = table[input.charCodeAt(i)];
                    if (value === undefined) {
                        return;
                    }
                    for (var j = 0, carry = value; j < bytes.length; ++j) {
                        carry += bytes[j] * base;
                        bytes[j] = carry & 0xff;
                        carry >>= 8;
                    }
                    while (carry > 0) {
                        bytes.push(carry & 0xff);
                        carry >>= 8;
                    }
                }
                for (var k = 0; input[k] === first && k < input.length - 1; ++k) {
                    bytes.push(0);
                }
                if (typeof Buffer !== 'undefined') {
                    return Buffer.from(bytes.reverse());
                }
                return new Uint8Array(bytes.reverse());
            };
            function _encodeWithByteBuffer(input, alphabet) {
                var i = 0;
                var base = alphabet.length;
                var first = alphabet.charAt(0);
                var digits = [0];
                for (i = 0; i < input.length(); ++i) {
                    for (var j = 0, carry = input.at(i); j < digits.length; ++j) {
                        carry += digits[j] << 8;
                        digits[j] = carry % base;
                        carry = (carry / base) | 0;
                    }
                    while (carry > 0) {
                        digits.push(carry % base);
                        carry = (carry / base) | 0;
                    }
                }
                var output = '';
                for (i = 0; input.at(i) === 0 && i < input.length() - 1; ++i) {
                    output += first;
                }
                for (i = digits.length - 1; i >= 0; --i) {
                    output += alphabet[digits[i]];
                }
                return output;
            }
        })
    ]);
});
//# sourceMappingURL=_forge.aes.js.map
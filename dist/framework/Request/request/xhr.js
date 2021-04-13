"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const has_1 = require("@dojo/framework/has/has");
const Task_1 = require("../async/Task");
const util_1 = require("../util");
const RequestTimeoutError_1 = require("./errors/RequestTimeoutError");
function getStringFromFormData(formData) {
    const fields = [];
    for (const key of formData.keys()) {
        fields.push(encodeURIComponent(key) + '=' + encodeURIComponent(formData.get(key)));
    }
    return fields.join('&');
}
exports.getStringFromFormData = getStringFromFormData;
function createTimer(callback, delay) {
    let timerId = setTimeout(callback, delay);
    return util_1.createHandle(function () {
        if (timerId) {
            clearTimeout(timerId);
            timerId = null;
        }
    });
}
exports.createTimer = createTimer;
const responseTypeMap = {
    arraybuffer: 'arraybuffer',
    blob: 'arraybuffer',
    document: 'document'
};
const noop = function () { };
function stringToArrayBuffer(str) {
    const buf = new ArrayBuffer(str.length * 2);
    const bufView = new Uint8Array(buf);
    for (let i = 0; i < str.length; i++) {
        bufView[i] = str.charCodeAt(i);
    }
    return buf;
}
;
function xhr(url, options = {}) {
    const request = new XMLHttpRequest();
    const requestUrl = util_1.generateRequestUrl(url, options);
    const response = {
        data: null,
        nativeResponse: request,
        requestOptions: options,
        statusCode: null,
        statusText: null,
        url: requestUrl,
        getHeader(name) {
            return request.getResponseHeader(name);
        }
    };
    let isAborted = false;
    function abort() {
        isAborted = true;
        if (request) {
            request.abort();
            request.onreadystatechange = noop;
        }
    }
    const promise = new Task_1.default(function (resolve, reject) {
        if (!options.method) {
            options.method = 'GET';
        }
        if ((!options.user || !options.password) && options.auth) {
            let auth = options.auth.split(':');
            options.user = decodeURIComponent(auth[0]);
            options.password = decodeURIComponent(auth[1]);
        }
        request.open(options.method, requestUrl, !options.blockMainThread, options.user, options.password);
        if (has_1.default('xhr2') && options.responseType && options.responseType in responseTypeMap) {
            request.responseType = responseTypeMap[options.responseType];
        }
        let timeoutHandle;
        request.onreadystatechange = function () {
            if (!isAborted && request.readyState === 4) {
                request.onreadystatechange = noop;
                timeoutHandle && timeoutHandle.destroy();
                if (options.responseType === 'xml') {
                    response.data = request.responseXML;
                }
                else {
                    response.data = ('response' in request) ? request.response : request.responseText;
                    if (options.responseType === 'arraybuffer' && typeof response.data === 'string' && has_1.default('arraybuffer')) {
                        response.data = stringToArrayBuffer(response.data);
                    }
                }
                response.statusCode = request.status;
                response.statusText = request.statusText;
                if (response.statusCode > 0 && response.statusCode < 400) {
                    resolve(response);
                }
                else {
                    reject(response.statusText ?
                        new Error(response.statusText) :
                        new Error('An error prevented completion of the request.'));
                }
            }
        };
        if (options.timeout > 0 && options.timeout !== Infinity) {
            timeoutHandle = createTimer(function () {
                reject(new RequestTimeoutError_1.default('The XMLHttpRequest request timed out.'));
                abort();
            }, options.timeout);
        }
        const headers = options.headers;
        let hasContentTypeHeader = false;
        let hasRequestedWithHeader = false;
        if (headers) {
            for (let header in headers) {
                if (header.toLowerCase() === 'content-type') {
                    hasContentTypeHeader = true;
                }
                else if (header.toLowerCase() === 'x-requested-with') {
                    hasRequestedWithHeader = true;
                }
                request.setRequestHeader(header, headers[header]);
            }
        }
        if (!hasRequestedWithHeader) {
            request.setRequestHeader('X-Requested-With', 'XMLHttpRequest');
        }
        if (!hasContentTypeHeader && has_1.default('formdata') && options.data instanceof (global || window).FormData) {
            request.setRequestHeader('Content-Type', 'application/x-www-form-urlencoded');
        }
        if (options.responseType === 'xml' && request.overrideMimeType) {
            request.overrideMimeType('text/xml');
        }
        request.send(options.data);
    }, function () {
        abort();
    });
    return promise;
}
exports.default = xhr;
//# sourceMappingURL=xhr.js.map
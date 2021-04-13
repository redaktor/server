"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const Task_1 = require("../async/Task");
const RequestTimeoutError_1 = require("./errors/RequestTimeoutError");
const RequestMaxRedirectsError_1 = require("./errors/RequestMaxRedirectsError");
const http = require("http");
const https = require("https");
const util_1 = require("../util");
const ReadableNodeStreamSource_1 = require("../streams/adapters/ReadableNodeStreamSource");
const WritableNodeStreamSink_1 = require("../streams/adapters/WritableNodeStreamSink");
const ReadableStream_1 = require("../streams/ReadableStream");
const WritableStream_1 = require("../streams/WritableStream");
const urlUtil = require("url");
const zlib = require("zlib");
const url_1 = require("../../url");
let version = '2.0.0-pre';
function node(url, options = {}) {
    options = Object.assign({ maxRedirects: 5 }, options);
    const requestUrl = util_1.generateRequestUrl(url, options);
    const parsedUrl = urlUtil.parse(options.proxy || requestUrl);
    const requestOptions = {
        agent: options.agent,
        auth: parsedUrl.auth || options.auth,
        body: options.data,
        ca: options.ca,
        cert: options.cert,
        ciphers: options.ciphers,
        host: parsedUrl.host,
        hostname: parsedUrl.hostname,
        key: options.key,
        localAddress: options.localAddress,
        method: options.method ? options.method.toUpperCase() : 'GET',
        passphrase: options.passphrase,
        path: parsedUrl.path,
        pfx: options.pfx,
        port: Number(parsedUrl.port),
        rejectUnauthorized: options.rejectUnauthorized,
        secureProtocol: options.secureProtocol,
        socketPath: options.socketPath
    };
    requestOptions.headers = options.headers || {};
    if (!Object.keys(requestOptions.headers).map(headerName => headerName.toLowerCase()).some(headerName => headerName === 'user-agent')) {
        requestOptions.headers['user-agent'] = 'dojo/' + version + ' Node.js/' + process.version.replace(/^v/, '');
    }
    if (options.proxy) {
        requestOptions.path = requestUrl;
        if (parsedUrl.auth) {
            requestOptions.headers['proxy-authorization'] = 'Basic ' + new Buffer(parsedUrl.auth).toString('base64');
        }
        let _parsedUrl = urlUtil.parse(requestUrl);
        if (_parsedUrl.host) {
            requestOptions.headers['host'] = _parsedUrl.host;
        }
        requestOptions.auth = _parsedUrl.auth || options.auth;
    }
    if (!options.auth && (options.user || options.password)) {
        requestOptions.auth = encodeURIComponent(options.user || '') + ':' + encodeURIComponent(options.password || '');
    }
    const request = parsedUrl.protocol === 'https:' ? https.request(requestOptions) : http.request(requestOptions);
    const response = {
        data: null,
        getHeader: function (name) {
            return (this.nativeResponse && this.nativeResponse.headers[name.toLowerCase()]) || null;
        },
        requestOptions: options,
        statusCode: null,
        url: requestUrl
    };
    const promise = new Task_1.default(function (resolve, reject) {
        if (options.socketOptions) {
            if (options.socketOptions.timeout) {
                request.setTimeout(options.socketOptions.timeout);
            }
            if ('noDelay' in options.socketOptions) {
                request.setNoDelay(options.socketOptions.noDelay);
            }
            if ('keepAlive' in options.socketOptions) {
                const initialDelay = options.socketOptions.keepAlive;
                request.setSocketKeepAlive(initialDelay >= 0, initialDelay);
            }
        }
        let timeout;
        request.once('response', function (nativeResponse) {
            response.nativeResponse = nativeResponse;
            response.statusCode = nativeResponse.statusCode;
            if (response.statusCode >= 300 &&
                response.statusCode < 400 &&
                response.statusCode !== 304 &&
                options.followRedirects !== false &&
                nativeResponse.headers.location) {
                const u = url_1.default.parse(nativeResponse.headers.location);
                const redirectUrl = (!u.host || !u.protocol) ?
                    url_1.default.resolve(response.url, u.originalUrl) : u.originalUrl;
                if (options['debug']) {
                    console.log('REDIRECT!');
                    console.log(response.statusCode, '  ', response.url, ':', redirectUrl);
                }
                if (!Array.isArray(options.redirects)) {
                    options.redirects = [];
                }
                options.redirects.push(redirectUrl);
                if (options.headers && options.headers['host'] && requestOptions.host) {
                    options.headers['host'] = requestOptions.host;
                }
                if (options.redirects.length > options.maxRedirects) {
                    const error = new RequestMaxRedirectsError_1.default('Request created more than ' + options.maxRedirects + ' redirects');
                    error.response = response;
                    reject(error);
                    return;
                }
                if (options['debug']) {
                    var debugMsg = response.statusCode + ' ' +
                        (response.nativeResponse.statusMessage || '') +
                        ' > ' + redirectUrl;
                    console.log('\x1b[33m%s\x1b[0m: ', debugMsg);
                }
                ;
                resolve(node(redirectUrl, options));
                return;
            }
            options.streamEncoding && nativeResponse.setEncoding(options.streamEncoding);
            if (options.streamTarget) {
                const responseSource = new ReadableNodeStreamSource_1.default(nativeResponse);
                const responseReadableStream = new ReadableStream_1.default(responseSource);
                responseReadableStream.pipeTo(options.streamTarget)
                    .then(function () {
                    resolve(response);
                }, function (error) {
                    if (options.streamTarget) {
                        options.streamTarget.abort(error);
                    }
                    request.abort();
                    error.response = response;
                    reject(error);
                });
            }
            let data;
            let loaded;
            if (!options.streamData) {
                data = [];
                loaded = 0;
                nativeResponse.on('data', function (chunk) {
                    data.push(chunk);
                    loaded += (typeof chunk === 'string') ?
                        Buffer.byteLength(chunk, options.streamEncoding) :
                        chunk.length;
                });
            }
            nativeResponse.once('end', function () {
                timeout && timeout.destroy();
                if (!options.streamData) {
                    response.data = (options.streamEncoding ? data.join('') : Buffer.concat(data, loaded));
                }
                const contentEncoding = nativeResponse.headers['content-encoding'];
                if (contentEncoding === 'gzip' || contentEncoding === 'deflate') {
                    const cMethod = (contentEncoding === 'gzip') ? 'gunzip' : 'inflate';
                    zlib[cMethod](response.data, function (err, decodedResponse) {
                        if (err) {
                            reject(err);
                        }
                        response.data = decodedResponse;
                        resolve(response);
                    });
                }
                else if (!options.streamTarget) {
                    resolve(response);
                }
                else {
                    options.streamTarget.close();
                }
            });
        });
        request.once('error', reject);
        if (options.data) {
            if (options.data instanceof ReadableStream_1.default) {
                const requestSink = new WritableNodeStreamSink_1.default(request);
                const writableRequest = new WritableStream_1.default(requestSink);
                options.data.pipeTo(writableRequest)
                    .catch(function (error) {
                    error.response = response;
                    writableRequest.abort(error);
                    reject(error);
                });
            }
            else {
                request.end(options.data);
            }
        }
        else {
            request.end();
        }
        if (options.timeout > 0 && options.timeout !== Infinity) {
            timeout = (function () {
                const timer = setTimeout(function () {
                    const error = new RequestTimeoutError_1.default('Request timed out after ' + options.timeout + 'ms');
                    error.response = response;
                    reject(error);
                }, options.timeout);
                return util_1.createHandle(function () {
                    clearTimeout(timer);
                });
            })();
        }
    }, function () {
        request.abort();
    }).catch(function (error) {
        let parsedUrl = urlUtil.parse(url);
        if (parsedUrl.auth) {
            parsedUrl.auth = '(redacted)';
        }
        let sanitizedUrl = urlUtil.format(parsedUrl);
        error.message = '[' + requestOptions.method + ' ' + sanitizedUrl + '] ' + error.message;
        throw error;
    });
    return promise;
}
exports.default = node;
//# sourceMappingURL=node.js.map
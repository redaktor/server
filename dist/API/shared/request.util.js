"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
function request(url, postData) {
    return new Promise((resolve, reject) => {
        const lib = url.startsWith('https') ? require('https') : require('http');
        if (typeof postData !== 'undefined') {
            if (typeof postData === 'object') {
                postData = JSON.stringify(postData);
            }
            const U = new URL(url);
            const req = lib.request({
                hostname: U.hostname,
                port: U.port,
                path: U.pathname,
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Content-Length': Buffer.byteLength(postData)
                }
            }, (res) => {
                res.setEncoding('utf8');
                res.on('end', () => {
                    resolve(res);
                });
                res.on('data', (chunk) => { console.log(`BODY: ${chunk}`); });
            });
            req.on('error', (e) => {
                Object.assign(e, { details: `Could not post to localhost:${U.port} !
          You may have forgotten to start a second server with this demo` });
                reject(e);
            });
            req.write(postData);
            req.end();
            return;
        }
        const request = lib.get(url, (res) => {
            const { statusCode, headers } = res;
            const contentType = res.headers['content-type'];
            if (statusCode < 200 || statusCode > 299) {
                reject(new Error('Failed to load page, status code: ' + statusCode));
            }
            const body = [];
            res.setEncoding('utf8');
            res.on('data', (chunk) => body.push(chunk));
            res.on('end', () => resolve(body.join('')));
        });
        request.on('error', (err) => reject(err));
    });
}
exports.default = request;
;
//# sourceMappingURL=request.util.js.map
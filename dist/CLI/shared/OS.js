"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const net = require("net");
async function findFreePorts(start, end = 65534, count = 1, ip = '127.0.0.1') {
    typeof start !== 'number' ? start = 1 : start = Math.max(1, Math.min(65533, start));
    typeof end !== 'number' ? end = 65534 : end = Math.max(start, end);
    typeof count !== 'number' ? count = 1 : count = Math.max(1, Math.min((end - start), count));
    return new Promise((resolve, reject) => {
        const res = [];
        const check = (port) => {
            if (res.length === count) {
                return resolve(res);
            }
            if (port === end) {
                return res.length === count ? resolve(res) : reject(res);
            }
            const s = net.createConnection({ port: port, host: ip });
            s.on('connect', () => {
                s.end();
                setImmediate(() => check(port + 1));
            });
            s.on('error', () => {
                res.push(port);
                setImmediate(() => check(port + 1));
            });
        };
        check(start);
    });
}
exports.default = findFreePorts;
function scanPort(port, ip = '127.0.0.1') {
    if (typeof port === 'string') {
        port = parseInt(port);
    }
    const socket = new net.Socket();
    let status = 'closed';
    return new Promise(function (resolve) {
        socket.on('connect', function () { status = 'open'; socket.destroy(); });
        socket.setTimeout(500);
        socket.on('timeout', function () { status = 'closed'; socket.destroy(); });
        socket.on('error', function () { status = 'closed'; });
        socket.on('close', function () { resolve(status); });
        socket.connect(port, ip);
    });
}
exports.scanPort = scanPort;
//# sourceMappingURL=OS.js.map
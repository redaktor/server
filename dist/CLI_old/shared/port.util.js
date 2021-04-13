"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const net = require("net");
const { config } = require('../../../package.json');
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
            if (port > end) {
                return (res.length === count ? resolve(res) : reject(res));
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
    const socket = new net.Socket();
    let status = 'closed';
    return new Promise(function (resolve) {
        socket.on('connect', function () { status = 'open'; socket.destroy(); });
        socket.setTimeout(500);
        socket.on('timeout', function () { status = 'closed'; socket.destroy(); });
        socket.on('error', function () { status = 'closed'; });
        socket.on('close', function () { resolve(status); });
        socket.connect(typeof port === 'number' ? port : parseInt(port), ip);
    });
}
exports.scanPort = scanPort;
exports.CURRENT_PORT = 0;
exports.PORTS = Array.isArray(config.ports) && config.ports.length > 1 ?
    config.ports.slice(0, 2) : [3000, 3001];
const FRIENDS = { [exports.PORTS[0]]: exports.PORTS[1], [exports.PORTS[1]]: exports.PORTS[0] };
async function getPort() {
    if (!!exports.CURRENT_PORT) {
        return exports.CURRENT_PORT;
    }
    const PORT = await findFreePorts(exports.PORTS[0], exports.PORTS[1], 1);
    exports.CURRENT_PORT = PORT[0];
    return exports.CURRENT_PORT;
}
exports.getPort = getPort;
async function getFriendsPort() {
    const PORT = await getPort();
    return FRIENDS[PORT];
}
exports.getFriendsPort = getFriendsPort;
//# sourceMappingURL=port.util.js.map
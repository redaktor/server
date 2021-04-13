import * as OS from 'os';
import * as net from 'net';

export default async function findFreePorts(
  start: number, end: number = 65534, count: number = 1, ip: string = '127.0.0.1'
) {
  // TODO @API / JSON Schema
  typeof start !== 'number' ? start = 1 : start = Math.max(1, Math.min(65533, start));
  typeof end !== 'number' ? end = 65534 : end = Math.max(start, end);
  typeof count !== 'number' ? count = 1 : count = Math.max(1, Math.min((end - start), count));
  return new Promise((resolve, reject) => {
    const res: number[] = [];
    const check = (port: number) => {
      if (res.length === count) { return resolve(res) }
      if (port === end) { return res.length === count ? resolve(res) : reject(res) }
      const s = net.createConnection({port: port, host: ip})
      s.on('connect', () => { // port is NOT FREE
        s.end();
        setImmediate(() => check(port + 1));
      });
      s.on('error',  () => { // port is FREE
        res.push(port);
        setImmediate(() => check(port + 1));
      })
    };
    check(start)
  })
}
export function scanPort(port: number|string, ip: string = '127.0.0.1') {
  if (typeof port === 'string') { port = parseInt(port); }
  const socket = new net.Socket();
  let status = 'closed';
  return new Promise(function(resolve/*, reject*/) {
    socket.on('connect', function () { status = 'open'; socket.destroy(); });
    socket.setTimeout(500);
    socket.on('timeout', function () { status = 'closed'; socket.destroy(); });
    socket.on('error', function () { status = 'closed'; });
    socket.on('close', function () { resolve(status); });
    socket.connect((<number>port), ip);
  });
}

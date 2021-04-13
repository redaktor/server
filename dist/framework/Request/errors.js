"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.ErrorMessages = [
    'FileNotFoundError: The file was not found where specified ...',
    'FileAccessError: During a file-access or disk-access operation we could not ' +
        'make a connection between the path and the file name.',
    'EOFError: Either we could not parse the End of File (e.g a forgotten ending ' +
        'curly brace for a block of code) or there was no data.',
    'UnknownHostError: The destination computer (host server name) cannot be resolved.',
    'SocketError: A socket-related error occured.',
    'ProtocolError: The received answer of the server was complete but there was a ' +
        'protocol error, e.g. CA certs and node: https://github.com/nodejs/node/issues/2244',
    'FileSystemError: Please repair your FileSystem.',
    'ConnectError: There is an error with the connection. Usually an error of the host server.',
    'BindError: When the allowed connections are exhausted, you get this error when trying ' +
        'to make any new connections.',
    'AddressNotFoundError: This address could not be found.',
    'NetworkError: You were somehow offline when accessing the URL.'
];
exports.Errors = {
    ENOENT: 0,
    EACCES: 1, EPERM: 1,
    EOF: 2,
    EADDRINFO: 3,
    EISCONN: 4, ENOTCONN: 4, ENOTSOCK: 4, ENOTSUP: 4, EAIFAMNOSUPPORT: 4, EAISERVICE: 4,
    EPROTO: 5, EPROTONOSUPPORT: 5, EPROTOTYPE: 5,
    EBUSY: 6, EAGAIN: 6, EBADF: 6, EMFILE: 6, ENOTDIR: 6, EISDIR: 6, EEXIST: 6, ENAMETOOLONG: 6, ELOOP: 6,
    ENOTEMPTY: 6, ENOSPC: 6, EIO: 6, EROFS: 6, ENODEV: 6, ESPIPE: 6, ECANCELED: 6, ENFILE: 6, EXDEV: 6,
    ECONNABORTED: 7, ECONNREFUSED: 7, ECONNRESET: 7, ETIMEDOUT: 7,
    EADDRNOTAVAIL: 8,
    ENOTFOUND: 9,
    EAFNOSUPPORT: 10, EALREADY: 10, EDESTADDRREQ: 10, EHOSTUNREACH: 10, EMSGSIZE: 10,
    ENETDOWN: 10, ENETUNREACH: 10, ENONET: 10, EPIPE: 10, EAISOCKTYPE: 10, ESHUTDOWN: 10
};
function getErrorMessage(eConstant) {
    return exports.ErrorMessages[exports.Errors[eConstant]];
}
exports.default = getErrorMessage;
//# sourceMappingURL=errors.js.map
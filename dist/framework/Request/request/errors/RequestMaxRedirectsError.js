"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
class RequestMaxRedirectsError {
    constructor(message) {
        this.message = message || 'The request created too many redirects.';
    }
    get name() {
        return 'RequestMaxRedirectsError';
    }
}
exports.default = RequestMaxRedirectsError;
//# sourceMappingURL=RequestMaxRedirectsError.js.map
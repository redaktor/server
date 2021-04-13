"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
class RequestTimeoutError {
    constructor(message) {
        this.message = message || 'The request timed out.';
    }
    get name() {
        return 'RequestTimeoutError';
    }
}
exports.default = RequestTimeoutError;
//# sourceMappingURL=RequestTimeoutError.js.map
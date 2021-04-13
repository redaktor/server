"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const Promise_1 = require("@dojo/framework/shim/Promise");
function pipeToStream(response, stream) {
    return new Promise_1.default((resolve) => {
        response.data.subscribe({
            next: chunk => {
                stream.write(chunk);
            },
            error: error => {
                stream.abort(error);
            },
            complete: () => {
                stream.close();
                resolve(stream);
            }
        });
        if ('downloadBody' in response) {
            response.downloadBody = false;
        }
    });
}
exports.default = pipeToStream;
//# sourceMappingURL=pipeToStream.js.map
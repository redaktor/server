"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const crypto_1 = require("./crypto");
function uuid4() {
    return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function (c) {
        const r = (Math.random() * 16) | 0, v = c === 'x' ? r : (r & 0x3) | 0x8;
        return v.toString(16);
    });
}
exports.uuid4 = uuid4;
function uuid(v5name) {
    if (typeof v5name === 'string') {
        let h = crypto_1.default.hash(v5name, 'sha1', 'buffer');
        h[8] = h[8] & 0x3f | 0xa0;
        h[6] = h[6] & 0x0f | 0x50;
        return (h.toString('hex', 0, 16).match(/.{1,8}/g) || []).join('-');
    }
    return uuid4();
}
exports.default = uuid;
function nonce(lengthOrMin = 64, maxLength) {
    let length = lengthOrMin;
    if (!!maxLength && typeof maxLength === 'number') {
        length = Math.round(Math.random() * (maxLength - lengthOrMin) + lengthOrMin);
        return crypto_1.default.randomBytes(length).toString('base64')
            .substring(0, length).replace(/[^\w]/g, '');
    }
    return crypto_1.default.randomBytes(length).toString('base64').replace(/[^\w]/g, '');
}
exports.nonce = nonce;
//# sourceMappingURL=uuid.js.map
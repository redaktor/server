"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const uuid_1 = require("../../dojo/core/uuid");
const main_1 = require("../crypto/main");
function uuid(str) {
    if (typeof str === 'string') {
        let h = main_1.default.hash(str, 'sha1', 'buffer');
        h[8] = h[8] & 0x3f | 0xa0;
        h[6] = h[6] & 0x0f | 0x50;
        return h.toString('hex', 0, 16).match(/.{1,8}/g).join('-');
    }
    else {
        return uuid_1.default();
    }
}
exports.uuid = uuid;
function nonce(lengthOrMin = 64, maxLength) {
    let length = lengthOrMin;
    if (!!maxLength && typeof maxLength === 'number') {
        length = Math.round(Math.random() * (maxLength - lengthOrMin) + lengthOrMin);
    }
    return main_1.default.randomBytes(length).toString('base64').replace(/[^\w]/g, '');
}
exports.nonce = nonce;
//# sourceMappingURL=unique.js.map
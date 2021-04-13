"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const locales = {
    de: () => Promise.resolve().then(() => require('./de'))
};
const messages = {
    codeName: 'GPG message',
    messageForm: 'GPG - Sign this token with your private key',
    missingProp: 'Missing property:',
    missingKey: 'Missing public key: No GPG public key found',
    rejected: 'The GPG signature did not match !'
};
exports.default = { locales, messages };
//# sourceMappingURL=index.js.map
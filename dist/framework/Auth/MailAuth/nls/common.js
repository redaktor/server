"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const main_1 = require("@dojo/framework/has/main");
const bundlePath = ((main_1.default('host-node') ? __dirname : 'src/Auth/MailAuth/nls') + '/common');
const locales = ['de'];
const messages = {
    codeName: 'Verification Token',
    messageSubject: '_{iss} _{codeName}',
    messageHeader: 'Did you want to sign in with _{iss} ?',
    messageBody: 'If you just wanted to sign in with _{iss}, this is your token :',
    messageAsText: '[token as text] : ',
    messageValid: 'This _{codeName} is valid until _{exp}',
    messageFooter: 'Copyright &copy; people of the IndieWeb.',
    messageForm: 'We have sent you a mail.<br>Enter the _{codeName}',
    messageFormValid: 'Du hast Zeit bis _{exp}',
    messageFormRemain: '_{sec} seconds remain',
    messageFormExpired: 'The challenge is expired.',
    messageFormSubmitted: 'Checking the _{codeName} ...',
    missingProp: 'Missing property:',
    missingTo: 'Missing recipient: No "to" or "req.query.authorize" found',
    rejected: 'The eMail was rejected !'
};
exports.default = { bundlePath, locales, messages };
//# sourceMappingURL=common.js.map